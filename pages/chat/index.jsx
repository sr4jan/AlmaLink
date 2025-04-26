'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';
import {
  Search,
  Send,
  Paperclip,
  Image as ImageIcon, // Renamed to avoid conflict
  MoreVertical,
  Check,
  CheckCheck,
  Smile, // For emoji picker placeholder
  ArrowLeft, // For mobile back button
  Users // Placeholder for group info or similar
} from 'lucide-react';
import styles from '@/styles/Chat.module.css'; // Ensure this path is correct

// Helper function to format timestamps dynamically
const formatTimestamp = (date) => {
  const now = new Date();
  const messageDate = new Date(date);

  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, 'HH:mm')}`;
  } else {
    // Older than yesterday
    return format(messageDate, 'dd/MM/yy HH:mm');
  }
};

// Helper to get concise last message time for sidebar
const formatLastMessageTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'dd/MM/yy');
    }
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // For mobile toggle
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input

  // --- Effects ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchConnections();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id);
      // On mobile, hide sidebar when a chat is selected
      if (window.innerWidth <= 768) {
        setIsSidebarVisible(false);
      }
    } else {
        setMessages([]); // Clear messages if no chat is selected
    }
  }, [selectedChat]);

   // Effect to scroll down when messages change
   useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Data Fetching ---
  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat/connections');
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch connections');
      const data = await response.json();
       // Add dummy last message time and status for UI demo
       const connectionsWithDemoData = data.map(conn => ({
        ...conn,
        lastMessageTimestamp: conn.lastMessageTimestamp || new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5).toISOString(), // Random time in last 5 days
        isOnline: conn.isOnline === undefined ? Math.random() > 0.5 : conn.isOnline, // Random online status if not provided
        role: conn.role || (Math.random() > 0.6 ? 'Alumni' : 'Student') // Random role
      }));
      setConnections(connectionsWithDemoData);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoadingMessages(true);
    setError(null); // Clear previous errors specific to messages
    try {
      const response = await fetch(`/api/chat/messages/${chatId}`);
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch messages');
      const data = await response.json();
       // Add dummy sender/receiver and read status for UI demo if needed
       const messagesWithDemoData = data.map((msg, index) => ({
        ...msg,
        // Ensure sender exists, fallback for demo
        sender: msg.sender || (index % 2 === 0 ? session?.user?.id : selectedChat?._id),
        // Simulate read status for demo
        read: msg.read === undefined ? (msg.sender === session?.user?.id ? Math.random() > 0.3 : undefined) : msg.read,
        createdAt: msg.createdAt || new Date(Date.now() - Math.random() * 1000 * 60 * 60 * (data.length - index)).toISOString(),
      }));
      setMessages(messagesWithDemoData);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message); // Show message-specific error
    } finally {
        setLoadingMessages(false);
    }
  };

  // --- Event Handlers ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !session?.user?.id) return;

    const tempMessageId = `temp-${Date.now()}`; // Optimistic UI ID
    const messageToSend = {
        _id: tempMessageId, // Temporary ID for optimistic update
        content: newMessage,
        sender: session.user.id, // Current user is the sender
        receiver: selectedChat._id, // The other person in the selected chat
        createdAt: new Date().toISOString(),
        status: 'sending', // Add status for optimistic UI
        read: false
    };

    // Optimistic UI update
    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');
    scrollToBottom();

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageToSend.content,
          receiver: messageToSend.receiver,
          // Add any other necessary fields your API expects
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to send message');
      }

      const sentMessage = await response.json();

      // Replace temp message with actual message from server
      setMessages(prev => prev.map(msg =>
        msg._id === tempMessageId ? { ...sentMessage, status: 'sent' } : msg
      ));

    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Failed to send: ${err.message}`);
       // Update message status to failed
       setMessages(prev => prev.map(msg =>
        msg._id === tempMessageId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const handleSelectChat = (connection) => {
    if (selectedChat?._id !== connection._id) {
        setSelectedChat(connection);
        // Messages will be fetched by the useEffect hook
    }
    // On mobile, hide sidebar after selection
    if (window.innerWidth <= 768) {
        setIsSidebarVisible(false);
    }
  };

  const handleBackToSidebar = () => {
    setSelectedChat(null);
    setIsSidebarVisible(true);
  }

  // --- Utilities ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Rendering Logic ---
  if (status === 'loading' || (status === 'authenticated' && loading && connections.length === 0)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your chats...</p>
      </div>
    );
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
    );
  }

  const filteredConnections = connections.filter(conn =>
    conn.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to render message status icon
  const renderMessageStatus = (message) => {
    if (message.sender !== session?.user?.id) return null; // Only show status for sent messages

    if (message.status === 'sending') {
      return <Check size={16} className={styles.sending} />; // Or a Clock icon
    }
    if (message.status === 'failed') {
      return <span className={styles.errorIndicator}>!</span>; // Simple error indicator
    }
    if (message.read) {
      return <CheckCheck size={16} className={styles.read} />;
    }
    if (message.status === 'sent' || message.delivered) { // Assuming 'sent' implies delivered for simplicity
        return <Check size={16} className={styles.delivered} />;
    }
    return null; // Default if no status matches
  };

  return (
    <div className={styles.chatPageContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarVisible ? styles.visible : ''}`}>
        <div className={styles.sidebarHeader}>
            <h2>Chats</h2>
            {/* Add New Chat / Filter Buttons here if needed */}
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

        <div className={styles.connectionsList}>
          {loading && connections.length === 0 && <p className={styles.listInfo}>Loading...</p>}
          {!loading && filteredConnections.length === 0 && <p className={styles.listInfo}>No connections found.</p>}
          {filteredConnections.map((connection) => (
            <div
              key={connection._id}
              className={`${styles.connectionItem} ${
                selectedChat?._id === connection._id ? styles.active : ''
              }`}
              onClick={() => handleSelectChat(connection)}
              role="button"
              tabIndex={0}
              aria-label={`Chat with ${connection.name}`}
            >
              <div className={styles.avatarContainer}>
                <img
                    src={connection.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=random`}
                    alt={`${connection.name}'s avatar`}
                    className={styles.avatar}
                />
                {connection.isOnline && <div className={styles.onlineIndicator}></div>}
              </div>
              <div className={styles.connectionInfo}>
                <h3>{connection.name}</h3>
                <p className={styles.lastMessage}>
                  {/* Add typing indicator here if available */}
                  {connection.lastMessage || 'No messages yet'}
                </p>
              </div>
              <div className={styles.connectionMeta}>
                <span className={styles.lastMessageTime}>
                    {formatLastMessageTime(connection.lastMessageTimestamp)}
                </span>
                {connection.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>
                    {connection.unreadCount > 9 ? '9+' : connection.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`${styles.chatArea} ${selectedChat ? styles.active : ''}`}>
        {selectedChat ? (
          <>
            <header className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                 {/* Mobile Back Button */}
                 <button onClick={handleBackToSidebar} className={`${styles.iconButton} ${styles.backButton}`}>
                     <ArrowLeft size={20} />
                 </button>
                 <div className={styles.avatarContainer}>
                    <img
                        src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=random`}
                        alt={`${selectedChat.name}'s avatar`}
                        className={styles.avatar}
                    />
                     {selectedChat.isOnline && <div className={styles.onlineIndicatorHeader}></div>}
                 </div>
                <div>
                  <h2>{selectedChat.name}</h2>
                  <p className={styles.userStatus}>
                    {selectedChat.isOnline ? 'Online' : `Last seen ${formatDistanceToNowStrict(new Date(selectedChat.lastSeen || Date.now() - 1000 * 60 * 15)) } ago`} {/* Replace with actual last seen */}
                    <span className={styles.roleBadge}>{selectedChat.role || 'Member'}</span>
                  </p>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                {/* Add Call/Video Buttons if needed */}
                <button className={styles.iconButton} aria-label="More options">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            <div className={styles.messagesContainer}>
              {loadingMessages && (
                <div className={styles.loadingMessages}>
                    <div className={styles.spinner}></div>
                    <p>Loading messages...</p>
                </div>
              )}
               {error && !loadingMessages && ( // Show message-specific error
                <div className={styles.errorContainerInline}>
                    <p>Error loading messages: {error}</p>
                    <button
                    className={styles.retryButtonSmall}
                    onClick={() => fetchMessages(selectedChat._id)}
                    >
                    Retry
                    </button>
                </div>
                )}
              {!loadingMessages && messages.length === 0 && !error && (
                <div className={styles.noMessages}>Start your conversation!</div>
              )}
              {!loadingMessages && messages.map((message, index) => {
                 // Basic Date Divider Logic (can be improved)
                 const showDateDivider = index === 0 ||
                   new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();

                return(
                    <>
                     {showDateDivider && (
                        <div className={styles.dateDivider}>
                           <span>{format(new Date(message.createdAt), 'eeee, MMMM d')}</span>
                        </div>
                     )}
                      <div
                        key={message._id || `msg-${index}`}
                        className={`${styles.messageWrapper} ${
                          message.sender === session?.user?.id ? styles.sent : styles.received
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {message.content}
                          {/* Basic Attachment Display */}
                          {message.attachments?.map((attachment, i) => (
                            <div key={i} className={styles.attachment}>
                              {attachment.type?.startsWith('image') ? (
                                <img src={attachment.url} alt={attachment.name || 'Attachment'} className={styles.attachmentImage} />
                              ) : (
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                                  <Paperclip size={14} />
                                  <span>{attachment.name || 'Attached File'}</span>
                                </a>
                              )}
                            </div>
                          ))}
                          <div className={styles.messageInfo}>
                            <span className={styles.timestamp}>
                              {formatTimestamp(message.createdAt)}
                            </span>
                            {/* Render status icon for sent messages */}
                            {renderMessageStatus(message)}
                          </div>
                           {/* Placeholder for reactions */}
                           {/* <div className={styles.reactions}>❤️ 😂 👍</div> */}
                        </div>
                      </div>
                    </>
                )
                })}
              <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
            </div>

             {/* Typing indicator placeholder */}
             {/* <div className={styles.typingIndicator}>Alumni is typing...</div> */}

            <form className={styles.inputContainer} onSubmit={handleSendMessage}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
              >
                <Paperclip size={22} />
              </button>
              {/* Hidden file input */}
               <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => { /* Handle file selection */ console.log(e.target.files); }}
                    multiple // Allow multiple files if needed
                />
               <button type="button" className={styles.iconButton} aria-label="Insert emoji">
                 <Smile size={22}/>
               </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={styles.messageInput}
                aria-label="Message input"
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!newMessage.trim()}
                aria-label="Send message"
               >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className={styles.noChatSelected}>
             <Users size={64} /> {/* Or some other relevant icon */}
            <h2>Welcome, {session?.user?.name || 'User'}!</h2>
            <p>Select a connection from the sidebar to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}