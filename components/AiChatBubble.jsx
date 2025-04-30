'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, MessageSquare } from 'lucide-react';
import styles from '@/styles/AiChatBubble.module.css';

export default function AiChatBubble({isVisible, setIsVisible}) {
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      setMessages([]);
      setInputMessage('');
    };
  }, []);
  const handleClose = () => {
    setMessages([]);
    onClose();
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Moderation styles
  const moderationStyles = {
    warning: {
      color: '#f59e0b',
      fontSize: '0.875rem',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    error: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    note: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    const userMessageObj = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessageObj]);

    try {
      const response = await fetch('/api/reyn-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userMessage,
          timestamp: new Date().toISOString(),
          userLogin: 'sr4jan' // Add current user's login
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle moderation blocks
        if (data.moderated && data.severity === 'high') {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: data.error,
            sender: 'ai',
            isError: true,
            moderated: true,
            severity: data.severity,
            timestamp: new Date().toISOString()
          }]);
          return;
        }
        throw new Error(data.error || 'AI request failed');
      }

      // Add AI response to chat with moderation info
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.response,
        sender: 'ai',
        moderated: data.moderated,
        severity: data.severity,
        warning: data.warning,
        note: data.note,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render individual message with moderation
  const renderMessage = (message) => {
    const messageClass = `${styles.message} ${
      message.sender === 'user' ? styles.userMessage : styles.aiMessage
    } ${message.isError ? styles.errorMessage : ''}`;

    return (
      <div key={message.id} className={messageClass}>
        {message.sender === 'ai' && (
          <div className={styles.aiAvatar}>
            <Bot size={16} />
          </div>
        )}
        <div className={styles.messageWrapper}>
          <div className={styles.messageContent}>
            {message.text}
          </div>
          {message.warning && (
            <div style={moderationStyles.warning}>
              ⚠️ {message.warning}
            </div>
          )}
          {message.note && (
            <div style={moderationStyles.note}>
              ℹ️ {message.note}
            </div>
          )}
          {message.moderated && message.severity === 'high' && (
            <div style={moderationStyles.error}>
              🚫 This message was blocked due to inappropriate content
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Window */}
      {isVisible && (
        <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <Bot size={20} />
            <span>Reyn AI Assistant</span>
          </div>
          <div className={styles.headerActions}>
            <button 
              onClick={() => onClose()}
              className={styles.headerButton}
              aria-label="Minimize chat"
            >
              <Minimize2 size={18} />
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className={styles.headerButton}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

          {/* Chat Messages */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <Bot size={32} />
                <h3>Hello! I'm Reyn 👋</h3>
                <p>How can I help you today?</p>
              </div>
            )}
            
            {messages.map(renderMessage)}

            {isLoading && (
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <div className={styles.aiAvatar}>
                  <Bot size={16} />
                </div>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className={styles.inputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className={styles.input}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}