// pages/api/socketio.js
import { Server as SocketIOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Global variables for instance tracking
let io = null;
const activeUsers = new Map();

const ioHandler = (req, res) => {
  // Only create a new socket server instance if it doesn't exist
  if (!io) {
    console.log('Initializing socket server for the first time');
    
    io = new SocketIOServer(req.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      pingTimeout: 60000,
      pingInterval: 25000,
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket'],
    });

    io.on('connection', (socket) => {
      // Don't log new connections
      socket.on('user:online', (userId) => {
        if (!userId) return;
        
        // Update user's socket ID
        activeUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`);
      });

      socket.on('message:send', (messageData) => {
        if (!messageData?.receiver) return;
        const receiverSocketId = activeUsers.get(messageData.receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', messageData);
        }
      });

      socket.on('typing:start', ({ chatId, userId }) => {
        if (!chatId || !userId) return;
        socket.to(`chat:${chatId}`).emit('typing:started', { userId });
      });

      socket.on('typing:stop', ({ chatId, userId }) => {
        if (!chatId || !userId) return;
        socket.to(`chat:${chatId}`).emit('typing:stopped', { userId });
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          if (activeUsers.get(socket.userId) === socket.id) {
            activeUsers.delete(socket.userId);
            io.emit('user:status', { userId: socket.userId, status: 'offline' });
          }
        }
      });
    });

    // Store io instance on the server object
    req.socket.server.io = io;
  } else {
    // Reuse existing io instance
    req.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;