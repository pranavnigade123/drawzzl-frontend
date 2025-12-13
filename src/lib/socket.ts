import { io, Socket } from 'socket.io-client';

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