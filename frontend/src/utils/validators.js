/**
 * Validation utilities for EM BABU THINNAVA frontend
 */

export const validatePhone = (phone) => {
  // Accepts 10-digit Indian phone numbers
  const cleaned = String(phone).replace(/\D/g, '')
  const phoneRegex = /^[6-9]\d{9}$/
  if (!cleaned) return 'Phone number is required.'
  if (!phoneRegex.test(cleaned)) return 'Please enter a valid 10-digit mobile number.'
  return null
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email address is required.'
  if (!emailRegex.test(email)) return 'Please enter a valid email address.'
  return null
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return null
}

export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/
  if (!otp) return 'OTP is required.'
  if (!otpRegex.test(otp)) return 'OTP must be a 6-digit number.'
  return null
}

export const validateRequired = (val, fieldName = 'This field') => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `${fieldName} is required.`
  }
  return null
}
