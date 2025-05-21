import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    let socketInstance;

    const initSocket = async () => {
      try {
        await fetch('/api/socketio');
        
        socketInstance = io(undefined, {
          path: '/api/socketio',
          addTrailingSlash: false,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          transports: ['websocket', 'polling']
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
          setIsConnected(true);
          setLastError(null);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Connection error:', error);
          setLastError(error.message);
          setIsConnected(false);
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          setLastError(error.message);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Socket initialization error:', error);
        setLastError(error.message);
      }
    };

    initSocket();

    return () => {
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastError }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}