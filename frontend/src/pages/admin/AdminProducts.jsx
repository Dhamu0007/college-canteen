import React, { useState, useEffect } from 'react'
import { 
  Plus, Edit, Trash2, Check, X, Search, Flame, Upload, 
  Image as ImageIcon, Camera, FolderPlus, Layers, LayoutGrid, 
  List, Eye, Sparkles, Star, Clock 
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import { productsAPI } from '../../api/products'
import { formatCurrency, getFoodTypeBadge, getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import CategoryAnimatedEmoji from '../../components/customer/CategoryAnimatedEmoji'
import { PRESET_CATEGORY_EMOJIS, getCategoryMeta } from '../../utils/categoryEmojis'

// High-resolution preset food photo suggestions curated for Indian college canteens
const PRESET_FOOD_PHOTOS = [
  { name: 'Biryani / Meals', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { name: 'South Indian Thali', url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80' },
  { name: 'Dosa / Tiffin', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { name: 'Curry / Gravy', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
  { name: 'Tea / Chai / Coffee', url: 'https://images.unsplash.com/photo-1571934811356-5cc561d6821f?w=800&auto=format&fit=crop&q=80' },
  { name: 'Samosa / Snacks', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80' },
  { name: 'Fried Rice / Noodles', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Burger / Sandwich', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' },
  { name: 'Paneer Butter Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80' },
  { name: 'Chole Bhature / Poori', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { name: 'Juice / Milkshake', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80' },
]

const AdminProducts = () => {
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'categories'
  const [productViewMode, setProductViewMode] = useState('table') // 'table' | 'cards'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [previewFitMode, setPreviewFitMode] = useState('cover') // 'cover' | 'contain'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    food_type: 'veg',
    preparation_time: '15',
    is_available: true,
    is_hot_item: false,
    is_popular: false,
    is_today_special: false,
  })

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '🍛',
    order: 0,
    is_active: true,
    image: null,
  })
  const [categoryImagePreview, setCategoryImagePreview] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        productsAPI.getProducts(),
        productsAPI.getCategories(),
      ])
      const fetchedProducts = prodRes.data.results || prodRes.data || []
      const fetchedCategories = catRes.data.results || catRes.data || []
      setProducts(fetchedProducts)
      setCategories(fetchedCategories)
      if (fetchedCategories.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: prev.category || fetchedCategories[0].id,
        }))
      }
    } catch (err) {
      toast.error('Failed to load menu data')
    } finally {
      setLoading(false)
    }
  }

  // --- Product Handlers ---
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview(null)
    setPreviewFitMode('cover')
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category: categories[0]?.id || '',
      food_type: 'veg',
      preparation_time: '15',
      is_available: true,
      is_hot_item: false,
      is_popular: false,
      is_today_special: false,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setImageFile(null)
    setImagePreview(product.image || null)
    setPreviewFitMode('cover')
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price || '',
      category: product.category?.id || product.category || '',
      food_type: product.food_type || 'veg',
      preparation_time: product.preparation_time || '15',
      is_available: product.is_available,
      is_hot_item: product.is_hot_item || false,
      is_popular: product.is_popular || false,
      is_today_special: product.is_today_special || false,
    })
    setIsModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSelectPresetPhoto = async (photoUrl) => {
    setImagePreview(photoUrl)
    try {
      const res = await fetch(photoUrl)
      const blob = await res.blob()
      const file = new File([blob], `preset_${Date.now()}.jpg`, { type: 'image/jpeg' })
      setImageFile(file)
    } catch (err) {
      setImageFile(null)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleDeleteProduct = async (identifier) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return
    try {
      await productsAPI.deleteProduct(identifier)
      fetchData()
    } catch (err) {
      toast.error('Failed to delete product')
    }
  }

  const handleToggleAvailability = async (prod) => {
    try {
      const identifier = prod.slug || prod.id
      const newStatus = !prod.is_available
      await productsAPI.updateProduct(identifier, { is_available: newStatus })
      setProducts((prev) =>
        prev.map((p) => ((p.slug || p.id) === identifier ? { ...p, is_available: newStatus } : p))
      )
      toast.success(newStatus ? `🟢 ${prod.name} is now Available` : `🔴 ${prod.name} marked Out of Stock`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update product availability')
    }
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const selectedCategory = formData.category || categories[0]?.id
      if (!selectedCategory) {
        toast.error('Please create at least one Category before adding products!')
        setSubmitting(false)
        return
      }

      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price)
      if (formData.discount_price) {
        submitData.append('discount_price', formData.discount_price)
      }
      submitData.append('category', selectedCategory)
      submitData.append('food_type', formData.food_type)
      submitData.append('preparation_time', formData.preparation_time)
      submitData.append('is_available', formData.is_available)
      submitData.append('is_hot_item', formData.is_hot_item)
      submitData.append('is_popular', formData.is_popular)
      submitData.append('is_today_special', formData.is_today_special)

      if (imageFile) {
        submitData.append('image', imageFile)
      }

      if (editingProduct) {
        const identifier = editingProduct.slug || editingProduct.id
        await productsAPI.updateProduct(identifier, submitData)
      } else {
        await productsAPI.createProduct(submitData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      let errorMsg = 'Failed to save product details'
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMsg = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ')
        } else {
          errorMsg = String(err.response.data)
        }
      }
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // --- Category Handlers ---
  const handleOpenCreateCategory = () => {
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      icon: '🍛',
      order: categories.length,
      is_active: true,
      image: null,
    })
    setCategoryImagePreview(null)
    setIsCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '🍛',
      order: category.order || 0,
      is_active: category.is_active ?? true,
      image: null,
    })
    setCategoryImagePreview(category.image ? getImageUrl(category.image) : null)
    setIsCategoryModalOpen(true)
  }

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setCategoryFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveCategoryImage = () => {
    setCategoryFormData((prev) => ({ ...prev, image: null }))
    setCategoryImagePreview(null)
  }

  const handleDeleteCategory = async (identifier) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated products may be affected.')) return
    try {
      await productsAPI.deleteCategory(identifier)
      toast.success('Category deleted successfully')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete category')
    }
  }

  const handleSubmitCategory = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('name', categoryFormData.name)
      submitData.append('description', categoryFormData.description || '')
      submitData.append('icon', categoryFormData.icon || '🍛')
      submitData.append('order', categoryFormData.order || 0)
      submitData.append('is_active', categoryFormData.is_active)
      if (categoryFormData.image instanceof File) {
        submitData.append('image', categoryFormData.image)
      }

      if (editingCategory) {
        const identifier = editingCategory.slug || editingCategory.id
        await productsAPI.updateCategory(identifier, submitData)
        toast.success('Category updated successfully! ✨')
      } else {
        await productsAPI.createCategory(submitData)
        toast.success('Category created successfully! ✨')
      }
      setIsCategoryModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      let errorMsg = 'Failed to save category'
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMsg = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ')
        } else {
          errorMsg = String(err.response.data)
        }
      }
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-earth-900">Food Menu & Category Management</h1>
            <p className="text-xs text-earth-500">Add, edit, or manage menu items, categories, and availability</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateCategory}
              className="px-3.5 py-2.5 bg-earth-100 hover:bg-earth-200 text-earth-800 font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 text-sm border border-earth-200"
            >
              <FolderPlus size={18} className="text-earth-600" /> Add Category
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={18} /> Add Food Item
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-earth-200 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-mustard-500 text-earth-900 shadow-xs'
                : 'text-earth-600 hover:bg-earth-100'
            }`}
          >
            <ImageIcon size={16} /> Food Items ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'categories'
                ? 'bg-mustard-500 text-earth-900 shadow-xs'
                : 'text-earth-600 hover:bg-earth-100'
            }`}
          >
            <Layers size={16} /> Categories ({categories.length})
          </button>
        </div>

        {/* Search & View Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-3 text-earth-400" />
            <input
              type="text"
              placeholder={activeTab === 'products' ? "Search menu items..." : "Search categories..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:border-mustard-500 shadow-xs"
            />
          </div>

          {activeTab === 'products' && (
            <div className="flex items-center gap-1.5 bg-earth-100 p-1 rounded-xl border border-earth-200 self-end sm:self-auto shadow-xs">
              <button
                type="button"
                onClick={() => setProductViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  productViewMode === 'table'
                    ? 'bg-white text-earth-900 shadow-xs'
                    : 'text-earth-600 hover:text-earth-900'
                }`}
                title="Table List View"
              >
                <List size={15} /> Table View
              </button>
              <button
                type="button"
                onClick={() => setProductViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  productViewMode === 'cards'
                    ? 'bg-mustard-500 text-earth-900 shadow-xs font-black'
                    : 'text-earth-600 hover:text-earth-900'
                }`}
                title="Cards Dashboard View"
              >
                <LayoutGrid size={15} /> Cards Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Content based on Active Tab */}
        {loading ? (
          <Loader text="Loading menu data..." />
        ) : activeTab === 'products' ? (
          productViewMode === 'table' ? (
            /* Products Table View */
            <div className="bg-white rounded-2xl border border-earth-100 shadow-xs overflow-hidden">
              <table className="w-full text-left text-sm text-earth-700">
                <thead className="bg-earth-50 text-earth-500 uppercase text-[11px] font-bold border-b border-earth-200">
                  <tr>
                    <th className="py-3.5 px-4">Item Photo & Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-earth-400 font-semibold">
                        No food items found. Click "Add Food Item" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const badge = getFoodTypeBadge(prod.food_type)
                      const prodImg = getImageUrl(prod.image)
                      return (
                        <tr key={prod.id} className="hover:bg-earth-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3.5">
                              {/* Enhanced Thumbnail with Ambient Blur Background for Perfect Fit */}
                              <div className="w-14 h-14 rounded-2xl bg-earth-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-earth-200 shadow-xs relative group">
                                {prodImg ? (
                                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                                    <img 
                                      src={prodImg} 
                                      alt="" 
                                      aria-hidden="true"
                                      className="absolute inset-0 w-full h-full object-cover blur-sm scale-125 opacity-35" 
                                    />
                                    <img 
                                      src={prodImg} 
                                      alt={prod.name} 
                                      className="relative z-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300" 
                                      onError={(e) => {
                                        e.currentTarget.onerror = null
                                        e.currentTarget.style.display = 'none'
                                        if (e.currentTarget.parentElement?.nextElementSibling) {
                                          e.currentTarget.parentElement.nextElementSibling.style.display = 'flex'
                                        }
                                      }}
                                    />
                                  </div>
                                ) : null}
                                <div 
                                  className="w-full h-full flex items-center justify-center p-1"
                                  style={{ display: prodImg ? 'none' : 'flex' }}
                                >
                                  <img src="/logo.png" alt="Food" className="w-8 h-8 object-contain rounded-md opacity-80" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-earth-900 flex items-center gap-1.5">
                                  {prod.name}
                                  {prod.is_hot_item && <Flame size={14} className="text-red-500" />}
                                  {prod.is_today_special && <Sparkles size={14} className="text-emerald-500" />}
                                </p>
                                <p className="text-xs text-earth-400 line-clamp-1">{prod.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-earth-700">
                            {prod.category_name || prod.category?.name || 'General'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-earth-900">
                            {formatCurrency(prod.price)}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(prod)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-full cursor-pointer hover:opacity-85 transition-opacity ${
                                prod.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                              title="Click to toggle availability"
                            >
                              {prod.is_available ? '🟢 In Stock' : '🔴 Sold Out'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 text-earth-600 hover:bg-earth-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.slug || prod.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Products Cards Dashboard View - Perfect Fit Showcase */
            <div>
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-earth-100 p-12 text-center text-earth-400 font-semibold shadow-xs">
                  No food items found. Click "Add Food Item" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((prod) => {
                    const badge = getFoodTypeBadge(prod.food_type)
                    const prodImg = getImageUrl(prod.image)
                    return (
                      <div 
                        key={prod.id} 
                        className="bg-white rounded-3xl border border-earth-200 shadow-sm hover:shadow-xl hover:border-mustard-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                      >
                        {/* Visual Showcase Container - Perfect Fit System */}
                        <div className="relative h-48 w-full overflow-hidden bg-earth-100 flex items-center justify-center">
                          {prodImg ? (
                            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                              {/* Ambient Blurred Backdrop Layer */}
                              <img
                                src={prodImg}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-35 pointer-events-none"
                              />
                              {/* Soft Scrim Gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none z-1" />
                              
                              {/* Primary Dish Image - Perfectly Fitted & Centered */}
                              <img
                                src={prodImg}
                                alt={prod.name}
                                className="relative z-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-earth-100 p-4 text-center">
                              <img src="/logo.png" alt="Dish" className="w-16 h-16 object-contain opacity-70" />
                              <span className="text-[11px] font-bold text-earth-500 mt-2">{prod.category_name || 'Food Item'}</span>
                            </div>
                          )}

                          {/* Badges Overlay (Top Left) */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm ${badge.color}`}>
                              {badge.label}
                            </span>
                            {prod.is_hot_item && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white shadow-sm flex items-center gap-1">
                                <Flame size={10} /> Hot
                              </span>
                            )}
                            {prod.is_today_special && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                                <Sparkles size={10} /> Special
                              </span>
                            )}
                          </div>

                          {/* Quick Availability Toggle (Top Right) */}
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(prod)}
                            className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-full shadow-md transition-all z-10 flex items-center gap-1 ${
                              prod.is_available
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                            title="Click to toggle stock status"
                          >
                            {prod.is_available ? '🟢 In Stock' : '🔴 Sold Out'}
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-earth-900 text-base leading-tight group-hover:text-mustard-600 transition-colors">
                                {prod.name}
                              </h4>
                              <span className="text-sm font-black text-earth-900 shrink-0">
                                {formatCurrency(prod.price)}
                              </span>
                            </div>
                            <p className="text-xs text-earth-500 line-clamp-2 mt-1">
                              {prod.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center gap-2 mt-2.5">
                              <span className="text-[11px] font-bold text-earth-600 bg-earth-100 px-2 py-0.5 rounded-lg border border-earth-200">
                                {prod.category_name || prod.category?.name || 'General'}
                              </span>
                              <span className="text-[11px] font-semibold text-earth-500 flex items-center gap-1">
                                <Clock size={11} className="text-mustard-600" /> {prod.preparation_time || 15}m
                              </span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="pt-3.5 mt-3 border-t border-earth-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(prod)}
                              className="flex-1 py-2 bg-earth-100 hover:bg-mustard-50 hover:text-earth-900 text-earth-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-earth-200"
                            >
                              <Edit size={14} /> Edit Item
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.slug || prod.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                              title="Delete food item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        ) : (
          /* Categories View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-earth-100">
                <FolderPlus className="w-12 h-12 text-earth-300 mx-auto mb-2" />
                <p className="text-earth-600 font-bold">No categories created yet</p>
                <p className="text-earth-400 text-xs mb-4">Add categories like "Starters", "Main Course", "Biryani", "Drinks"</p>
                <button
                  onClick={handleOpenCreateCategory}
                  className="px-4 py-2 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md text-sm transition-all"
                >
                  Create First Category
                </button>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const prodCount = products.filter(
                  (p) => (p.category?.id || p.category) === cat.id
                ).length
                return (
                  <div key={cat.id} className="bg-white rounded-2xl p-5 border border-earth-100 shadow-xs space-y-3 relative group hover:border-mustard-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-earth-200 shadow-xs relative shrink-0">
                            <img
                              src={getImageUrl(cat.image)}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <CategoryAnimatedEmoji
                            categoryName={cat.name}
                            icon={cat.icon}
                            size="md"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-earth-900 text-lg flex items-center gap-2">
                            {cat.name}
                            {!cat.is_active && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full">
                                Hidden
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-earth-400 font-mono">slug: {cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 text-earth-600 hover:bg-earth-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.slug || cat.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-earth-600 line-clamp-2">
                      {cat.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between text-xs font-semibold text-earth-500 pt-2 border-t border-earth-100">
                      <span>Order: {cat.order}</span>
                      <span className="px-2.5 py-1 bg-mustard-100 text-earth-900 font-bold rounded-lg">
                        {cat.product_count ?? prodCount} items
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-earth-900 flex items-center gap-2">
                  <Camera size={20} className="text-mustard-600" />
                  {editingProduct ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-earth-400 hover:text-earth-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="space-y-4">
                {/* Photo Upload Section - Perfect Fit System */}
                <div className="bg-earth-50/70 p-4 rounded-2xl border border-earth-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-earth-700">
                      Product Photo <span className="text-mustard-600 font-bold">• Perfect Fit System</span>
                    </label>
                    {imagePreview && (
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-earth-200 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setPreviewFitMode('cover')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            previewFitMode === 'cover'
                              ? 'bg-mustard-500 text-earth-900 shadow-xs'
                              : 'text-earth-600 hover:text-earth-900'
                          }`}
                        >
                          Cover (Fill)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewFitMode('contain')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            previewFitMode === 'contain'
                              ? 'bg-mustard-500 text-earth-900 shadow-xs'
                              : 'text-earth-600 hover:text-earth-900'
                          }`}
                        >
                          Contain (Full Dish)
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-mustard-400 group bg-earth-900/10 shadow-inner flex items-center justify-center">
                        {/* Ambient Blurred Backdrop Layer */}
                        <img
                          src={imagePreview}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-35 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30 pointer-events-none z-1" />

                        {/* Foreground Main Photo */}
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className={
                            previewFitMode === 'contain'
                              ? 'relative z-0 max-w-full max-h-full object-contain p-2'
                              : 'relative z-0 w-full h-full object-cover object-center'
                          }
                        />

                        {/* Badges preview */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full shadow-xs ${
                            formData.food_type === 'veg' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {formData.food_type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                          </span>
                        </div>

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                          <label className="px-3 py-1.5 bg-white/95 hover:bg-white text-earth-900 text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 transition-transform hover:scale-105">
                            <Upload size={14} /> Replace Photo
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
                          >
                            <X size={14} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Live Dashboard Card Preview Box */}
                      <div className="bg-white p-3 rounded-xl border border-earth-200 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-bold text-earth-700 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Eye size={13} className="text-mustard-600" /> Live Dashboard Food Card Preview
                          </span>
                          <span className="text-[10px] text-earth-400 font-medium">
                            Auto-fitted with ambient background
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-earth-50/80 p-2.5 rounded-xl border border-earth-200/80">
                          <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-earth-300 shadow-xs flex items-center justify-center">
                            <img
                              src={imagePreview}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover blur-sm scale-125 opacity-40"
                            />
                            <img
                              src={imagePreview}
                              alt="Thumbnail"
                              className="relative z-0 w-full h-full object-cover object-center"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-earth-900 truncate">
                              {formData.name || 'Your Delicious Dish Name'}
                            </p>
                            <p className="text-xs font-bold text-mustard-700 mt-0.5">
                              ₹{formData.price || '0'}
                            </p>
                            <span className="text-[10px] text-earth-500 font-medium">
                              {categories.find(c => String(c.id) === String(formData.category))?.name || 'Category'} • {formData.preparation_time || 15} mins
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-36 border-2 border-dashed border-earth-300 hover:border-mustard-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-mustard-50/20 transition-all p-4 text-center group">
                      <div className="w-10 h-10 rounded-full bg-mustard-100 flex items-center justify-center text-mustard-700 mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-earth-800">Click to upload food photo</span>
                      <span className="text-[11px] text-earth-400 mt-0.5">JPG, PNG, WEBP up to 5MB • Any size or ratio</span>
                      <span className="text-[10px] text-mustard-700 font-semibold mt-1">Smart ambient fit automatically prevents cropped borders</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}

                  {/* Preset Photos Suggestions */}
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-earth-600 mb-1.5 flex items-center gap-1">
                      <Sparkles size={12} className="text-mustard-600" /> Or select a high-res sample food photo:
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {PRESET_FOOD_PHOTOS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetPhoto(preset.url)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-mustard-100 text-earth-800 rounded-xl text-xs font-semibold border border-earth-200 hover:border-mustard-300 transition-colors shadow-2xs"
                        >
                          <img src={preset.url} alt={preset.name} className="w-5 h-5 rounded-lg object-cover" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                    placeholder="e.g. Chicken Biryani, Masala Dosa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase text-earth-600">Category</label>
                      <button
                        type="button"
                        onClick={handleOpenCreateCategory}
                        className="text-[11px] font-bold text-mustard-700 hover:underline flex items-center gap-0.5"
                      >
                        + New
                      </button>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none bg-white focus:border-mustard-500"
                    >
                      {categories.length === 0 ? (
                        <option value="">No Categories Available</option>
                      ) : (
                        categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon || '📁'} {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Food Type</label>
                    <select
                      value={formData.food_type}
                      onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none bg-white focus:border-mustard-500"
                    >
                      <option value="veg">🟢 Veg</option>
                      <option value="non_veg">🔴 Non-Veg</option>
                      <option value="both">🟡 Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                    placeholder="Short delicious description of the food item..."
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 py-2 bg-earth-50 p-3 rounded-xl">
                  <label className="flex items-center gap-2 text-xs font-semibold text-earth-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded accent-mustard-500 w-4 h-4"
                    />
                    Available
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-earth-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_hot_item}
                      onChange={(e) => setFormData({ ...formData, is_hot_item: e.target.checked })}
                      className="rounded accent-mustard-500 w-4 h-4"
                    />
                    Hot Item 🔥
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-earth-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_popular}
                      onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                      className="rounded accent-mustard-500 w-4 h-4"
                    />
                    Popular ⭐
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-earth-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_today_special}
                      onChange={(e) => setFormData({ ...formData, is_today_special: e.target.checked })}
                      className="rounded accent-mustard-500 w-4 h-4"
                    />
                    Today's Special ✨
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-earth-100 hover:bg-earth-200 text-earth-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-mustard-500 hover:bg-mustard-600 disabled:opacity-50 text-earth-900 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    {submitting ? 'Saving...' : 'Save Food Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl my-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-earth-900 flex items-center gap-2">
                  <FolderPlus size={20} className="text-mustard-600" />
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 text-earth-400 hover:text-earth-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                    placeholder="e.g. Starters, Main Course, Biryani"
                  />
                </div>

                {/* Category Image Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Category Photo / Image</label>
                  {categoryImagePreview ? (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-mustard-400 group shadow-sm bg-earth-50">
                      <img
                        src={categoryImagePreview}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-white/90 hover:bg-white text-earth-900 text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center gap-1">
                          <Upload size={14} /> Change Photo
                          <input type="file" accept="image/*" onChange={handleCategoryImageChange} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveCategoryImage}
                          className="px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1"
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-24 border-2 border-dashed border-earth-300 hover:border-mustard-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-earth-50/50 hover:bg-mustard-50/20 transition-all p-3">
                      <ImageIcon className="w-6 h-6 text-earth-400 mb-1" />
                      <span className="text-xs font-bold text-earth-700">Click to upload category photo</span>
                      <span className="text-[10px] text-earth-400">PNG, JPG, WEBP up to 5MB (Optional)</span>
                      <input type="file" accept="image/*" onChange={handleCategoryImageChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Icon / Emoji</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={categoryFormData.icon}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                        placeholder="e.g. 🥞, 🍱, 🥘, 🍿"
                      />
                      <CategoryAnimatedEmoji
                        categoryName={categoryFormData.name}
                        icon={categoryFormData.icon}
                        size="md"
                        showGlow={false}
                        showParticles={false}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={categoryFormData.order}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                    />
                  </div>
                </div>

                {/* Preset Emoji Picker Grid */}
                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1.5">Quick Pick Preset Emoji</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-earth-50 rounded-2xl border border-earth-200/80 max-h-28 overflow-y-auto">
                    {PRESET_CATEGORY_EMOJIS.map((item) => (
                      <button
                        key={item.emoji}
                        type="button"
                        onClick={() => setCategoryFormData({ ...categoryFormData, icon: item.emoji })}
                        title={item.name}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${
                          categoryFormData.icon === item.emoji
                            ? 'bg-mustard-500 shadow-md scale-110 ring-2 ring-mustard-600'
                            : 'bg-white border border-earth-200 hover:bg-earth-100 hover:scale-105'
                        }`}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
                    placeholder="Brief description of this category..."
                  />
                </div>

                <div className="flex items-center gap-2 bg-earth-50 p-3 rounded-xl">
                  <label className="flex items-center gap-2 text-xs font-semibold text-earth-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryFormData.is_active}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                      className="rounded accent-mustard-500 w-4 h-4"
                    />
                    Active & Visible in Menu
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 bg-earth-100 hover:bg-earth-200 text-earth-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-mustard-500 hover:bg-mustard-600 disabled:opacity-50 text-earth-900 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    {submitting ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminProducts
