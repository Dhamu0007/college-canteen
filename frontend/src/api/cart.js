import api from './index'

export const cartAPI = {
  getCart: () => api.get('/orders/cart/'),
  addToCart: (data) => api.post('/orders/cart/items/', data),
  updateCartItem: (itemId, data) => api.patch(`/orders/cart/items/${itemId}/`, data),
  removeFromCart: (itemId) => api.delete(`/orders/cart/items/${itemId}/`),
  clearCart: () => api.delete('/orders/cart/clear/'),
}

export default cartAPI
