"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useSession } from 'next-auth/react'

const ChatContext = createContext({})

export function ChatProvider({ children }) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())

  useEffect(() => {
    if (!session?.user?.email) return

    const channelName = `private-chat-${session.user.email}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind('message:new', (message) => {
      setMessages(prev => {
        if (prev.some(msg => msg._id === message._id)) return prev
        return [...prev, message].sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        )
      })
    })

    channel.bind('chat:typing:start', ({ userId, userName }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.add(userName || userId)
        return newSet
      })
    })

    channel.bind('chat:typing:stop', ({ userId, userName }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userName || userId)
        return newSet
      })
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
    }
  }, [session?.user?.email])

  const sendMessage = async (content, receiverId) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          receiver: receiverId,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }
      
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const sendTypingIndicator = async (receiverId, isTyping) => {
    try {
      await fetch('/api/chat/messages/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          typing: isTyping
        }),
      })
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      typingUsers,
      isTyping: typingUsers.size > 0,
      sendMessage,
      sendTypingIndicator
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}