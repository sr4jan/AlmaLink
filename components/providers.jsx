'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" />
    </AuthProvider>
  );
}