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
  ChevronDown,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useNotifications } from '../hooks/useNotifications'
import { useTheme } from '../hooks/useTheme'
import LiquidGlassBackground from '../components/animations/LiquidGlassBackground'

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const { unreadCount } = useNotifications()
  const { theme, isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Menu', href: '/menu', icon: Utensils },
    { name: 'Orders', href: '/orders', icon: ClipboardList },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-800 dark:text-slate-100 relative flex flex-col font-body transition-colors duration-300">
      {/* Ambient Liquid Glass Background */}
      <LiquidGlassBackground opacity={isDark ? 0.35 : 0.65} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0d131f]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Em Babu Thinnava Logo"
                className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-amber-500/20 border border-amber-400/40 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                  <span className="text-gradient-gold">EM BABU</span>
                  <span className="hidden sm:inline text-slate-800 dark:text-slate-200"> THINNAVA?</span>
                </span>
                <span className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest -mt-1">
                  Canteen & Food Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-850/80 dark:bg-slate-800/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href === '/' && location.pathname === '/dashboard')
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon size={15} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-sm text-slate-700 dark:text-amber-400 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={18} className="animate-spin-slow" /> : <Moon size={18} />}
                <span className="hidden lg:inline text-[11px] uppercase tracking-wider font-extrabold text-slate-700 dark:text-slate-300">
                  {isDark ? 'Light' : 'Dark'}
                </span>
              </button>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
                title="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
                title="Cart"
              >
                <ShoppingCart size={19} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-amber-500 text-slate-950 text-xs font-black rounded-full flex items-center justify-center shadow-md shadow-amber-500/30">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-sm transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={15} className="text-slate-600 dark:text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60">
                          <p className="font-black text-slate-900 dark:text-white text-sm truncate">{user.username}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{user.email}</p>
                        </div>
                        {(user.user_type === 'admin' || user.user_type === 'staff' || user.is_staff) && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-3 text-amber-700 dark:text-amber-400 bg-amber-500/10 font-bold text-xs hover:bg-amber-500/20 transition-colors border-b border-amber-500/20"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <ShieldCheck size={16} />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <User size={16} className="text-slate-400" />
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <ClipboardList size={16} className="text-slate-400" />
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors border-t border-slate-100 dark:border-slate-800"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-glass-primary text-xs !py-2 !px-4"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
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
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 overflow-hidden z-40"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-slate-800 dark:text-slate-200 transition-colors text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={18} className="text-amber-500" />
                  {item.name}
                </Link>
              ))}

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-slate-800 dark:text-slate-200 transition-colors text-sm"
              >
                <span className="flex items-center gap-3">
                  {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                  <span>{isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-500 font-bold uppercase">
                  {theme}
                </span>
              </button>

              {user && (
                <>
                  {(user.user_type === 'admin' || user.user_type === 'staff' || user.is_staff) && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheck size={18} />
                      Admin Console
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-colors text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold transition-colors text-sm"
                  >
                    <LogOut size={18} />
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
      <footer className="bg-slate-950 text-slate-300 py-10 mt-auto border-t border-slate-850 dark:border-slate-800/80 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Em Babu Thinnava Logo"
                className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-amber-500/20 border border-amber-400/40"
              />
              <div>
                <span className="font-display font-black text-lg text-white">
                  <span className="text-amber-400">EM BABU</span> THINNAVA?
                </span>
                <span className="block text-xs text-slate-400 font-semibold">Campus Canteen & Instant Food Hub</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400">
              <span>© 2026 EM BABU THINNAVA?</span>
              <span>•</span>
              <button
                onClick={toggleTheme}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />} {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <span>•</span>
              <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-extrabold transition-colors inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck size={14} /> Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CustomerLayout