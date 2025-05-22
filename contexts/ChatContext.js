// contexts/ChatContext.js
'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';
import { toast } from 'react-hot-toast';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { data: session } = useSession();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);

  // Initialize Pusher connection
  useEffect(() => {
    if (!session?.user?.email) return;

    // Initialize Pusher
    const pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'content-type': 'application/json',
        },
      },
    });

    setPusher(pusherInstance);

    // Cleanup on unmount
    return () => {
      pusherInstance.disconnect();
    };
  }, [session?.user?.email]);

  // Subscribe to presence channel when pusher is initialized
  useEffect(() => {
    if (!pusher || !session?.user?.email) return;

    // Subscribe to presence channel
    const presenceChannel = pusher.subscribe('presence-chat');
    setChannel(presenceChannel);

    // Bind to presence events
    presenceChannel.bind('pusher:subscription_succeeded', (members) => {
      const onlineUserIds = new Set();
      members.each((member) => onlineUserIds.add(member.id));
      setOnlineUsers(onlineUserIds);
    });

    presenceChannel.bind('pusher:member_added', (member) => {
      setOnlineUsers((prev) => new Set(prev).add(member.id));
    });

    presenceChannel.bind('pusher:member_removed', (member) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(member.id);
        return newSet;
      });
    });

    // Cleanup channel subscription
    return () => {
      presenceChannel.unbind_all();
      pusher.unsubscribe('presence-chat');
    };
  }, [pusher, session?.user?.email]);

  // Subscribe to private channel when chat is selected
  useEffect(() => {
    if (!pusher || !selectedChat?._id || !session?.user?.email) return;

    // Create a unique channel name for the chat
    const channelName = `private-chat-${[session.user.id, selectedChat._id].sort().join('-')}`;
    const privateChannel = pusher.subscribe(channelName);

    // Bind to chat events
    privateChannel.bind('message', handleNewMessage);
    privateChannel.bind('typing', handleTypingEvent);

    // Cleanup channel subscription
    return () => {
      privateChannel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [pusher, selectedChat?._id, session?.user?.email]);

  const handleNewMessage = useCallback((data) => {
    setMessages((prev) => [...prev, data]);
  }, []);

  const handleTypingEvent = useCallback((data) => {
    const { userId, isTyping } = data;
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      if (isTyping) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/chat/messages?chatId=${chatId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch messages');
      }
      
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!selectedChat?._id || !content) {
      toast.error('Cannot send message');
      return;
    }

    // Create optimistic message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: typeof content === 'string' ? content : content.content,
      sender: session?.user?.id,
      receiver: selectedChat._id,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    // Add to messages immediately
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: typeof content === 'string' ? content : content.content,
          receiver: selectedChat._id
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id ? result.data : msg
        )
      );

      return result.data;
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      
      toast.error(err.message || 'Failed to send message');
      throw err;
    }
  };

  const sendTypingStatus = useCallback((isTyping) => {
    if (!selectedChat?._id || !session?.user?.id) return;

    try {
      const channelName = `private-chat-${[session.user.id, selectedChat._id].sort().join('-')}`;
      if (pusher) {
        pusher.channel(channelName)?.trigger('client-typing', {
          userId: session.user.id,
          isTyping
        });
      }
    } catch (err) {
      console.error('Error sending typing status:', err);
    }
  }, [selectedChat?._id, session?.user?.id, pusher]);

  // Function to refresh messages
  const refreshMessages = useCallback(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat?._id]);

  // Effect to fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id);
    } else {
      setMessages([]);
    }
  }, [selectedChat?._id]);
  useEffect(() => {
    setMessages([]); // Reset messages when chat changes
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat?._id]);


  const value = {
    selectedChat,
    setSelectedChat,
    messages,
    setMessages,
    loading,
    error,
    typingUsers,
    setTypingUsers,
    onlineUsers,
    sendMessage,
    refreshMessages,
    sendTypingStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}