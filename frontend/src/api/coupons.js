import api from './index'

export const couponsAPI = {
  getCoupons: () => api.get('/coupons/'),
  getCoupon: (code) => api.get(`/coupons/${code}/`),
  applyCoupon: (data) => api.post('/coupons/apply/', data),
  getCouponUsage: () => api.get('/coupons/usage/'),
  
  // Admin
  createCoupon: (data) => api.post('/coupons/admin/', data),
  updateCoupon: (code, data) => api.put(`/coupons/admin/${code}/`, data),
  deleteCoupon: (code) => api.delete(`/coupons/admin/${code}/`),
}