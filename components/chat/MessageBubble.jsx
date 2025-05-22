import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Check, CheckCheck, MoreVertical, 
  Download, Reply, Forward, Trash 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './MessageBubble.module.css'

export default function MessageBubble({ 
  message, 
  showAvatar = true,
  showTimestamp = true
}) {
  const [showActions, setShowActions] = useState(false)
  const isCurrentUser = message.sender._id === session?.user?.id

  const renderStatus = () => {
    if (message.status === 'sending') {
      return <Check size={16} className={styles.statusIcon} />
    }
    if (message.status === 'sent') {
      return <CheckCheck size={16} className={`${styles.statusIcon} ${styles.sent}`} />
    }
    if (message.status === 'delivered') {
      return <CheckCheck size={16} className={`${styles.statusIcon} ${styles.delivered}`} />
    }
    if (message.status === 'read') {
      return <CheckCheck size={16} className={`${styles.statusIcon} ${styles.read}`} />
    }
    return null
  }

  const renderAttachments = () => {
    if (!message.attachments?.length) return null

    return (
      <div className={styles.attachments}>
        {message.attachments.map((attachment, index) => {
          if (attachment.type.startsWith('image/')) {
            return (
              <div key={index} className={styles.imageAttachment}>
                <img 
                  src={attachment.url} 
                  alt="attachment"
                  onClick={() => {/* Open image viewer */}}
                />
              </div>
            )
          }
          return (
            <div key={index} className={styles.fileAttachment}>
              <div className={styles.fileInfo}>
                <File size={20} />
                <span>{attachment.name}</span>
              </div>
              <button className={styles.downloadButton}>
                <Download size={20} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div 
      className={`${styles.messageContainer} ${
        isCurrentUser ? styles.sent : styles.received
      }`}
    >
      {showAvatar && !isCurrentUser && (
        <img 
          src={message.sender.avatar} 
          alt={message.sender.name}
          className={styles.avatar}
        />
      )}

      <div className={styles.messageContent}>
        {!isCurrentUser && showAvatar && (
          <span className={styles.senderName}>
            {message.sender.name}
          </span>
        )}

        <div 
          className={styles.messageBubble}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {renderAttachments()}
          {message.content && (
            <p className={styles.messageText}>{message.content}</p>
          )}
          
          {showTimestamp && (
            <span className={styles.timestamp}>
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
          )}

          {isCurrentUser && renderStatus()}

          <AnimatePresence>
            {showActions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={styles.messageActions}
              >
                <button onClick={() => {/* Handle reply */}}>
                  <Reply size={16} />
                </button>
                <button onClick={() => {/* Handle forward */}}>
                  <Forward size={16} />
                </button>
                {isCurrentUser && (
                  <button onClick={() => {/* Handle delete */}}>
                    <Trash size={16} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}