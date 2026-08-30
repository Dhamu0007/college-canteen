import api from './index'

export const ordersAPI = {
  getOrders: (params) => api.get('/orders/', { params }),
  getOrder: (orderNumber) => api.get(`/orders/${orderNumber}/`),
  createOrder: (data) => api.post('/orders/create/', data),
  cancelOrder: (orderNumber, reason) => 
    api.post(`/orders/${orderNumber}/cancel/`, { reason }),
  getOrderHistory: (orderNumber) => api.get(`/orders/${orderNumber}/history/`),
  
  // Admin
  updateOrderStatus: (orderNumber, data) => 
    api.patch(`/orders/${orderNumber}/status/`, data),
  generateDeliveryOTP: (orderNumber) =>
    api.post(`/delivery/generate-otp/${orderNumber}/`),
  
  // Cart
  getCart: () => api.get('/orders/cart/'),
  addToCart: (data) => api.post('/orders/cart/add/', data),
  updateCartItem: (itemId, data) => 
    api.patch(`/orders/cart/item/${itemId}/`, data),
  removeFromCart: (itemId) => 
    api.delete(`/orders/cart/item/${itemId}/remove/`),
  clearCart: () => api.delete('/orders/cart/clear/'),
}