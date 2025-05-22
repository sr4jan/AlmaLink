// components/chat/ChatArea.jsx
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, VideoIcon, MoreVertical, ArrowUp } from 'lucide-react';
import ChatInput from './ChatInput';
import { useChat } from '@/contexts/ChatContext';
import styles from './ChatArea.module.css';

export default function ChatArea({ onBackClick, onProfileClick }) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const {
    selectedChat,
    messages,
    loading,
    error,
    typingUsers,
    onlineUsers,
    refreshMessages
  } = useChat();

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const isNear = distanceFromBottom < 100;
    setIsNearBottom(isNear);
    setShowScrollButton(!isNear);
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedChat?._id]);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  if (!selectedChat) {
    return (
      <div className={styles.emptyChatArea}>
        <div className={styles.welcomeMessage}>
          <h2>Welcome to Chat</h2>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatArea}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBackClick}>
          <ArrowLeft size={24} />
        </button>
        
        <div className={styles.profileSection} onClick={onProfileClick}>
          <div className={styles.avatarContainer}>
            <img 
              src={selectedChat.avatar || '/default-avatar.png'} 
              alt={selectedChat.name}
              className={styles.avatar}
            />
            {onlineUsers?.has(selectedChat._id) && (
              <span className={styles.onlineIndicator} />
            )}
          </div>
          <div className={styles.userInfo}>
            <h2>{selectedChat.name}</h2>
            <p className={styles.status}>
              {typingUsers?.has(selectedChat._id) 
                ? 'typing...' 
                : onlineUsers?.has(selectedChat._id) 
                  ? 'online' 
                  : 'offline'}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionButton}><Phone size={20} /></button>
          <button className={styles.actionButton}><VideoIcon size={20} /></button>
          <button className={styles.actionButton}><MoreVertical size={20} /></button>
        </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className={styles.messagesContainer}
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {loading ? (
            <div className={styles.loadingMessages}>
              <div className={styles.spinner} />
              <p>Loading messages...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={refreshMessages}
              >
                Retry
              </button>
            </div>
          ) : Array.isArray(messages) && messages.length === 0 ? (
            <div className={styles.noMessages}>
              <p>No messages yet</p>
              <p>Start a conversation!</p>
            </div>
          ) : Array.isArray(messages) ? (
            <div className={styles.messagesList}>
              {messages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${styles.message} ${
                    message.sender === selectedChat._id ? styles.received : styles.sent
                  }`}
                >
                  {message.content}
                  <span className={styles.messageTime}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={styles.errorState}>
              <p>Error loading messages</p>
              <button 
                className={styles.retryButton}
                onClick={refreshMessages}
              >
                Retry
              </button>
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button 
          className={styles.scrollToBottomButton}
          onClick={() => scrollToBottom()}
        >
          <ArrowUp size={20} />
        </button>
      )}

      <ChatInput />
    </div>
  );
}