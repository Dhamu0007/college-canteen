import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu as MenuIcon,
  X,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  Home,
  Utensils,
  ClipboardList,
  Settings,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useNotifications } from '../hooks/useNotifications'
import LiquidGlassBackground from '../components/animations/LiquidGlassBackground'

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Menu', href: '/menu', icon: Utensils },
    { name: 'Orders', href: '/orders', icon: ClipboardList },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] relative flex flex-col font-body">
      {/* Ambient Liquid Glass Background */}
      <LiquidGlassBackground opacity={0.65} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-2xl border-b border-white/80 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Em Babu Thinnava Logo"
                className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-amber-500/20 border border-amber-400/30 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span className="font-display font-black text-xl text-earth-900 tracking-tight flex items-center gap-1">
                  <span className="text-gradient-gold">EM BABU</span>
                  <span className="hidden sm:inline text-earth-800"> THINNAVA?</span>
                </span>
                <span className="block text-[11px] font-bold text-amber-600 uppercase tracking-widest -mt-1">
                  Andhra Canteen
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-sm">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-5 py-2 rounded-xl text-sm font-extrabold transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-mustard-500 text-earth-900 shadow-md shadow-amber-500/20'
                        : 'text-earth-700 hover:text-earth-900 hover:bg-white/60'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5">
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-3 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/80 shadow-sm text-earth-700 hover:text-earth-900 transition-all duration-300 hover:scale-105"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-3 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/80 shadow-sm text-earth-700 hover:text-earth-900 transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-amber-500 text-earth-900 text-xs font-black rounded-full flex items-center justify-center shadow-md shadow-amber-500/30">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/80 shadow-sm transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-earth-900 font-black text-sm shadow-sm">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={16} className="text-earth-600" />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-earth-100/60 bg-white/50">
                          <p className="font-extrabold text-earth-900 text-sm truncate">{user.username}</p>
                          <p className="text-xs text-earth-500 font-medium truncate">{user.email}</p>
                        </div>
                        {(user.user_type === 'admin' || user.user_type === 'staff' || user.is_staff) && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-3 text-amber-800 bg-amber-50/80 font-bold text-xs hover:bg-amber-100 transition-colors border-b border-amber-100"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <ShieldCheck size={17} className="text-amber-600" />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-3 text-earth-700 hover:bg-white/80 font-semibold text-xs transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <User size={17} className="text-earth-500" />
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-3 text-earth-700 hover:bg-white/80 font-semibold text-xs transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <ClipboardList size={17} className="text-earth-500" />
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-rose-600 hover:bg-rose-50/80 font-bold text-xs transition-colors border-t border-earth-100/60"
                        >
                          <LogOut size={17} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-glass-primary text-xs !py-2.5 !px-5"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/80 shadow-sm text-earth-800 transition-colors"
              >
                {isMobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-2xl border-b border-white/80 overflow-hidden z-40"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/80 font-extrabold text-earth-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className="text-amber-500" />
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  {(user.user_type === 'admin' || user.user_type === 'staff' || user.is_staff) && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-100/70 text-amber-900 font-black text-sm transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheck size={20} className="text-amber-600" />
                      Admin Console
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/80 font-bold text-earth-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-50 text-rose-600 font-bold transition-colors"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-earth-900/95 backdrop-blur-2xl text-white/80 py-10 mt-auto border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Em Babu Thinnava Logo"
                className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-amber-500/20 border border-amber-400/30"
              />
              <div>
                <span className="font-display font-black text-lg text-white">
                  <span className="text-amber-400">EM BABU</span> THINNAVA?
                </span>
                <span className="block text-xs text-earth-400 font-semibold">Andhra Style Canteen Management</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-earth-300">
              <span>© 2026 EM BABU THINNAVA?</span>
              <span>•</span>
              <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-extrabold transition-colors inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck size={15} /> Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CustomerLayout