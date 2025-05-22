// pages/chat/index.jsx
'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import { ChatProvider } from '@/contexts/ChatContext';
import styles from '@/styles/ChatPage.module.css';

export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </div>
  );
}