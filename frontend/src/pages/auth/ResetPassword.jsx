import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle } from 'lucide-react'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'
import AnimatedPage from '../../components/animations/AnimatedPage'
import { validatePassword } from '../../utils/validators'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validatePassword(password)
    if (error) {
      toast.error(error)
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      await authAPI.resetPassword({ token, new_password: password })
      toast.success('Password reset successfully! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-earth-100 p-8 shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-mustard-100 text-mustard-700 mx-auto flex items-center justify-center mb-3">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-earth-900">Reset Password</h2>
          <p className="text-sm text-earth-500 mt-1">Enter your new secure password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-earth-600 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-mustard-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-mustard-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Resetting...' : 'Confirm Reset'} <CheckCircle size={18} />
          </button>
        </form>
      </div>
    </AnimatedPage>
  )
}

export default ResetPassword
