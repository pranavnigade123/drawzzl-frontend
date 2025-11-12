import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

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

// ROOM EVENTS
socket.on('roomCreated', (data) => {
  console.log('Room Created!', data);
});

socket.on('roomJoined', (data) => {
  console.log('Room Joined!', data);
});

socket.on('playerJoined', (data) => {
  console.log('Player Joined!', data);
});

socket.on('error', (data) => {
  console.error('Server Error:', data.message);
});

socket.on('connect_error', (error) => {
  console.error('Connection Error:', error.message);
  console.error('Make sure backend is running on', SOCKET_URL);
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect to backend');
});