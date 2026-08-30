/**
 * WebSocket helper utilities for EM BABU THINNAVA platform
 */

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export const createWebSocketConnection = (endpoint, token) => {
  const url = `${WS_BASE_URL}/${endpoint}?token=${token || localStorage.getItem('accessToken') || ''}`
  return new WebSocket(url)
}

export const formatWSMessage = (type, payload) => {
  return JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    payload,
  })
}
