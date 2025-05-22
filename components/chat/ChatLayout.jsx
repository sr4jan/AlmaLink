'use client';
import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ProfileDrawer from './ProfileDrawer';
import styles from './ChatLayout.module.css';

export default function ChatLayout() {
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { selectedChat } = useChat();

  const handleChatSelect = () => {
    setShowSidebar(false); // Hide sidebar on mobile when chat is selected
  };

  const handleBackClick = () => {
    setShowSidebar(true); // Show sidebar when back button is clicked
  };

  return (
    <div className={styles.chatLayout}>
      <div className={`${styles.sidebar} ${showSidebar ? styles.visible : ''}`}>
        <Sidebar onSelectChat={handleChatSelect} />
      </div>

      <div className={styles.mainArea}>
        {selectedChat ? (
          <ChatArea
            onBackClick={handleBackClick}
            onProfileClick={() => setShowProfileDrawer(true)}
          />
        ) : (
          <div className={styles.welcomeScreen}>
            <h2>Welcome to AlmaLink Chat</h2>
            <p>Select a connection to start chatting</p>
          </div>
        )}
      </div>

      {showProfileDrawer && selectedChat && (
        <div className={styles.profileDrawer}>
          <ProfileDrawer
            chat={selectedChat}
            onClose={() => setShowProfileDrawer(false)}
          />
        </div>
      )}
    </div>
  );
}