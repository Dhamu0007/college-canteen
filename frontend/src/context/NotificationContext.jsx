import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { notificationsAPI } from '../api/notifications'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { soundFx } from '../utils/soundEffects'

export const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const wsConnected = useRef(false)
  const { isAuthenticated, user } = useAuth()

  const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket(
    'notifications/'
  )

  const fetchNotifications = async (params = {}) => {
    try {
      setLoading(true)
      const response = await notificationsAPI.getNotifications(params)
      setNotifications(response.data.results || response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      setUnreadCount(response.data.unread_count)
      return response.data.unread_count
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token || isAuthenticated) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [isAuthenticated, user])

  // WebSocket message handler
  useEffect(() => {
    const handleNotification = (data) => {
      if (data.type === 'notification_message') {
        const notification = data.data
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        soundFx.playOrderNotification()
        
        // Show toast
        toast(
          <div className="flex items-start gap-2">
            <span className="text-base">🔔</span>
            <div>
              <strong className="block text-earth-900 font-bold">{notification.title}</strong>
              <p className="text-xs text-earth-600 mt-0.5">{notification.message}</p>
            </div>
          </div>,
          { duration: 5000 }
        )
      }
    }

    const handleUnreadCount = (data) => {
      if (data.type === 'unread_count') {
        setUnreadCount(data.count)
      }
    }

    const handleOrderUpdate = (data) => {
      if (data.type === 'order_update') {
        fetchNotifications()
        fetchUnreadCount()
        soundFx.playOrderNotification()
      }
    }

    addMessageHandler('notification', handleNotification)
    addMessageHandler('unread_count', handleUnreadCount)
    addMessageHandler('order_update', handleOrderUpdate)

    return () => {
      removeMessageHandler('notification', handleNotification)
      removeMessageHandler('unread_count', handleUnreadCount)
      removeMessageHandler('order_update', handleOrderUpdate)
    }
  }, [addMessageHandler, removeMessageHandler])

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      return { success: true }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      return { success: false }
    }
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read 🧹')
      return { success: true }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      return { success: false }
    }
  }

  const sendNotification = async (data) => {
    try {
      const response = await notificationsAPI.sendNotification(data)
      toast.success('Notification sent successfully')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send notification')
      return null
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
    sendNotification,
    wsConnected: wsConnected.current,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}