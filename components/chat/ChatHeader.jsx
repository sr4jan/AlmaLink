import { Phone, Video, Info, ArrowLeft } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { formatDistanceToNow } from 'date-fns'
import styles from './ChatHeader.module.css'

export default function ChatHeader({ onBackClick, onProfileClick }) {
  const { selectedChat, onlineUsers } = useChat()

  if (!selectedChat) return null

  const isOnline = onlineUsers.has(selectedChat._id)
  const lastSeen = selectedChat.lastSeen
    ? formatDistanceToNow(new Date(selectedChat.lastSeen), { addSuffix: true })
    : null

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button 
          onClick={onBackClick}
          className={styles.backButton}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={24} />
        </button>

        <div 
          className={styles.profileSection}
          onClick={onProfileClick}
          role="button"
          tabIndex={0}
        >
          <div className={styles.avatarContainer}>
            <img
              src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}`}
              alt={selectedChat.name}
              className={styles.avatar}
            />
            {isOnline && <span className={styles.onlineIndicator} />}
          </div>

          <div className={styles.userInfo}>
            <h2>{selectedChat.name}</h2>
            <p className={styles.status}>
              {isOnline ? 'Online' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.actionButton}
          aria-label="Voice call"
        >
          <Phone size={20} />
        </button>
        <button 
          className={styles.actionButton}
          aria-label="Video call"
        >
          <Video size={20} />
        </button>
        <button 
          className={styles.actionButton}
          aria-label="Chat info"
          onClick={onProfileClick}
        >
          <Info size={20} />
        </button>
      </div>
    </header>
  )
}