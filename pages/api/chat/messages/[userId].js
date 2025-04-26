import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { userId } = req.query;

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.method === 'GET') {
      // Get messages between the two users
      const messages = await Message.find({
        $or: [
          { sender: currentUser._id, receiver: userId },
          { sender: userId, receiver: currentUser._id }
        ]
      })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profile.avatar')
      .populate('receiver', 'username profile.avatar');

      // Mark messages as read
      await Message.updateMany(
        {
          sender: userId,
          receiver: currentUser._id,
          read: false
        },
        { read: true }
      );

      return res.status(200).json(messages);
    }

    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Message API Error:', error);
    return res.status(500).json({ 
      message: "Failed to fetch messages",
      error: error.message 
    });
  }
}