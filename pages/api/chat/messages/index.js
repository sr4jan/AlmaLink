// pages/api/chat/messages/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import mongoose from "mongoose";
import pusher from "@/lib/pusher"; // Make sure this import is correct

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    await dbConnect();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (req.method === 'GET') {
      const { chatId } = req.query;

      if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid chat ID" 
        });
      }

      // Find messages between current user and chat partner
      const messages = await Message.find({
        $or: [
          { sender: currentUser._id, receiver: chatId },
          { sender: chatId, receiver: currentUser._id }
        ]
      })
      .sort({ createdAt: 1 })
      .limit(100);

      // Format messages for frontend
      const formattedMessages = messages.map(msg => ({
        _id: msg._id.toString(),
        content: msg.content,
        sender: msg.sender.toString(),
        receiver: msg.receiver.toString(),
        createdAt: msg.createdAt,
        status: msg.status,
        attachments: msg.attachments || []
      }));

      return res.status(200).json({
        success: true,
        messages: formattedMessages
      });
    }

    if (req.method === 'POST') {
      const { content, receiver } = req.body;

      if (!content || !receiver) {
        return res.status(400).json({ 
          success: false,
          message: "Missing required fields" 
        });
      }

      if (!mongoose.Types.ObjectId.isValid(receiver)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid receiver ID" 
        });
      }

      const newMessage = await Message.create({
        content,
        sender: currentUser._id,
        receiver,
        status: 'sent'
      });

      const formattedMessage = {
        _id: newMessage._id.toString(),
        content: newMessage.content,
        sender: newMessage.sender.toString(),
        receiver: newMessage.receiver.toString(),
        createdAt: newMessage.createdAt,
        status: newMessage.status,
        attachments: newMessage.attachments || []
      };

      try {
        // Try to trigger Pusher event
        const channelName = `private-chat-${[currentUser._id.toString(), receiver].sort().join('-')}`;
        if (pusher) {
          await pusher.trigger(channelName, 'client-message', formattedMessage)
            .catch(error => {
              console.error('Pusher trigger error:', error);
              // Don't throw error, just log it
            });
        }
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
        // Don't throw error, continue with response
      }

      return res.status(201).json({
        success: true,
        data: formattedMessage
      });
    }

    return res.status(405).json({ 
      success: false,
      message: "Method not allowed" 
    });

  } catch (error) {
    console.error('Messages API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
}