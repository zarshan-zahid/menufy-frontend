/**
 * FoodFlow Real-Time Client Socket Service
 * Authenticated WebSocket connection with room subscription and safe reconnection handling.
 */
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const serverUrl =
    import.meta.env.VITE_BACKEND_URL ||
    (apiUrl.startsWith('http') ? apiUrl.replace(/\/api\/?$/, '') : '') ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin);

  const token =
    localStorage.getItem('menufy_token') ||
    localStorage.getItem('foodflow_token') ||
    localStorage.getItem('token');

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    // Connected to FoodFlow real-time engine
  });

  socket.on('connect_error', (err) => {
    console.warn('Real-time socket connection issue (falling back to HTTP polling):', err.message);
  });

  return socket;
};

/**
 * Join an order tracking room with phone verification for guest customers
 */
export const joinOrderTracking = (orderNumber, phone = '') => {
  const s = getSocket();
  if (s && orderNumber) {
    s.emit('join:order', { orderNumber: orderNumber.trim(), phone });
  }
};

/**
 * Leave order tracking room
 */
export const leaveOrderTracking = (orderNumber) => {
  const s = getSocket();
  if (s && orderNumber) {
    s.emit('leave:order', { orderNumber: orderNumber.trim() });
  }
};

/**
 * Send real-time rider location telemetry over WebSocket
 */
export const emitRiderLocation = ({ orderNumber, lat, lng, accuracy, permissionDenied, isSharing }) => {
  const s = getSocket();
  if (s && orderNumber) {
    s.emit('rider:location-update', {
      orderNumber,
      lat,
      lng,
      accuracy,
      permissionDenied,
      isSharing,
    });
  }
};
