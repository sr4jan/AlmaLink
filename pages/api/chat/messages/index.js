import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import dbConnect from "@/lib/mongodb"
import Message from "@/models/Message"
import User from "@/models/User"
import { pusherServer } from '@/lib/pusher'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await dbConnect()

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email })
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { content, receiver } = req.body

    if (!content || !receiver) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Create and save the message
    const message = await Message.create({
      content,
      sender: currentUser._id,
      receiver,
    })

    // Populate sender and receiver details
    await message.populate('sender', 'username email profile')
    await message.populate('receiver', 'username email profile')

    // Trigger Pusher events
    await pusherServer.trigger(
      `private-chat-${receiver}`,
      'message:new',
      message
    )

    // Also notify sender's other devices
    await pusherServer.trigger(
      `private-chat-${currentUser._id}`,
      'message:new',
      message
    )

    return res.status(200).json(message)
  } catch (error) {
    console.error('Message API Error:', error)
    return res.status(500).json({ 
      message: 'Error sending message',
      error: error.message 
    })
  }
}