import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Home,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const AdminSidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-earth-100 min-h-screen flex flex-col justify-between p-4">
      <div>
        <div className="p-4 border-b border-earth-100 mb-4">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="EM BABU" className="w-8 h-8 rounded-xl object-cover shadow-xs border border-amber-400/30" />
            <span className="font-display font-bold text-earth-800 text-lg">
              <span className="text-mustard-600">EM BABU</span> Admin
            </span>
          </Link>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm
                  ${
                    isActive
                      ? 'bg-mustard-500 text-earth-900 shadow-xs'
                      : 'text-earth-600 hover:bg-earth-50 hover:text-earth-900'
                  }
                `}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-earth-100 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-earth-600 hover:bg-earth-50 text-sm font-semibold transition-colors"
        >
          <Home size={18} />
          Customer View
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
