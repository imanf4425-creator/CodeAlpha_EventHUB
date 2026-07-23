import { io } from 'socket.io-client';

// Connect to backend (same host in dev, Vite proxies WS too)
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

export default socket;
