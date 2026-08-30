import api from './index'

export const paymentsAPI = {
  initiatePayment: (data) => api.post('/payments/initiate/', data),
  verifyPayment: (data) => api.post('/payments/verify/', data),
  getPayments: () => api.get('/payments/'),
  getPayment: (id) => api.get(`/payments/${id}/`),
  
  // Admin
  processCashPayment: (orderNumber) => 
    api.post(`/payments/cash/${orderNumber}/`),
}