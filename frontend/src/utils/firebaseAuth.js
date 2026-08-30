import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../config/firebase'

let recaptchaVerifierInstance = null

export const initRecaptcha = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') return null

  const el = document.getElementById(containerId)
  if (!el) {
    console.warn(`reCAPTCHA container #${containerId} not found in DOM`)
    return null
  }

  try {
    if (recaptchaVerifierInstance) {
      try {
        recaptchaVerifierInstance.clear()
      } catch (e) {
        // ignore clear error
      }
      recaptchaVerifierInstance = null
    }

    recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        try {
          if (recaptchaVerifierInstance) recaptchaVerifierInstance.clear()
        } catch (e) {}
        recaptchaVerifierInstance = null
      }
    })

    return recaptchaVerifierInstance
  } catch (error) {
    console.error('reCAPTCHA initialization error:', error)
    return null
  }
}

export const sendFirebaseOTP = async (phoneNumber, containerId = 'recaptcha-container') => {
  try {
    const rawPhone = phoneNumber.replace(/\D/g, '')
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : rawPhone.length === 10 ? `+91${rawPhone}` : `+${rawPhone}`

    const verifier = initRecaptcha(containerId)
    if (!verifier) {
      throw new Error('reCAPTCHA container not ready in DOM')
    }

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier)
    return { success: true, confirmationResult }
  } catch (error) {
    console.error('Firebase Phone Auth Error:', error)
    let userMsg = error.message || 'Failed to send Firebase OTP'
    if (error.code === 'auth/operation-not-allowed') {
      userMsg = 'Phone auth is not enabled in Firebase Console (Sign-in method > Phone).'
    } else if (error.code === 'auth/invalid-phone-number') {
      userMsg = 'Invalid phone number format. Please enter a valid 10-digit number.'
    } else if (error.code === 'auth/captcha-check-failed') {
      userMsg = 'reCAPTCHA check failed. Please refresh and try again.'
    } else if (error.code === 'auth/quota-exceeded') {
      userMsg = 'Firebase SMS quota exceeded for today.'
    }
    return { success: false, error: userMsg, code: error.code }
  }
}

export const verifyFirebaseOTP = async (confirmationResult, otpCode) => {
  try {
    const result = await confirmationResult.confirm(otpCode)
    const idToken = await result.user.getIdToken()
    return { success: true, idToken, user: result.user }
  } catch (error) {
    console.error('Firebase OTP Verification Error:', error)
    let userMsg = 'Invalid OTP code'
    if (error.code === 'auth/invalid-verification-code') {
      userMsg = 'Incorrect 6-digit OTP code. Please check and re-enter.'
    } else if (error.code === 'auth/code-expired') {
      userMsg = 'OTP code has expired. Please request a new OTP.'
    }
    return { success: false, error: userMsg, code: error.code }
  }
}
