require('dotenv').config();
const http = require('http');
const app = require('./app');
const pool = require('./config/db');
const { init: initSocket } = require('./socket');

const PORT = process.env.PORT || 3000;

// Create HTTP server so Socket.io can share it
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

pool.connect()
  .then((client) => {
    client.release();
    console.log('✓ Connected to PostgreSQL');
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Socket.io ready for real-time connections`);
    });
  })
  .catch((err) => {
    console.error('✗ Failed to connect to database:', err.message);
    process.exit(1);
  });
