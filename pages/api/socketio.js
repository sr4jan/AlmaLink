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
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', (userId) => {
        if (userId) {
          socket.join(userId);
          console.log(`User ${userId} joined room`);
        }
      });

      socket.on('send-message', (message) => {
        console.log('Broadcasting message:', message);
        if (message.receiver) {
          // Broadcast to receiver's room
          io.to(message.receiver).emit('receive-message', message);
          // Also send back to sender's room (to update other tabs/windows)
          io.to(message.sender).emit('receive-message', message);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;