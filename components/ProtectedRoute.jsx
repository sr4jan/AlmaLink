'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return null;
  }

  return children;
}