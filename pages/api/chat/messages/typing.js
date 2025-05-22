import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { pusherServer } from '@/lib/pusher';
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { receiverId, typing } = req.body

    await pusherServer.trigger(
      `private-chat-${receiverId}`,
      typing ? 'chat:typing:start' : 'chat:typing:stop',
      {
        userId: currentUser._id,
        userName: currentUser.username
      }
    )

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Typing indicator error:', error)
    res.status(500).json({ message: 'Error updating typing status' })
  }
}