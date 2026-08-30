/**
 * Helper utility functions for EM BABU THINNAVA
 */

export const formatCurrency = (amount) => {
  const numericVal = parseFloat(amount) || 0
  return `₹${numericVal.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return `${formatDate(dateString)} at ${formatTime(dateString)}`
}

export const getFoodTypeBadge = (foodType) => {
  if (foodType === 'veg') return { label: '🟢 VEG', color: 'bg-green-100 text-green-800 border-green-300' }
  if (foodType === 'non_veg') return { label: '🔴 NON-VEG', color: 'bg-red-100 text-red-800 border-red-300' }
  return { label: '🟡 BOTH', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
}

export const getOrderStatusColor = (status) => {
  const map = {
    placed: 'bg-blue-100 text-blue-800 border-blue-300',
    accepted: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    preparing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ready: 'bg-mustard-100 text-earth-800 border-mustard-400',
    out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (typeof imagePath !== 'string') return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const backendBase = apiBase.replace(/\/api\/?$/, '')
  return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

