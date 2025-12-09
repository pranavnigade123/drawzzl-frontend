import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
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