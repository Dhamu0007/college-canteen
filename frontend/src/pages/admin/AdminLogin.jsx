import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, LogIn, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import AnimatedPage from '../../components/animations/AnimatedPage'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Please enter username and password.')
      return
    }

    try {
      setLoading(true)
      const res = await login(username, password)
      if (res?.success) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (storedUser?.user_type !== 'admin' && storedUser?.user_type !== 'staff' && !storedUser?.is_staff) {
          toast.error('Access denied. Account does not have admin privileges.')
          logout()
          return
        }
        toast.success('Admin login successful! Welcome back.')
        navigate('/admin')
      }
    } catch (err) {
      toast.error('Failed to log in as admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-earth-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border border-earth-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-mustard-500 text-earth-900 mx-auto flex items-center justify-center mb-3 shadow-md">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-earth-900">Admin Portal</h2>
          <p className="text-sm text-earth-500 mt-1">EM BABU THINNAVA? Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Username / Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-mustard-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-mustard-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Login to Console'} <LogIn size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-earth-500 hover:text-earth-800 flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} /> Back to Canteen Front
          </button>
        </div>
      </div>
    </AnimatedPage>
  )
}

export default AdminLogin
