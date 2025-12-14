import { io, Socket } from 'socket.io-client';
import { getSession, clearSession } from './session';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
const USE_PRODUCTION_FIXES = process.env.NEXT_PUBLIC_USE_PRODUCTION_FIXES === 'true';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  // Production optimizations (only if enabled)
  ...(USE_PRODUCTION_FIXES && {
    timeout: 20000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    forceNew: false,
  }),
});

// Auto-reconnection logic
socket.on('connect', () => {
  console.log('[SESSION] Socket connected:', socket.id);
  
  // Only handle session on client-side
  if (typeof window !== 'undefined') {
    // Check for existing session and attempt reconnection
    const session = getSession();
    if (session && session.roomId) {
      console.log('[SESSION] Attempting auto-reconnection to room:', session.roomId);
      socket.emit('reconnectToRoom', {
        sessionId: session.sessionId,
        roomId: session.roomId
      });
    }
  }
});

socket.on('disconnect', (reason) => {
  console.log('[SESSION] Socket disconnected:', reason);
});

socket.on('reconnectionSuccess', (data) => {
  console.log('[SESSION] Reconnection successful:', data);
  // The Lobby component will handle the game state sync
});

socket.on('error', (error) => {
  console.error('[SESSION] Socket error:', error);
  // Clear session if it's invalid (client-side only)
  if (typeof window !== 'undefined' && (error.message?.includes('Session not found') || error.message?.includes('Room not found'))) {
    clearSession();
  }
});

// Enhanced connection monitoring
socket.on('connect_error', (error) => {
  console.error('[SESSION] Connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('[SESSION] Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_failed', () => {
  console.error('[SESSION] Failed to reconnect after maximum attempts');
});

// Make socket globally accessible in browser (for testing)
if (typeof window !== 'undefined') {
  (window as any).socket = socket;
}

// Connection Logs
socket.on('connect', () => {
  console.log('Connected to drawzzl backend! ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from backend');
});