import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { pusherServer } from '@/lib/pusher';
import User from "@/models/User";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;

    // Only authorize if it's the user's private channel
    if (!channel.includes(`private-chat-${currentUser._id}`)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    res.send(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    res.status(500).json({ message: 'Error authorizing channel' });
  }
}