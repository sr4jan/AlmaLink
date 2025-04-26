import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import "@/styles/themes.css";

const AiChatBubble = dynamic(
  () => import('@/components/AiChatBubble'),
  { ssr: false }
);

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider>
      <SessionProvider session={session}>
        <Navbar />
        <Component {...pageProps} />
        <AiChatBubble />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
          }} 
        />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;