import { io } from 'socket.io-client';

let socket;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      query: { userId }
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};