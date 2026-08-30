import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'
import AnimatedPage from '../../components/animations/AnimatedPage'
import { validateEmail } from '../../utils/validators'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validateEmail(email)
    if (error) {
      toast.error(error)
      return
    }

    try {
      setLoading(true)
      await authAPI.forgotPassword({ email })
      toast.success('Password reset link sent to your email!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request password reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-earth-100 p-8 shadow-xl max-w-md w-full">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-earth-500 hover:text-earth-800 mb-4">
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-mustard-100 text-mustard-700 mx-auto flex items-center justify-center mb-3">
            <Mail size={28} />
          </div>
          <h2 className="text-2xl font-bold text-earth-900">Forgot Password</h2>
          <p className="text-sm text-earth-500 mt-1">
            Enter your email address and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-mustard-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'} <Send size={16} />
          </button>
        </form>
      </div>
    </AnimatedPage>
  )
}

export default ForgotPassword
