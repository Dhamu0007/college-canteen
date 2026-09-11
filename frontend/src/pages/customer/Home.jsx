import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  Sparkles,
  Flame,
  Star,
  Clock,
  Filter,
  Grid,
  List,
  Utensils,
  Volume2,
  VolumeX,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Award,
  ChevronRight,
  Sun,
  Moon,
  Eye,
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout'
import FoodCard from '../../components/customer/FoodCard'
import LoadingScreen from '../../components/customer/LoadingScreen'
import CategoryAnimatedEmoji from '../../components/customer/CategoryAnimatedEmoji'
import LiveOrderTrackerWidget from '../../components/customer/LiveOrderTrackerWidget'
import FlashDealCard from '../../components/customer/FlashDealCard'
import ProductQuickViewModal from '../../components/customer/ProductQuickViewModal'
import { productsAPI } from '../../api/products'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useSound } from '../../hooks/useSound'
import { useTheme } from '../../hooks/useTheme'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'

const QUICK_SEARCH_PILLS = [
  { label: 'Biryani', icon: '🍗' },
  { label: 'Dosa', icon: '🥞' },
  { label: 'Meals', icon: '🍛' },
  { label: 'Filter Coffee', icon: '☕' },
  { label: 'Chicken 65', icon: '🌶️' },
  { label: 'Snacks', icon: '🥟' },
]

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getTotalItems } = useCart()
  const { isMuted, toggleMute, playButtonClick } = useSound()
  const { isDark, toggleTheme } = useTheme()

  const [loading, setLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  
  // Data lists
  const [allProducts, setAllProducts] = useState([])
  const [hotItems, setHotItems] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [todaySpecials, setTodaySpecials] = useState([])
  const [categories, setCategories] = useState([])

  // Dynamic Dashboard States
  const [activeTab, setActiveTab] = useState('hot') // 'hot', 'specials', 'popular', 'all'
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dietaryFilter, setDietaryFilter] = useState('all') // 'all', 'veg', 'non_veg'
  const [sortBy, setSortBy] = useState('popular') // 'popular', 'price_asc', 'price_desc', 'time_asc'
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  
  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Fetch all initial dashboard data in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, hotRes, popularRes, specialsRes, categoriesRes] = await Promise.all([
          productsAPI.getProducts(),
          productsAPI.getHotItems(),
          productsAPI.getPopularItems(),
          productsAPI.getTodaySpecials(),
          productsAPI.getCategories(),
        ])

        const allProdData = productsRes.data.results || productsRes.data || []
        const hotData = hotRes.data.results || hotRes.data || []
        const popularData = popularRes.data.results || popularRes.data || []
        const specialsData = specialsRes.data.results || specialsRes.data || []
        const catData = categoriesRes.data.results || categoriesRes.data || []

        setAllProducts(Array.isArray(allProdData) ? allProdData : [])
        setHotItems(Array.isArray(hotData) ? hotData : [])
        setPopularItems(Array.isArray(popularData) ? popularData : [])
        setTodaySpecials(Array.isArray(specialsData) ? specialsData : [])
        setCategories(Array.isArray(catData) ? catData : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Dynamic Greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return { title: 'Shubhodhayam! 🌅', sub: 'Kickstart your day with hot tiffins & authentic filter coffee' }
    } else if (hour >= 12 && hour < 17) {
      return { title: 'Good Afternoon! ☀️', sub: 'Steaming hot Andhra meals & fragrant dum biryanis are ready' }
    } else if (hour >= 17 && hour < 22) {
      return { title: 'Good Evening! 🌆', sub: 'Crispy snacks, hot dosas & evening refreshments waiting for you' }
    } else {
      return { title: 'Late Night Cravings? 🌙', sub: 'Quick canteen bites & hot refreshments ready to serve' }
    }
  }, [])

  // Flash deal product
  const flashDealProduct = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return null
    const withDiscount = [...allProducts].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
    if (withDiscount[0] && withDiscount[0].discount_percentage > 0) {
      return withDiscount[0]
    }
    return hotItems[0] || allProducts[0]
  }, [allProducts, hotItems])

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let list = []
    if (activeTab === 'hot') {
      list = hotItems.length > 0 ? hotItems : allProducts.filter(p => p.is_hot_item)
    } else if (activeTab === 'specials') {
      list = todaySpecials.length > 0 ? todaySpecials : allProducts.filter(p => p.is_today_special)
    } else if (activeTab === 'popular') {
      list = popularItems.length > 0 ? popularItems : allProducts.filter(p => p.is_popular)
    } else {
      list = allProducts
    }

    if (list.length === 0) {
      list = allProducts
    }

    if (selectedCategory) {
      list = list.filter(p => {
        const catId = typeof p.category === 'object' ? p.category?.id : p.category
        return String(catId) === String(selectedCategory) || p.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      })
    }

    if (dietaryFilter === 'veg') {
      list = list.filter(p => p.food_type === 'veg')
    } else if (dietaryFilter === 'non_veg') {
      list = list.filter(p => p.food_type === 'non_veg')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q)
      )
    }

    const sorted = [...list]
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => Number(a.final_price || a.price) - Number(b.final_price || b.price))
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => Number(b.final_price || b.price) - Number(a.final_price || a.price))
    } else if (sortBy === 'time_asc') {
      sorted.sort((a, b) => (a.preparation_time || 15) - (b.preparation_time || 15))
    }

    return sorted
  }, [activeTab, selectedCategory, dietaryFilter, searchQuery, sortBy, hotItems, todaySpecials, popularItems, allProducts])

  const handleCopyCoupon = () => {
    playButtonClick?.()
    navigator.clipboard.writeText('ANDHRA20')
    setCopiedCoupon(true)
    toast.success('Coupon code ANDHRA20 copied! 🎁')
    setTimeout(() => setCopiedCoupon(false), 3000)
  }

  const handlePillClick = (label) => {
    playButtonClick?.()
    setSearchQuery(label)
  }

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />
  }

  return (
    <CustomerLayout>
      {/* Active Order Tracker Widget */}
      <LiveOrderTrackerWidget />

      {/* Hero / Dynamic Greeting Section */}
      <section className="relative pt-2 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Status Capsule Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 px-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 shadow-xs">
                <span className="live-dot" /> Kitchen Live & Cooking
              </span>
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 hidden sm:inline-flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" /> Avg Prep: 12-15 mins
              </span>
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 hidden md:inline-flex items-center gap-1.5">
                <Zap size={13} className="text-amber-500" /> Kitchen Rush: Moderate
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={toggleTheme}
                className="p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 text-xs font-bold border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5 transition-all"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5 transition-all"
                title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              >
                {isMuted ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} className="text-emerald-500" />}
                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
              </button>
            </div>
          </div>

          {/* Hero Banner Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl p-7 md:p-10 bg-gradient-to-br from-white/95 via-amber-500/5 to-amber-500/10 dark:from-[#0d131f] dark:via-[#090d16] dark:to-slate-900 border-2 border-slate-200/90 dark:border-slate-800 backdrop-blur-2xl shadow-xl transition-colors"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Text Left Column */}
              <div className="lg:col-span-8 text-left space-y-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-950/70 px-3 py-1 rounded-full border border-amber-300/80 dark:border-amber-700/60 shadow-xs inline-flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    {greeting.title}
                  </span>
                  {user && (
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
                      Welcome, <span className="text-amber-500 font-black">{user.username}</span>! 👋
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-950 dark:text-white leading-none">
                  <span className="text-gradient-gold">EM BABU</span>{' '}
                  <span className="text-slate-900 dark:text-slate-100">THINNAVA?</span>
                </h1>

                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-bold max-w-2xl">
                  {greeting.sub}
                </p>

                {/* Instant Search Bar */}
                <div className="pt-2 max-w-2xl">
                  <div className="flex items-center bg-white dark:bg-slate-850/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/20 transition-all">
                    <Search className="text-amber-500 ml-2.5 shrink-0" size={22} />
                    <input
                      type="text"
                      placeholder="Search biryani, ghee dosa, meals, snacks, coffee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent px-3 py-2.5 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-bold text-sm sm:text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-extrabold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => {
                        playButtonClick?.()
                        if (searchQuery.trim()) {
                          navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`)
                        }
                      }}
                      className="btn-glass-primary !py-2.5 !px-5 text-xs font-black shrink-0"
                    >
                      Find Food
                    </button>
                  </div>

                  {/* Quick Suggestion Pills */}
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs font-extrabold">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider shrink-0">Popular:</span>
                    {QUICK_SEARCH_PILLS.map((pill) => (
                      <button
                        key={pill.label}
                        onClick={() => handlePillClick(pill.label)}
                        className={`px-3 py-1 rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-xs border ${
                          searchQuery.toLowerCase() === pill.label.toLowerCase()
                            ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{pill.icon}</span>
                        <span>{pill.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo / Mascot Right Column */}
              <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.85, rotate: -4 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative group"
                >
                  <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/20 border-4 border-white/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 p-2 animate-float">
                    <img
                      src="/logo.png"
                      alt="EM BABU THINNAVA"
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-white/80 flex items-center gap-1">
                    <Award size={13} /> College Favorite
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Student Coupon Banner */}
      <section className="py-2 max-w-7xl mx-auto">
        <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-slate-950 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-sm">
              <Tag size={20} />
            </div>
            <div>
              <p className="font-black text-sm text-slate-950 leading-tight">
                STUDENT PERK: Flat 20% OFF on Orders above ₹150!
              </p>
              <p className="text-xs text-slate-950/80 font-bold">
                Apply code <span className="font-mono font-black underline">ANDHRA20</span> at checkout
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyCoupon}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            {copiedCoupon ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedCoupon ? 'Copied Code!' : 'Copy Code'}</span>
          </button>
        </div>
      </section>

      {/* Dynamic Animated Categories */}
      {categories.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
                Explore Canteen Categories
              </h2>
              <Sparkles className="text-amber-500" size={18} />
            </div>

            <Link
              to="/menu"
              className="text-amber-600 dark:text-amber-400 hover:underline font-black text-xs sm:text-sm flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              Full Menu <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {/* "All" category chip */}
            <motion.div
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playButtonClick?.()
                setSelectedCategory('')
              }}
              className={`p-4 text-center cursor-pointer rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center ${
                !selectedCategory
                  ? 'border-2 !border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/15 shadow-lg'
                  : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="text-3xl mb-1.5">🍽️</div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                All Items
              </h3>
              <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {allProducts.length} dishes
              </span>
            </motion.div>

            {categories.slice(0, 6).map((category, index) => {
              const isSelected = selectedCategory === String(category.id) || selectedCategory.toLowerCase() === category.name?.toLowerCase()
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playButtonClick?.()
                    setSelectedCategory(isSelected ? '' : String(category.id))
                  }}
                  className={`p-4 text-center cursor-pointer rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden ${
                    isSelected
                      ? 'border-2 !border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/15 shadow-lg'
                      : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-center">
                    {category.image ? (
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <CategoryAnimatedEmoji
                        categoryName={category.name}
                        icon={category.icon}
                        size="md"
                        showParticles={isSelected}
                      />
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider line-clamp-1">
                    {category.name}
                  </h3>
                  <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {category.product_count || 0} items
                  </span>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Flash Deal of the Day Spotlight */}
      {flashDealProduct && (
        <section className="max-w-7xl mx-auto">
          <FlashDealCard
            dealProduct={flashDealProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        </section>
      )}

      {/* Dynamic Products Hub Section */}
      <section className="py-6 max-w-7xl mx-auto" id="products-hub">
        {/* Hub Header & Interactive Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-950 dark:text-white tracking-tight">
                Live Kitchen Dishes
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Explore freshly prepared dishes ready to order straight to your table
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none">
            {[
              { id: 'hot', label: '🔥 Hot Sellers', count: hotItems.length },
              { id: 'specials', label: '✨ Specials', count: todaySpecials.length },
              { id: 'popular', label: '⭐ Top Rated', count: popularItems.length },
              { id: 'all', label: '🍱 All Delicacies', count: allProducts.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playButtonClick?.()
                    setActiveTab(tab.id)
                  }}
                  className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Controls Bar: Dietary, Sort, View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 mb-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Dietary Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 hidden sm:inline">Diet:</span>
            {[
              { id: 'all', label: 'All Dishes' },
              { id: 'veg', label: '🟢 Pure Veg' },
              { id: 'non_veg', label: '🔴 Non-Veg' },
            ].map((diet) => (
              <button
                key={diet.id}
                onClick={() => {
                  playButtonClick?.()
                  setDietaryFilter(diet.id)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  dietaryFilter === diet.id
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700'
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Sort Dropdown & View Mode */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Sort */}
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 dark:text-slate-400">
              <span className="hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  playButtonClick?.()
                  setSortBy(e.target.value)
                }}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="time_asc">Fastest Prep Time</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <button
                onClick={() => {
                  playButtonClick?.()
                  setViewMode('grid')
                }}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => {
                  playButtonClick?.()
                  setViewMode('list')
                }}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected filters chips */}
        {(selectedCategory || dietaryFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Active filters:</span>
            {selectedCategory && (
              <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-rose-500">✕</button>
              </span>
            )}
            {dietaryFilter !== 'all' && (
              <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                Diet: {dietaryFilter === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                <button onClick={() => setDietaryFilter('all')} className="hover:text-rose-500">✕</button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">✕</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('')
                setDietaryFilter('all')
                setSearchQuery('')
              }}
              className="text-amber-600 dark:text-amber-400 hover:underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Products Grid or List */}
        {displayedProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-3'
            }
          >
            {displayedProducts.map((product) => (
              <FoodCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-600 dark:text-slate-400 shadow-md my-8">
            <div className="w-16 h-16 mx-auto mb-3 text-4xl flex items-center justify-center">
              🔍
            </div>
            <h3 className="font-black font-display text-lg text-slate-900 dark:text-white">
              No dishes match your filter criteria!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Try choosing another category, clearing your search query, or switching dietary filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('')
                setDietaryFilter('all')
                setSearchQuery('')
              }}
              className="mt-4 btn-glass-primary text-xs !py-2.5 !px-5"
            >
              Reset Filters & Show All
            </button>
          </div>
        )}

        {/* Bottom Menu Action CTA */}
        <div className="mt-10 text-center">
          <Link to="/menu">
            <button className="btn-glass-primary text-sm !py-3.5 !px-8 shadow-xl shadow-amber-500/20">
              <span>View Entire Canteen Menu ({allProducts.length} items)</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="text-xl sm:text-2xl font-black font-display text-slate-950 dark:text-white">
            Why Students Love Our Canteen ❤️
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">
            Bringing authentic Rayalaseema & Coastal Andhra flavours to your campus
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Zap,
              title: 'Superfast Table Delivery',
              desc: 'Average 12-15 min preparation time so you never miss a lecture',
              color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            },
            {
              icon: Sparkles,
              title: 'Pure Desi Ghee & Spices',
              desc: 'Freshly grounded Andhra masalas, homestyle recipes and rich flavors',
              color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            },
            {
              icon: Award,
              title: 'Pocket Friendly Prices',
              desc: 'Nutritious wholesome student meals priced reasonably every single day',
              color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            },
            {
              icon: ShieldCheck,
              title: 'Clean & FSSAI Certified',
              desc: 'Hygienic kitchen with daily fresh ingredients and clean dining standards',
              color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
            },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md text-left"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${feature.color} shadow-xs`}>
                <feature.icon size={22} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-base mb-1">
                {feature.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Quick-View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </CustomerLayout>
  )
}

export default Home