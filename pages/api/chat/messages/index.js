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

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.method === 'POST') {
      const { content, receiver } = req.body;
      
      if (!content && !req.body.attachments) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Create message using currentUser._id
      const message = await Message.create({
        sender: currentUser._id,
        receiver,
        content: content || '',
        attachments: req.body.attachments || []
      });

      // Populate sender and receiver details
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username profile.avatar')
        .populate('receiver', 'username profile.avatar');

      return res.status(201).json(populatedMessage);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error('Message API Error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}