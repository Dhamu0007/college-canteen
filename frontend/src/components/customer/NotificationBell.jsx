import React, { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDate } from '../../utils/helpers'

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-earth-100 transition-colors text-earth-700"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-earth-100 overflow-hidden z-50"
          >
            <div className="p-4 bg-earth-50 border-b border-earth-100 flex items-center justify-between">
              <h4 className="font-bold text-earth-800">Notifications</h4>
              <span className="text-xs bg-mustard-200 text-earth-800 px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} new
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-earth-100">
              {notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-earth-50 transition-colors flex items-start justify-between gap-3 ${
                      !notif.is_read ? 'bg-mustard-50/40' : ''
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-earth-800 text-sm">{notif.title}</p>
                      <p className="text-xs text-earth-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-earth-400 mt-1 block">
                        {formatDate(notif.created_at)}
                      </span>
                    </div>

                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 text-mustard-600 hover:bg-mustard-100 rounded-lg transition-colors flex-shrink-0"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-earth-400 text-sm">No notifications yet</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
