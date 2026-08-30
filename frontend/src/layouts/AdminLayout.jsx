import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Ticket, BarChart3, Settings, LogOut, Menu,
  X, Bell, ChevronDown, Home, Sparkles, User
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import LiquidGlassBackground from '../components/animations/LiquidGlassBackground'
import { getImageUrl } from '../utils/helpers'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] relative text-earth-800 font-body">
      {/* Ambient Liquid Glass Background */}
      <LiquidGlassBackground opacity={0.75} />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/80 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl hover:bg-white/60 text-earth-800 transition-colors"
          >
            <Menu size={24} />
          </button>
          <Link to="/admin" className="font-display font-extrabold text-earth-900 tracking-tight flex items-center gap-2 text-lg">
            <img src="/logo.png" alt="EM BABU" className="w-7 h-7 rounded-lg object-cover border border-amber-400/30 shadow-xs" />
            <span className="text-amber-500">EM BABU</span> Admin
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative p-2.5 rounded-xl hover:bg-white/60 text-earth-700 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white/90 backdrop-blur-2xl z-50 shadow-2xl border-r border-white/80 overflow-y-auto"
            >
              <SidebarContent
                navigation={navigation}
                location={location}
                user={user}
                unreadCount={unreadCount}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 bg-white/75 backdrop-blur-2xl border-r border-white/80 overflow-y-auto z-30 shadow-lg shadow-black/5">
        <SidebarContent
          navigation={navigation}
          location={location}
          user={user}
          unreadCount={unreadCount}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 relative z-10">
        <main className="p-4 md:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, location, user, unreadCount, onClose, onLogout }) => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="p-6 border-b border-earth-100/60">
          <Link to="/admin" className="flex items-center gap-3" onClick={onClose}>
            <img
              src="/logo.png"
              alt="Em Babu Thinnava Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-amber-500/20 border border-amber-400/30"
            />
            <div>
              <span className="font-display font-black text-lg tracking-tight text-earth-900 flex items-center gap-1">
                EM BABU <Sparkles className="text-amber-500" size={14} />
              </span>
              <span className="block text-xs font-semibold text-amber-700 uppercase tracking-wider">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold text-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-500 via-mustard-500 to-yellow-500 text-earth-900 shadow-md shadow-amber-500/20 border border-white/50 font-extrabold'
                    : 'text-earth-600 hover:bg-white/70 hover:text-earth-900 hover:shadow-sm'
                  }
                `}
              >
                <item.icon size={19} className={isActive ? 'text-earth-900 stroke-[2.5]' : 'text-earth-500'} />
                {item.name}
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User & Actions */}
      <div className="p-4 border-t border-earth-100/60 bg-white/40 backdrop-blur-md">
        <Link to="/admin/profile" className="flex items-center gap-3 mb-3 p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-white/80 shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-earth-900 font-black shadow-sm text-sm overflow-hidden">
            {user?.profile_picture ? (
              <img src={getImageUrl(user.profile_picture)} alt="Admin Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase() || 'A'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-earth-900 text-sm truncate group-hover:text-amber-700 transition-colors">{user?.full_name || user?.username || 'Admin'}</p>
            <p className="text-[11px] text-earth-500 font-medium truncate">{user?.email || 'admin@example.com'}</p>
          </div>
        </Link>
        <div className="space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50/80 hover:bg-rose-100/80 text-rose-600 rounded-xl font-bold text-xs transition-colors border border-rose-200/50"
          >
            <LogOut size={16} />
            Logout
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white text-earth-700 rounded-xl font-bold text-xs transition-colors border border-white/80 shadow-sm"
          >
            <Home size={16} />
            View Public Site
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout