import api from './index'

export const productsAPI = {
  getProducts: (params) => api.get('/products/', { params }),
  getProduct: (slug) => api.get(`/products/${slug}/`),
  getCategories: () => api.get('/products/categories/'),
  getCategory: (slug) => api.get(`/products/categories/${slug}/`),
  getHotItems: () => api.get('/products/hot-items/'),
  getPopularItems: () => api.get('/products/popular-items/'),
  getTodaySpecials: () => api.get('/products/today-specials/'),
  
  // Admin
  createProduct: (data) => {
    if (data instanceof FormData) {
      return api.post('/products/admin/products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.post('/products/admin/products/', data)
  },
  updateProduct: (identifier, data) => {
    if (data instanceof FormData) {
      return api.put(`/products/admin/products/${identifier}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.put(`/products/admin/products/${identifier}/`, data)
  },
  deleteProduct: (identifier) => api.delete(`/products/admin/products/${identifier}/`),
  
  createCategory: (data) => {
    if (data instanceof FormData) {
      return api.post('/products/admin/categories/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.post('/products/admin/categories/', data)
  },
  updateCategory: (identifier, data) => {
    if (data instanceof FormData) {
      return api.put(`/products/admin/categories/${identifier}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.put(`/products/admin/categories/${identifier}/`, data)
  },
  deleteCategory: (identifier) => api.delete(`/products/admin/categories/${identifier}/`),
  
  uploadProductImages: (productId, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return api.post(`/products/admin/products/${productId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteProductImage: (productId, imageId) => 
    api.delete(`/products/admin/products/${productId}/images/${imageId}/`),
}