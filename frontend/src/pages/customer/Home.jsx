import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Sparkles, Coffee, Utensils, Clock, Star } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout'
import FoodCard from '../../components/customer/FoodCard'
import LoadingScreen from '../../components/customer/LoadingScreen'
import CategoryAnimatedEmoji from '../../components/customer/CategoryAnimatedEmoji'
import { getCategoryMeta } from '../../utils/categoryEmojis'
import { productsAPI } from '../../api/products'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getTotalItems } = useCart()
  const [loading, setLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  const [hotItems, setHotItems] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [todaySpecials, setTodaySpecials] = useState([])
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotRes, popularRes, specialsRes, categoriesRes] = await Promise.all([
          productsAPI.getHotItems(),
          productsAPI.getPopularItems(),
          productsAPI.getTodaySpecials(),
          productsAPI.getCategories(),
        ])
        const hotData = hotRes.data.results || hotRes.data || []
        const popularData = popularRes.data.results || popularRes.data || []
        const specialsData = specialsRes.data.results || specialsRes.data || []
        const catData = categoriesRes.data.results || categoriesRes.data || []

        setHotItems(Array.isArray(hotData) ? hotData : [])
        setPopularItems(Array.isArray(popularData) ? popularData : [])
        setTodaySpecials(Array.isArray(specialsData) ? specialsData : [])
        setCategories(Array.isArray(catData) ? catData.slice(0, 6) : [])
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/menu')
    }
  }

  const handleLoadingComplete = () => {
    setShowLoading(false)
  }

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto relative z-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/30 border-2 border-amber-400/40 animate-float p-1 bg-white/80"
            >
              <img src="/logo.png" alt="EM BABU THINNAVA" className="w-full h-full object-cover rounded-2xl" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-earth-900">
              <span className="text-gradient-gold">EM BABU</span>
              <span className="mx-2 text-earth-800">THINNAVA?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-earth-600 font-semibold mt-3">
              Authentic Andhra Canteen • Fresh Hot Meals • Instant Delivery
            </p>
            
            {user && (
              <p className="text-earth-600 mt-2 font-bold bg-white/70 backdrop-blur-md inline-block px-4 py-1.5 rounded-full border border-white/80 shadow-sm text-sm">
                Welcome back, <span className="text-amber-600 font-black">{user.username}</span>! 👋
              </p>
            )}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl mx-auto mt-8 relative z-10"
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center glass-card rounded-2xl p-2 shadow-xl hover:shadow-2xl hover:border-amber-400/60 transition-all duration-300">
                <Search className="text-amber-500 ml-3" size={22} />
                <input
                  type="text"
                  placeholder="Search biryani, meals, tiffins, snacks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-3 focus:outline-none text-earth-900 placeholder-earth-400 font-semibold text-base"
                />
                <button
                  type="submit"
                  className="btn-glass-primary text-sm !py-3 !px-6"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black font-display text-earth-900 flex items-center gap-2">
                Categories <Sparkles className="text-amber-500" size={20} />
              </h2>
              <Link
                to="/menu"
                className="text-amber-600 hover:text-amber-700 font-extrabold text-sm flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/80 shadow-sm"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const meta = getCategoryMeta(category.name, category.icon)
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/menu?search=${encodeURIComponent(category.name)}`)}
                    className="glass-card-liquid p-5 text-center cursor-pointer group border border-white/90 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center"
                  >
                    <div className="mb-3 relative">
                      <CategoryAnimatedEmoji
                        categoryName={category.name}
                        icon={category.icon}
                        size="lg"
                        showParticles={true}
                      />
                    </div>
                    <h3 className="font-extrabold text-earth-900 text-sm group-hover:text-amber-600 transition-colors uppercase tracking-wider">
                      {category.name}
                    </h3>
                    <span className="mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-earth-200/60 text-earth-600 group-hover:border-amber-300 group-hover:text-amber-800 transition-all">
                      {category.product_count || 0} items
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Hot Items */}
      {hotItems.length > 0 && (
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-rose-500 animate-bounce" />
              <h2 className="text-2xl font-black font-display text-earth-900">
                🔥 Hot Items
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotItems.slice(0, 4).map((item) => (
                <FoodCard key={item.id} product={item} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Today's Specials */}
      {todaySpecials.length > 0 && (
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="text-amber-500 fill-amber-500 animate-pulse" />
              <h2 className="text-2xl font-black font-display text-earth-900">
                Today's Specials ✨
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {todaySpecials.slice(0, 4).map((item) => (
                <FoodCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="text-amber-500" />
              <h2 className="text-2xl font-black font-display text-earth-900">
                ⭐ Popular Items
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularItems.slice(0, 4).map((item) => (
                <FoodCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-earth-900 via-earth-800 to-earth-900 text-white p-8 md:p-12 shadow-2xl border border-white/10"
          >
            <div className="absolute inset-0 opacity-15 bg-liquid-mesh" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
                Hungry? Order Now! 🍽️
              </h2>
              <p className="text-earth-300 text-base md:text-lg mt-2 max-w-xl mx-auto font-medium">
                Get your favorite authentic Andhra meals delivered fast to your table
              </p>
              <Link to="/menu">
                <button className="mt-6 btn-glass-primary text-sm !py-3.5 !px-8">
                  Explore Full Menu
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </CustomerLayout>
  )
}

export default Home