"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSocket } from '@/contexts/SocketContext';
import { format, isToday, isYesterday, formatDistanceToNowStrict } from "date-fns"
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  Smile,
  ArrowLeft,
  Users,
  Phone,
  Video,
  Info,
  X,
  Plus,
  Filter,
  Mic,
} from "lucide-react"
import styles from "@/styles/Chat.module.css"

// Helper function to format timestamps dynamically
const formatTimestamp = (date) => {
  const now = new Date()
  const messageDate = new Date(date)

  if (isToday(messageDate)) {
    return format(messageDate, "HH:mm")
  } else if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, "HH:mm")}`
  } else {
    // Older than yesterday
    return format(messageDate, "dd/MM/yy HH:mm")
  }
}

// Add this to your React component


// Helper to get concise last message time for sidebar
const formatLastMessageTime = (date) => {
  if (!date) return ""
  const messageDate = new Date(date)
  if (isToday(messageDate)) {
    return format(messageDate, "HH:mm")
  } else if (isYesterday(messageDate)) {
    return "Yesterday"
  } else {
    return format(messageDate, "dd/MM/yy")
  }
}

export default function ChatPage() {
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { socket, isConnected } = useSocket();
  const { data: session, status } = useSession()
  const router = useRouter()
  const [connections, setConnections] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [showProfileInfo, setShowProfileInfo] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const messageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const lastMessageRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat?._id) return;
      
      try {
        const response = await fetch(`/api/chat/messages/${selectedChat._id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedChat?._id]);

  
  // --- Effects ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated") {
      fetchConnections()
    }
  }, [status, router])
  useEffect(() => {
    const handleResize = () => {
      const initialWindowHeight = window.innerHeight
      
      if ('visualViewport' in window) {
        const handleViewportResize = () => {
          const isKeyboardVisible = window.visualViewport.height < initialWindowHeight
          document.querySelector(`.${styles.chatPageContainer}`)?.classList.toggle('keyboardVisible', isKeyboardVisible)
        }
        window.visualViewport.addEventListener('resize', handleViewportResize)
        return () => window.visualViewport.removeEventListener('resize', handleViewportResize)
      } else {
        const handleWindowResize = () => {
          const isKeyboardVisible = window.innerHeight < initialWindowHeight
          document.querySelector(`.${styles.chatPageContainer}`)?.classList.toggle('keyboardVisible', isKeyboardVisible)
        }
        window.addEventListener('resize', handleWindowResize)
        return () => window.removeEventListener('resize', handleWindowResize)
      }
    }
  
    if (typeof window !== 'undefined') {
      handleResize()
    }
  }, [])
  
  // Add scroll to bottom when keyboard appears
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', scrollToBottom);
      return () => window.visualViewport.removeEventListener('resize', scrollToBottom);
    }
  }, []);
  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id)
      // On mobile, hide sidebar when a chat is selected
      if (window.innerWidth <= 768) {
        setIsSidebarVisible(false)
      }
    } else {
      setMessages([])
    }
  }, [selectedChat])

  // Effect to scroll down when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // --- Data Fetching ---
  const fetchConnections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/chat/connections")
      if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch connections")
      const data = await response.json()
      // Add dummy last message time and status for UI demo
      const connectionsWithDemoData = data.map((conn) => ({
        ...conn,
        lastMessageTimestamp:
          conn.lastMessageTimestamp || new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5).toISOString(),
        isOnline: conn.isOnline === undefined ? Math.random() > 0.5 : conn.isOnline,
        role: conn.role || (Math.random() > 0.6 ? "Alumni" : "Student"),
      }))
      setConnections(connectionsWithDemoData)
    } catch (err) {
      console.error("Error fetching connections:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    setLoadingMessages(true)
    setError(null)
    try {
      const response = await fetch(`/api/chat/messages/${chatId}`)
      if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch messages")
      const data = await response.json()
      // Add dummy sender/receiver and read status for UI demo if needed
      const messagesWithDemoData = data.map((msg, index) => ({
        ...msg,
        sender: msg.sender || (index % 2 === 0 ? session?.user?.id : selectedChat?._id),
        read: msg.read === undefined ? (msg.sender === session?.user?.id ? Math.random() > 0.3 : undefined) : msg.read,
        createdAt:
          msg.createdAt || new Date(Date.now() - Math.random() * 1000 * 60 * 60 * (data.length - index)).toISOString(),
      }))
      setMessages(messagesWithDemoData)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError(err.message)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleNewMessage = useCallback((message) => {
    if (!selectedChat) return;
    
    const isRelevantChat = 
      message.sender === selectedChat._id || 
      message.receiver === selectedChat._id;
  
    if (isRelevantChat) {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(msg => msg._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Scroll to bottom
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, lastMessageRef]); // Add lastMessageRef to dependencies
 // In your ChatPage component
useEffect(() => {
  if (!socket || !session?.user?.id || !isConnected) return;

  // Only set up listeners once connected
  console.log('Setting up socket listeners for user:', session.user.id);
  
  // Announce user is online
  socket.emit('user:online', session.user.id);
  
  // Handle incoming messages
  socket.on('message:received', handleNewMessage);
  socket.on('message:sent', handleNewMessage);
  
  // Handle typing indicators
  socket.on('typing:started', ({ userId, userName }) => {
    setTypingUsers(prev => {
      const newSet = new Set([...prev]);
      newSet.add(userName || userId);
      return newSet;
    });
  });
  
  socket.on('typing:stopped', ({ userId, userName }) => {
    setTypingUsers(prev => {
      const newSet = new Set([...prev]);
      newSet.delete(userName || userId);
      return newSet;
    });
  });

  return () => {
    if (socket) {
      console.log('Removing socket listeners');
      socket.off('message:received');
      socket.off('message:sent');
      socket.off('typing:started');
      socket.off('typing:stopped');
    }
  };
}, [socket, session?.user?.id, isConnected, handleNewMessage]); // Added handleNewMessage to dependencies
  // --- Event Handlers ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat || !session?.user?.id) return;

    const messageToSend = {
      _id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      sender: session.user.id,
      receiver: selectedChat._id,
      createdAt: new Date().toISOString(),
    };

    // Clear input
    setNewMessage('');
    
    // Stop typing indicator
    socket.emit('typing:stop', {
      chatId: selectedChat._id,
      userId: session.user.id
    });

    // Optimistic update
    setMessages(prev => [...prev, messageToSend]);
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      // Save to database
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageToSend.content,
          receiver: selectedChat._id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const savedMessage = await response.json();

      // Emit via socket
      if (socket && isConnected) {
        socket.emit('message:send', {
          ...savedMessage,
          sender: session.user.id,
          receiver: selectedChat._id,
        });
      }

      // Update message in state with saved version
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageToSend._id ? savedMessage : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error state
    }
  };

  // Add this debug section to monitor socket and chat state
  
  
  const handleTyping = () => {
    if (!socket || !selectedChat || !session?.user?.id) return;
  
    // Emit typing start with user name
    socket.emit('typing:start', {
      chatId: selectedChat._id,
      userId: session.user.id,
      userName: session.user.name
    });
  
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', {
        chatId: selectedChat._id,
        userId: session.user.id,
        userName: session.user.name
      });
    }, 1000);
  };

  const handleSelectChat = (connection) => {
    if (selectedChat?._id !== connection._id) {
      setSelectedChat(connection)
      setShowProfileInfo(false)
    }
    // On mobile, hide sidebar after selection
    if (window.innerWidth <= 768) {
      setIsSidebarVisible(false)
    }
  }

  const handleBackToSidebar = () => {
    setSelectedChat(null)
    setIsSidebarVisible(true)
    setShowProfileInfo(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newAttachments = files.map((file) => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
    // Focus on input after adding attachment
    messageInputRef.current?.focus()
  }

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji)
    messageInputRef.current?.focus()
  }

  const toggleRecording = () => {
    // This would be implemented with actual audio recording API
    setIsRecording(!isRecording)
  }

  const toggleProfileInfo = () => {
    setShowProfileInfo(!showProfileInfo)
  }

  // --- Utilities ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // --- Rendering Logic ---
  if (status === "loading" || (status === "authenticated" && loading && connections.length === 0)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your chats...</p>
      </div>
    )
  }

  // Error display specific to connection loading
  if (error && !selectedChat && connections.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading connections: {error}</p>
        <button className={styles.retryButton} onClick={fetchConnections}>
          Retry
        </button>
      </div>
    )
  }

  const filteredConnections = connections.filter((conn) => conn.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  // Function to render message status icon
  const renderMessageStatus = (message) => {
    if (message.status === "sending") {
      return <Check size={16} className={`${styles.statusIcon} ${styles.sending}`} />
    }
    if (message.status === "failed") {
      return <span className={styles.errorIndicator}>!</span>
    }
    if (message.read) {
      return <CheckCheck size={16} className={`${styles.statusIcon} ${styles.read}`} />
    }
    if (message.status === "sent" || message.delivered) {
      return <Check size={16} className={`${styles.statusIcon} ${styles.delivered}`} />
    }
    return null
  }

  // Mock emoji picker component
  const EmojiPicker = () => (
    <div className={styles.emojiPicker} ref={emojiPickerRef}>
      <div className={styles.emojiPickerHeader}>
        <span>Emojis</span>
        <button onClick={() => setShowEmojiPicker(false)} className={styles.closeEmojiBtn}>
          <X size={16} />
        </button>
      </div>
      <div className={styles.emojiGrid}>
        {[
          "😊",
          "😂",
          "❤️",
          "👍",
          "🎉",
          "🔥",
          "😍",
          "🙏",
          "👏",
          "🤔",
          "😢",
          "😎",
          "🥳",
          "😴",
          "🤗",
          "😇",
          "🤩",
          "😋",
          "🤣",
          "😮",
        ].map((emoji) => (
          <button key={emoji} className={styles.emojiButton} onClick={() => handleEmojiSelect(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )

  // Profile info sidebar
  const ProfileInfo = () => (
    <div className={styles.profileInfo}>
      <div className={styles.profileInfoHeader}>
        <button onClick={toggleProfileInfo} className={styles.closeProfileBtn}>
          <X size={20} />
        </button>
        <h3>Contact Info</h3>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileAvatar}>
          <img
            src={
              selectedChat.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=random`
            }
            alt={`${selectedChat.name}'s avatar`}
          />
        </div>
        <h2>{selectedChat.name}</h2>
        <p className={styles.profileRole}>{selectedChat.role || "Member"}</p>

        <div className={styles.profileSection}>
          <h4>About</h4>
          <p>Available to chat and connect with students.</p>
        </div>

        <div className={styles.profileSection}>
          <h4>Email</h4>
          <p>{selectedChat.email || "No email available"}</p>
        </div>

        <div className={styles.profileActions}>
          <button className={styles.profileActionBtn}>
            <Phone size={20} />
            <span>Call</span>
          </button>
          <button className={styles.profileActionBtn}>
            <Video size={20} />
            <span>Video</span>
          </button>
          <button className={styles.profileActionBtn}>
            <Search size={20} />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.chatPageContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarVisible ? styles.visible : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.userProfile}>
            <img
              src={
                session?.user?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "User")}&background=random`
              }
              alt="Your profile"
              className={styles.userAvatar}
            />
            <h2>Chats</h2>
          </div>
          <div className={styles.sidebarActions}>
            <button className={styles.iconButton} aria-label="New chat">
              <Plus size={20} />
            </button>
            <button className={styles.iconButton} aria-label="Filter">
              <Filter size={20} />
            </button>
            <button className={styles.iconButton} aria-label="More options">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search or start a new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.connectionsList}>
          {loading && connections.length === 0 && (
            <div className={styles.listLoading}>
              <div className={styles.spinnerSmall}></div>
              <p>Loading connections...</p>
            </div>
          )}

          {!loading && filteredConnections.length === 0 && (
            <div className={styles.noResults}>
              <p>No connections found.</p>
              <p>Try a different search term or start a new chat.</p>
            </div>
          )}

          {filteredConnections.map((connection) => (
            <div
              key={connection._id}
              className={`${styles.connectionItem} ${selectedChat?._id === connection._id ? styles.active : ""}`}
              onClick={() => handleSelectChat(connection)}
              role="button"
              tabIndex={0}
              aria-label={`Chat with ${connection.name}`}
            >
              <div className={styles.avatarContainer}>
                <img
                  src={
                    connection.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=random`
                  }
                  alt={`${connection.name}'s avatar`}
                  className={styles.avatar}
                />
                {connection.isOnline && <div className={styles.onlineIndicator}></div>}
              </div>
              <div className={styles.connectionInfo}>
                <div className={styles.connectionHeader}>
                  <h3>{connection.name}</h3>
                  <span className={styles.lastMessageTime}>
                    {formatLastMessageTime(connection.lastMessageTimestamp)}
                  </span>
                </div>
                <div className={styles.connectionPreview}>
                  <p className={styles.lastMessage}>{connection.lastMessage || "No messages yet"}</p>
                  {connection.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {connection.unreadCount > 9 ? "9+" : connection.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`${styles.chatArea} ${selectedChat ? styles.active : ""}`}>
        {selectedChat ? (
          <>
            <header className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                {/* Mobile Back Button */}
                <button onClick={handleBackToSidebar} className={`${styles.iconButton} ${styles.backButton}`}>
                  <ArrowLeft size={20} />
                </button>
                <div className={styles.headerProfile} onClick={toggleProfileInfo} role="button" tabIndex={0}>
                  <div className={styles.avatarContainer}>
                    <img
                      src={
                        selectedChat.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=random`
                      }
                      alt={`${selectedChat.name}'s avatar`}
                      className={styles.avatar}
                    />
                    {selectedChat.isOnline && <div className={styles.onlineIndicatorHeader}></div>}
                  </div>
                  <div className={styles.headerInfo}>
                    <h2>{selectedChat.name}</h2>
                    <p className={styles.userStatus}>
                      {selectedChat.isOnline
                        ? "Online"
                        : `Last seen ${formatDistanceToNowStrict(new Date(selectedChat.lastSeen || Date.now() - 1000 * 60 * 15))} ago`}
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                <button className={styles.iconButton} aria-label="Voice call">
                  <Phone size={20} />
                </button>
                <button className={styles.iconButton} aria-label="Video call">
                  <Video size={20} />
                </button>
                <button className={styles.iconButton} aria-label="Contact info" onClick={toggleProfileInfo}>
                  <Info size={20} />
                </button>
              </div>
            </header>

            <div className={styles.messagesContainer}>
            {typingUsers.size > 0 && (
    <div className={styles.typingIndicator}>
      <span>{Array.from(typingUsers)[0]} is typing...</span>
    </div>
  )}
              {loadingMessages && (
                <div className={styles.loadingMessages}>
                  <div className={styles.spinner}></div>
                  <p>Loading messages...</p>
                </div>
              )}

              {error && !loadingMessages && (
                <div className={styles.errorContainerInline}>
                  <p>Error loading messages: {error}</p>
                  <button className={styles.retryButtonSmall} onClick={() => fetchMessages(selectedChat._id)}>
                    Retry
                  </button>
                </div>
              )}

              {!loadingMessages && messages.length === 0 && !error && (
                <div className={styles.noMessages}>
                  <div className={styles.noMessagesIcon}>
                    <Users size={48} />
                  </div>
                  <h3>Start your conversation with {selectedChat.name}</h3>
                  <p>Say hello and begin connecting!</p>
                </div>
              )}

{!loadingMessages &&
  messages.map((message, index) => {
    const showDateDivider = index === 0 || (
      index > 0 && 
      new Date(message.createdAt).toDateString() !== 
      new Date(messages[index - 1].createdAt).toDateString()
    );

    const messageSenderId = typeof message.sender === 'object' 
      ? message.sender._id 
      : message.sender;
    
    const currentUserId = session?.user?.id;
    const isCurrentUser = String(messageSenderId) === String(currentUserId);

    return (
      <div key={message._id || `msg-${index}`}>
        {showDateDivider && (
          <div className={styles.dateDivider}>
            <span>{format(new Date(message.createdAt), "EEEE, MMMM d")}</span>
          </div>
        )}
        <div 
          className={`${styles.messageWrapper} ${
            isCurrentUser ? styles.sent : styles.received
          }`}
        >
          <div className={styles.messageContent}>
            {/* Message content without debug info */}
            <div className={styles.messageText}>
              {message.content}
            </div>

            <div className={styles.messageInfo}>
              <span className={styles.timestamp}>
                {formatTimestamp(message.createdAt)}
              </span>
              {isCurrentUser && renderMessageStatus(message)}
            </div>
          </div>
        </div>
      </div>
    );
  })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className={styles.attachmentsPreview}>
                {attachments.map((attachment) => (
                  <div key={attachment.id} className={styles.attachmentPreviewItem}>
                    {attachment.type.startsWith("image") ? (
                      <div className={styles.imagePreview}>
                        <img src={attachment.url || "/placeholder.svg"} alt={attachment.name} />
                        <button
                          className={styles.removeAttachmentBtn}
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.filePreview}>
                        <Paperclip size={16} />
                        <span>{attachment.name}</span>
                        <button
                          className={styles.removeAttachmentBtn}
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form className={styles.inputContainer} onSubmit={handleSendMessage}>
              <div className={styles.inputActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label="Add emoji"
                >
                  <Smile size={22} />
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                >
                  <Paperclip size={22} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
              </div>

              <div className={styles.inputWrapper}>
              <input
  type="text"
  placeholder="Type a message..."
  value={newMessage}
  onChange={(e) => {
    setNewMessage(e.target.value);
    handleTyping();
  }}
  className={styles.messageInput}
  ref={messageInputRef}
  aria-label="Message input"
  onFocus={() => {
    // Use the styles module class name
    document.querySelector(`.${styles.chatPageContainer}`)?.classList.add(styles.inputFocused);
    // Use the global class for mobile nav since it's in a different component
    document.querySelector('.mobileNav')?.classList.add(styles.hidden);
  }}
  
  onBlur={() => {
    setTimeout(() => {
      document.querySelector(`.${styles.chatPageContainer}`)?.classList.remove(styles.inputFocused);
      document.querySelector('.mobileNav')?.classList.remove(styles.hidden);
    }, 100);
  }}
/>
    {showEmojiPicker && <EmojiPicker />}
  </div>

              {newMessage.trim() || attachments.length > 0 ? (
                <button type="submit" className={styles.sendButton} aria-label="Send message">
                  <Send size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.sendButton} ${isRecording ? styles.recording : ""}`}
                  onClick={toggleRecording}
                  aria-label={isRecording ? "Stop recording" : "Start voice recording"}
                >
                  <Mic size={20} />
                </button>
              )}
            </form>

            {/* Profile info sidebar */}
            {showProfileInfo && <ProfileInfo />}
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeIcon}>
                <Users size={64} />
              </div>
              <h2>Welcome, {session?.user?.name || "User"}!</h2>
              <p>Select a connection from the sidebar to start chatting.</p>
              <p className={styles.welcomeSubtext}>Connect with alumni and students from your college.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}