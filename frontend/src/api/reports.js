import api from './index'

export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard/'),
  getRevenueReport: (params) => api.get('/reports/revenue/', { params }),
  getProductPerformance: () => api.get('/reports/products/'),
}