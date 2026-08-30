import React, { useEffect } from 'react'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useNotifications } from '../../hooks/useNotifications'
import { Bell, Check, Trash2 } from 'lucide-react'
import AnimatedPage from '../../components/animations/AnimatedPage'
import { formatDate } from '../../utils/helpers'

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <CustomerLayout>
      <AnimatedPage className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-earth-900">Notifications</h1>
            <p className="text-xs text-earth-500">Live order updates & canteen announcements</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-mustard-500 text-earth-900 text-xs font-bold px-3 py-1 rounded-full">
              {unreadCount} Unread
            </span>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-earth-100 divide-y divide-earth-100 shadow-xs overflow-hidden">
          {notifications && notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !notif.is_read ? 'bg-mustard-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-mustard-100 text-earth-800 rounded-xl mt-0.5">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-earth-900 text-sm">{notif.title}</h4>
                    <p className="text-xs text-earth-600 mt-1">{notif.message}</p>
                    <span className="text-[10px] text-earth-400 mt-2 block">{formatDate(notif.created_at)}</span>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="px-3 py-1 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Check size={14} /> Mark Read
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-earth-400 text-sm">No notifications to display</div>
          )}
        </div>
      </AnimatedPage>
    </CustomerLayout>
  )
}

export default Notifications
