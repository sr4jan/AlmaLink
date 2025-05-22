import { 
    X, Camera, Bell, Block, Flag, 
    Trash, Volume2, Lock 
  } from 'lucide-react'
  import { useState } from 'react'
  import styles from './ProfileDrawer.module.css'
  
  export default function ProfileDrawer({ chat, onClose }) {
    const [notifications, setNotifications] = useState(true)
    const [isBlocked, setIsBlocked] = useState(false)
  
    const mediaCount = {
      images: 24,
      videos: 5,
      files: 12
    }
  
    return (
      <div className={styles.drawer}>
        <header className={styles.header}>
          <button 
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close profile"
          >
            <X size={24} />
          </button>
          <h2>Contact Info</h2>
        </header>
  
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatarContainer}>
              <img
                src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`}
                alt={chat.name}
                className={styles.avatar}
              />
              <button className={styles.changeAvatarButton}>
                <Camera size={20} />
              </button>
            </div>
            <h3>{chat.name}</h3>
            <p className={styles.email}>{chat.email}</p>
            <p className={styles.bio}>
              {chat.bio || 'Hey there! I\'m using AlmaLink'}
            </p>
          </div>
  
          <div className={styles.section}>
            <h4>Media, Files and Links</h4>
            <div className={styles.mediaGrid}>
              {/* Placeholder for media preview */}
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className={styles.mediaItem}>
                  <img src="/placeholder.jpg" alt="Media preview" />
                </div>
              ))}
            </div>
            <button className={styles.seeAllButton}>
              See All
            </button>
          </div>
  
          <div className={styles.section}>
            <div className={styles.settingItem}>
              <Bell size={20} />
              <span>Notifications</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
  
            <div className={styles.settingItem}>
              <Volume2 size={20} />
              <span>Mute</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={!notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
  
            <div className={styles.settingItem}>
              <Lock size={20} />
              <span>Encryption</span>
              <span className={styles.encryptionInfo}>
                Messages are end-to-end encrypted
              </span>
            </div>
          </div>
  
          <div className={`${styles.section} ${styles.dangerZone}`}>
            <button 
              className={`${styles.dangerButton} ${isBlocked ? styles.blocked : ''}`}
              onClick={() => setIsBlocked(!isBlocked)}
            >
              <Block size={20} />
              <span>{isBlocked ? 'Unblock' : 'Block'} {chat.name}</span>
            </button>
  
            <button className={styles.dangerButton}>
              <Flag size={20} />
              <span>Report</span>
            </button>
  
            <button className={`${styles.dangerButton} ${styles.delete}`}>
              <Trash size={20} />
              <span>Delete Chat</span>
            </button>
          </div>
        </div>
      </div>
    )
  }