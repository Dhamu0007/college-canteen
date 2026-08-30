import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export const useWebSocket = (endpoint) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const isMountedRef = useRef(true)
  const messageHandlers = useRef({})
  const { isAuthenticated, user } = useAuth()

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || !isMountedRef.current) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const ws = new WebSocket(`${WS_URL}/${endpoint}?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      if (isMountedRef.current) {
        setIsConnected(true)
      }
      wsRef.current = ws
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (isMountedRef.current) {
          setLastMessage(data)
        }
        
        // Call registered handlers
        Object.values(messageHandlers.current).forEach(handler => {
          try {
            handler(data)
          } catch (error) {
            console.error('Error in message handler:', error)
          }
        })
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      if (isMountedRef.current) {
        setIsConnected(false)
        
        // Attempt to reconnect after 5 seconds if still mounted
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connect()
          }
        }, 5000)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      ws.close()
    }

    wsRef.current = ws
  }, [endpoint, isAuthenticated, user])

  useEffect(() => {
    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      return true
    }
    return false
  }, [])

  const addMessageHandler = useCallback((key, handler) => {
    messageHandlers.current[key] = handler
  }, [])

  const removeMessageHandler = useCallback((key) => {
    delete messageHandlers.current[key]
  }, [])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    addMessageHandler,
    removeMessageHandler,
  }
}