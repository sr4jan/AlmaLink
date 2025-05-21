import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user joining
    socket.on('user:join', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('user:online', userId);
    });

    // Handle private messages
    socket.on('message:send', async (messageData) => {
      const receiverSocketId = onlineUsers.get(messageData.receiver);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:receive', messageData);
      }
    });

    // Handle typing status
    socket.on('typing:start', ({ sender, receiver }) => {
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', sender);
      }
    });

    socket.on('typing:stop', ({ sender, receiver }) => {
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', sender);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      let disconnectedUser;
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          disconnectedUser = userId;
        }
      });

      if (disconnectedUser) {
        onlineUsers.delete(disconnectedUser);
        io.emit('user:offline', disconnectedUser);
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}