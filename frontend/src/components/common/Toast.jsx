import React from 'react'
import { Toaster, toast } from 'react-hot-toast'

export const CustomToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#2d251e',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          border: '1px solid #e7ded4',
        },
      }}
    />
  )
}

export const showSuccessToast = (msg) => toast.success(msg)
export const showErrorToast = (msg) => toast.error(msg)
export const showInfoToast = (msg) => toast(msg, { icon: 'ℹ️' })

export default CustomToastContainer
