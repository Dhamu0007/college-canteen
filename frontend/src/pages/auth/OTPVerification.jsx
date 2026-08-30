import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, ArrowRight } from 'lucide-react'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'
import AnimatedPage from '../../components/animations/AnimatedPage'
import { validateOTP } from '../../utils/validators'

const OTPVerification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || ''

  const [devOtp, setDevOtp] = useState(location.state?.dev_otp || '')

  const handleResend = async () => {
    if (!phone) {
      toast.error('Phone number missing')
      return
    }
    try {
      setLoading(true)
      const res = await authAPI.requestOTP({ phone_number: phone, otp_type: 'phone' })
      const data = res.data
      toast.success(data?.message || 'OTP resent!')
      if (data?.dev_otp) {
        setDevOtp(data.dev_otp)
        setOtp(data.dev_otp)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validateOTP(otp)
    if (error) {
      toast.error(error)
      return
    }

    try {
      setLoading(true)
      await authAPI.verifyOTP({ phone_number: phone, otp, otp_type: 'phone' })
      toast.success('Verification successful! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-earth-100 p-8 shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-mustard-100 text-mustard-700 mx-auto flex items-center justify-center mb-3">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-bold text-earth-900">OTP Verification</h2>
          <p className="text-sm text-earth-500 mt-1">
            Enter the 6-digit code sent to {phone || 'your registered phone number'}
          </p>
        </div>

        {devOtp && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <strong>Dev Mode:</strong> Test OTP is <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-sm font-bold">{devOtp}</code>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-earth-600 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-3 text-center tracking-widest text-2xl font-mono rounded-xl border border-earth-300 focus:border-mustard-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={18} />
          </button>

          {phone && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-mustard-600 font-medium hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}
        </form>
      </div>
    </AnimatedPage>
  )
}

export default OTPVerification
