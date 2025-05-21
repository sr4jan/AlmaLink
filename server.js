const express = require('express');
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);

  // Socket.IO setup with error handling
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Add both transports
    allowEIO3: true // Enable compatibility mode
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('user:join', (userId) => {
      if (!userId) return;
      console.log('User joined:', userId);
      socket.join(`user_${userId}`);
    });

    socket.on('message:send', (messageData) => {
      if (!messageData || !messageData.receiver) return;
      console.log('Broadcasting message to:', `user_${messageData.receiver}`);
      io.to(`user_${messageData.receiver}`).emit('message:receive', messageData);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Next.js request handling
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});