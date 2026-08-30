import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(formData.username, formData.password)
    if (result.success) {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen traditional-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 opacity-10 animate-float pointer-events-none"><img src="/logo.png" alt="" className="w-full h-full object-cover rounded-3xl" /></div>
        <div className="absolute bottom-20 right-10 text-8xl opacity-5 animate-float animation-delay-300">🥘</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-traditional p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="w-20 h-20 mx-auto mb-3">
                <img src="/logo.png" alt="EM BABU THINNAVA" className="w-full h-full object-cover rounded-2xl shadow-lg border border-amber-400/30" />
              </div>
              <h1 className="text-2xl font-display font-bold text-earth-800">
                <span className="text-mustard-600">EM BABU</span> THINNAVA?
              </h1>
            </Link>
            <p className="text-earth-500 mt-2">Welcome back! 👋</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-traditional pl-10"
                  placeholder="Enter username or email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-traditional pl-10 pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-earth-600">
                <input type="checkbox" className="rounded border-earth-300 text-mustard-500" />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-mustard-600 hover:text-mustard-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-mustard-500 hover:bg-mustard-600 text-earth-800 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Login <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-earth-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-mustard-600 hover:text-mustard-700 font-semibold">
                Register
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-earth-50 rounded-xl border border-earth-200">
            <p className="text-xs text-earth-500 text-center">
              Demo: customer / customer123
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-earth-100 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-earth-500 hover:text-mustard-600 font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-mustard-600" />
              Staff / Admin Portal Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login