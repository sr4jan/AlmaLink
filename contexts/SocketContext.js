"use client"

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        if (!socketRef.current) {
          // Initialize socket endpoint
          await fetch('/api/socketio');
          
          if (!mounted) return;

          const socket = io(undefined, {
            path: '/api/socketio',
            addTrailingSlash: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            transports: ['websocket']
          });

          socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            setLastError(null);
          });

          socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
          });

          socket.on('connect_error', (error) => {
            setLastError(error.message);
            setIsConnected(false);
          });

          socketRef.current = socket;
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        setLastError(error.message);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      lastError
    }}>
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