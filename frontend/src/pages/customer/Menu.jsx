import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout'
import FoodCard from '../../components/customer/FoodCard'
import CategoryCard from '../../components/customer/CategoryCard'
import { productsAPI } from '../../api/products'
import toast from 'react-hot-toast'

const Menu = () => {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getProducts(),
          productsAPI.getCategories(),
        ])
        const prodData = productsRes.data.results || productsRes.data || []
        const catData = categoriesRes.data.results || categoriesRes.data || []
        setProducts(Array.isArray(prodData) ? prodData : [])
        setCategories(Array.isArray(catData) ? catData : [])
      } catch (error) {
        console.error('Failed to fetch menu:', error)
        toast.error('Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter(product => {
    const q = searchTerm.toLowerCase().trim()
    const matchesSearch = !q || 
      product.name?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q) ||
      product.category_name?.toLowerCase().includes(q)
      
    const catId = typeof product.category === 'object' ? product.category?.id : product.category
    const matchesCategory = !selectedCategory || String(catId) === String(selectedCategory)
    
    const matchesType = filterType === 'all' || product.food_type === filterType
    return matchesSearch && matchesCategory && matchesType
  })

  const categoriesWithCount = categories.map(cat => {
    const count = products.filter(p => {
      const pCatId = typeof p.category === 'object' ? p.category?.id : p.category
      return String(pCatId) === String(cat.id)
    }).length
    return { ...cat, count }
  })

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-earth-800">
            Our Menu 🍽️
          </h1>
          <p className="text-earth-600 mt-1">
            Discover delicious Andhra-style food
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
            <input
              type="text"
              placeholder="Search for food, biryani, dosa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-earth-200 focus:border-mustard-400 focus:ring-2 focus:ring-mustard-200 focus:outline-none transition-all bg-white/80 backdrop-blur-sm text-earth-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-earth-200 hover:border-mustard-400 transition-colors bg-white/80 backdrop-blur-sm font-semibold text-earth-800"
          >
            <Filter size={18} />
            Filters
            {(selectedCategory || filterType !== 'all') && (
              <span className="w-2.5 h-2.5 bg-mustard-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Category Quick Chips */}
        {categoriesWithCount.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all whitespace-nowrap border shadow-sm ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-mustard-500 to-amber-500 text-earth-900 ring-2 ring-mustard-600 border-transparent shadow-md'
                  : 'bg-white/90 backdrop-blur-md border-earth-200 text-earth-700 hover:bg-earth-50'
              }`}
            >
              ✨ All Items ({products.length})
            </button>
            {categoriesWithCount.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={selectedCategory === String(cat.id)}
                onClick={() => setSelectedCategory(selectedCategory === String(cat.id) ? '' : String(cat.id))}
              />
            ))}
          </div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-earth-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-earth-800">Filters</h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setFilterType('all')
                      setSearchTerm('')
                    }}
                    className="text-sm font-bold text-mustard-600 hover:text-mustard-700"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          !selectedCategory
                            ? 'bg-mustard-500 text-earth-800 font-bold'
                            : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                        }`}
                      >
                        All
                      </button>
                      {categoriesWithCount.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(String(cat.id))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === String(cat.id)
                              ? 'bg-mustard-500 text-earth-800 font-bold'
                              : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                          }`}
                        >
                          {cat.name} ({cat.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Food Type */}
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-2">Food Type</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'all', label: 'All', emoji: '🍽️' },
                        { value: 'veg', label: 'Veg', emoji: '🟢' },
                        { value: 'non_veg', label: 'Non-Veg', emoji: '🔴' },
                      ].map(type => (
                        <button
                          key={type.value}
                          onClick={() => setFilterType(type.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            filterType === type.value
                              ? 'bg-mustard-500 text-earth-800 font-bold'
                              : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                          }`}
                        >
                          {type.emoji} {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-earth-200 rounded-2xl h-48" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-earth-200 rounded w-3/4" />
                  <div className="h-4 bg-earth-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-earth-100"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-display font-bold text-earth-800">
              Babu, no items found!
            </h3>
            <p className="text-earth-600 mt-2">
              Try searching for something else or clear your search filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setFilterType('all')
              }}
              className="mt-4 px-5 py-2.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl text-sm transition-all shadow-md"
            >
              Show All Menu Items
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FoodCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

export default Menu