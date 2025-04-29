'use client';
import { useState } from 'react';
import { X, Send } from 'lucide-react';
import styles from '@/styles/MessageModal.module.css';

export default function MessageModal({ recipient, onClose, onSend }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <img 
            src={recipient.avatar} 
            alt={recipient.name}
            className={styles.avatar}
          />
          <div>
            <h3>Message {recipient.name}</h3>
            <p>{recipient.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.messageForm}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            autoFocus
          />
          <button 
            type="submit"
            disabled={!message.trim()}
            className={styles.sendButton}
          >
            <Send size={20} />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}