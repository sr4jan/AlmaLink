// components/chat/Sidebar.jsx
import { useState, useEffect } from 'react'
import { Search, Plus, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChat } from '@/contexts/ChatContext'
import styles from './Sidebar.module.css'

export default function Sidebar({ onSelectChat }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChats, setFilteredChats] = useState([])
  const [allChats, setAllChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { setSelectedChat } = useChat()

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true)
        // Update the endpoint to the correct path
        const response = await fetch('/api/chat/connections')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch connections')
        }
        
        setAllChats(data)
        setFilteredChats(data)
      } catch (err) {
        console.error('Error fetching connections:', err)
        setError(err.message || 'Failed to load connections')
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(allChats)
      return
    }

    const filtered = allChats.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredChats(filtered)
  }, [searchTerm, allChats])

  const handleChatSelect = (chat) => {
    if (setSelectedChat) {
      setSelectedChat(chat);
      if (onSelectChat) {
        onSelectChat(chat);
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h1>Connections</h1>
        </div>
        <div className={styles.listLoading}>
          <div className={styles.spinnerSmall} />
          <p>Loading connections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h1>Connections</h1>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h1>Connections</h1>
        <button className={styles.newChatButton}>
          <Plus size={20} />
        </button>
      </div>

      <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.chatList}>
        {filteredChats.length === 0 ? (
          <div className={styles.noResults}>
            <p>No connections found</p>
            {searchTerm && <p>Try a different search term</p>}
          </div>
        ) : (
          filteredChats.map(chat => (
            <motion.div
              key={chat._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${styles.chatItem} ${chat.selected ? styles.active : ''}`}
              onClick={() => handleChatSelect(chat)}
            >
              <div className={styles.avatarContainer}>
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className={styles.avatar}
                />
              </div>

              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <h3>{chat.name}</h3>
                  <span className={styles.lastMessageTime}>
                    {chat.lastMessageTime ? formatMessageTime(chat.lastMessageTime) : ''}
                  </span>
                </div>
                
                <div className={styles.connectionPreview}>
                  <p className={styles.lastMessage}>
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <span className={styles.userRole}>
                  {chat.role.charAt(0).toUpperCase() + chat.role.slice(1)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className={styles.sidebarFooter}>
        <button className={styles.settingsButton}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}

function formatMessageTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  
  if (isToday(date)) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString()
}

function isToday(date) {
  const now = new Date()
  return date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
}

function isYesterday(date) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
}