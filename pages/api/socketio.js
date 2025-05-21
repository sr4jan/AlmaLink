import { Server as SocketIOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Store active users
    const activeUsers = new Map();

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user coming online
      socket.on('user:online', (userId) => {
        if (!userId) return;
        
        // Store user's socket id
        activeUsers.set(userId, socket.id);
        socket.userId = userId;
        
        // Join user's personal room
        socket.join(`user:${userId}`);
        console.log(`User ${userId} is online`);
        
        // Broadcast user's online status
        socket.broadcast.emit('user:status', { userId, status: 'online' });
      });

      // Handle real-time messaging
      socket.on('message:send', (message) => {
        const { sender, receiver, content } = message;
        
        // Emit to receiver's room immediately
        io.to(`user:${receiver}`).emit('message:received', message);
        
        // Also emit to sender's other tabs/devices
        socket.to(`user:${sender}`).emit('message:sent', message);
        
        console.log(`Message sent from ${sender} to ${receiver}`);
      });

      // Handle typing indicators
      socket.on('typing:start', ({ chatId, userId }) => {
        socket.to(`chat:${chatId}`).emit('typing:started', { userId });
      });

      socket.on('typing:stop', ({ chatId, userId }) => {
        socket.to(`chat:${chatId}`).emit('typing:stopped', { userId });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          activeUsers.delete(socket.userId);
          io.emit('user:status', { userId: socket.userId, status: 'offline' });
        }
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;