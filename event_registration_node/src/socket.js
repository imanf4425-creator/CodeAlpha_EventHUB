/**
 * Socket.io instance — shared across the app.
 * Initialize once in server.js, then import anywhere to emit events.
 */
let _io = null;

function init(httpServer) {
  const { Server } = require('socket.io');
  _io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  _io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return _io;
}

function getIO() {
  if (!_io) throw new Error('Socket.io not initialized');
  return _io;
}

module.exports = { init, getIO };
