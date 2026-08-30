import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../api/auth'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Verify token and get user
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
        setIsAuthenticated(true)
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password })
      const { tokens, user } = response.data
      
      localStorage.setItem('accessToken', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      setIsAuthenticated(true)
      toast.success('Welcome back! 👋')
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Login failed'
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const register = async (data) => {
    try {
      const response = await authAPI.register(data)
      const { tokens, user } = response.data
      
      localStorage.setItem('accessToken', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      setIsAuthenticated(true)
      toast.success('Registration successful! ✨')
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed'
      toast.error(errorMsg)
      return { success: false, error: error.response?.data }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.clear()
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
      window.location.href = '/'
    }
  }

  const requestOTP = async (data) => {
    try {
      const response = await authAPI.requestOTP(data)
      toast.success('OTP sent successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP')
      return { success: false, error: error.response?.data?.error }
    }
  }

  const verifyOTP = async (data) => {
    try {
      const response = await authAPI.verifyOTP(data)
      toast.success('OTP verified successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP')
      return { success: false, error: error.response?.data?.error }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email)
      toast.success('OTP sent to your email!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP')
      return { success: false }
    }
  }

  const resetPassword = async (data) => {
    try {
      await authAPI.resetPassword(data)
      toast.success('Password reset successfully!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password')
      return { success: false }
    }
  }

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    })
  }

  const value = {
    user,
    setUser,
    updateUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    requestOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}