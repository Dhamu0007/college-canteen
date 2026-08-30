import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Bell, User, Volume2, VolumeX } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'
import { useSound } from '../../hooks/useSound'
import { getImageUrl } from '../../utils/helpers'

const CustomerHeader = () => {
  const { getTotalItems } = useCart()
  const { unreadCount } = useNotifications()
  const { user } = useAuth()
  let sound = null
  try {
    sound = useSound()
  } catch (e) {
    // Fallback if not inside SoundProvider
  }

  return (
    <header className="bg-white border-b border-earth-100 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="EM BABU THINNAVA" className="w-8 h-8 rounded-xl object-cover shadow-sm border border-amber-400/30" />
          <span className="font-display font-bold text-earth-800 text-lg">
            <span className="text-mustard-600">EM BABU</span> THINNAVA?
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {sound && (
            <button
              onClick={sound.toggleMute}
              className={`p-2 rounded-full transition-colors ${
                sound.isMuted
                  ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  : 'text-mustard-600 hover:bg-mustard-50'
              }`}
              title={sound.isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              aria-label="Toggle Sound Effects"
            >
              {sound.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}

          <Link to="/notifications" className="relative p-2 text-earth-600 hover:bg-earth-50 rounded-full">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative p-2 text-earth-600 hover:bg-earth-50 rounded-full">
            <ShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-mustard-500 text-earth-900 text-xs font-bold rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-earth-800 hover:text-mustard-600 transition-colors">
              <div className="w-7 h-7 rounded-full bg-mustard-200 text-earth-900 font-bold text-xs flex items-center justify-center overflow-hidden border border-earth-200">
                {user.profile_picture ? (
                  <img src={getImageUrl(user.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <span className="hidden sm:inline">{user.full_name || user.username}</span>
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-1.5 bg-mustard-500 text-earth-900 font-bold rounded-xl text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default CustomerHeader
