import { useState, useRef, useEffect } from 'react'
import { 
  Smile, Paperclip, Mic, Send, Image, 
  File, X, Camera 
} from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import styles from './ChatInput.module.css'

// Simple emoji array for basic emoji picker
const emojis = ["😊", "😂", "❤️", "😍", "👍", "🎉", "✨", "🔥", "💯", "🙌", 
                "😭", "😘", "👏", "😅", "🤔", "💪", "🙏", "💕", "💓", "💖"]

export default function ChatInput() {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const typingTimeoutRef = useRef(null);
  const { sendMessage, sendTypingStatus } = useChat()
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const recordingTimeoutRef = useRef(null)

  useEffect(() => {
    if (message) {
      sendTypingStatus(true)
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
      recordingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false)
      }, 1000)
    }
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
    }
  }, [message])
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only update typing status if there's a message
    if (message) {
      setTypingUsers(prev => new Set(prev).add(selectedChat._id));
      
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedChat._id);
          return newSet;
        });
      }, 3000);
    }
  };
  const handleSend = async (e) => {
    e?.preventDefault()
    
    if (!message.trim() && attachments.length === 0) return
    
    try {
      // If there are attachments, upload them first
      let attachmentUrls = []
      if (attachments.length > 0) {
        attachmentUrls = await Promise.all(
          attachments.map(async (attachment) => {
            const formData = new FormData()
            formData.append('file', attachment.file)
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            const data = await response.json()
            return {
              url: data.url,
              type: attachment.type,
              name: attachment.name
            }
          })
        )
      }

      await sendMessage({
        content: message.trim(),
        attachments: attachmentUrls
      })

      setMessage('')
      setAttachments([])
      setShowEmojiPicker(false)
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleAttachment = (type) => {
    fileInputRef.current.accept = {
      'image': 'image/*',
      'file': '*/*',
      'camera': 'image/*,video/*'
    }[type]
    fileInputRef.current.click()
    setShowAttachmentMenu(false)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newAttachments = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      type: file.type,
      name: file.name,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : null
    }))

    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = null
  }

  const removeAttachment = (id) => {
    setAttachments(prev => 
      prev.filter(attachment => {
        if (attachment.id === id && attachment.preview) {
          URL.revokeObjectURL(attachment.preview)
        }
        return attachment.id !== id
      })
    )
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim());
      setMessage('');
      // Clear typing status
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedChat._id);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.inputContainer}>
      {attachments.length > 0 && (
        <div className={styles.attachmentPreviews}>
          {attachments.map(attachment => (
            <div 
              key={attachment.id} 
              className={styles.attachmentPreview}
            >
              {attachment.preview ? (
                <img src={attachment.preview} alt={attachment.name} />
              ) : (
                <File size={24} />
              )}
              <button 
                onClick={() => removeAttachment(attachment.id)}
                className={styles.removeAttachment}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
        
      <form onSubmit={handleSend} className={styles.inputForm}>
        <button
          type="button"
          className={styles.emojiButton}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={24} />
        </button>

        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <div className={styles.emojiList}>
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className={styles.emojiItem}
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className={styles.attachButton}
          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
        >
          <Paperclip size={24} />
        </button>

        {showAttachmentMenu && (
          <div className={styles.attachmentMenu}>
            <button onClick={() => handleAttachment('image')}>
              <Image size={20} />
              <span>Gallery</span>
            </button>
            <button onClick={() => handleAttachment('camera')}>
              <Camera size={20} />
              <span>Camera</span>
            </button>
            <button onClick={() => handleAttachment('file')}>
              <File size={20} />
              <span>Document</span>
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />

        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.messageInput}
        />

        {message.trim() || attachments.length > 0 ? (
          <button type="submit" className={styles.sendButton}>
            <Send size={24} />
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic size={24} />
          </button>
        )}
      </form>
    </div>
  )
}