import api from './index'

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  
  requestOTP: (data) => api.post('/auth/otp/request/', data),
  verifyOTP: (data) => api.post('/auth/otp/verify/', data),
  
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  
  getAdminProfile: () => api.get('/auth/admin-profile/'),
  updateAdminProfile: (data) => {
    if (data instanceof FormData) {
      return api.put('/auth/admin-profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.put('/auth/admin-profile/', data)
  },
  
  getCustomerProfile: () => api.get('/auth/customer-profile/'),
  updateCustomerProfile: (data) => {
    if (data instanceof FormData) {
      return api.put('/auth/customer-profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.put('/auth/customer-profile/', data)
  },
  
  changePassword: (data) => api.post('/auth/change-password/', data),
}