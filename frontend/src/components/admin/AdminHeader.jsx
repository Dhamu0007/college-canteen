import React from 'react'
import { Bell, LogOut, Volume2, VolumeX } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { useSound } from '../../hooks/useSound'
import { getImageUrl } from '../../utils/helpers'

const AdminHeader = () => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  let sound = null
  try {
    sound = useSound()
  } catch (e) {
    // Fallback
  }

  return (
    <header className="bg-white border-b border-earth-100 px-6 py-4 flex items-center justify-between shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-earth-800">Admin Dashboard</h2>
        <p className="text-xs text-earth-500">EM BABU THINNAVA? Management Console</p>
      </div>

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

        <div className="relative p-2 text-earth-600 hover:bg-earth-100 rounded-full cursor-pointer">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-earth-200 pl-4">
          <Link to="/admin/profile" className="flex items-center gap-3 hover:opacity-85 transition-opacity" title="Edit Admin Profile">
            <div className="w-9 h-9 rounded-full bg-mustard-200 text-earth-900 font-bold flex items-center justify-center overflow-hidden border border-earth-200 shadow-xs">
              {user?.profile_picture ? (
                <img src={getImageUrl(user.profile_picture)} alt="Admin Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'A'
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-earth-800">{user?.full_name || user?.username || 'Admin'}</p>
              <p className="text-xs text-earth-500">{user?.admin_profile?.role || 'Administrator'}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
