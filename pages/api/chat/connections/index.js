import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Message from "@/models/Message";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    // Get current user by email since we know it's always available
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find users from the same college
    let query = {
      _id: { $ne: currentUser._id }
    };

    // Only add college filter if the user has college info
    if (currentUser.profile?.college?.name) {
      query['profile.college.name'] = currentUser.profile.college.name;
    }

    // If user is a student, only show alumni
    if (currentUser.role === 'student') {
      query.role = 'alumni';
    }

    const connections = await User.find(query)
      .select('username email profile role')
      .limit(50);

    // Format connections for response
    const connectionsWithMessages = await Promise.all(
      connections.map(async (conn) => {
        // Get last message between users
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUser._id, receiver: conn._id },
            { sender: conn._id, receiver: currentUser._id }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(1);

        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: conn._id,
          receiver: currentUser._id,
          read: false
        });

        return {
          _id: conn._id.toString(),
          name: conn.username,
          avatar: conn.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.username}`,
          role: conn.role,
          email: conn.email,
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || null,
          unreadCount
        };
      })
    );

    return res.status(200).json(connectionsWithMessages);

  } catch (error) {
    console.error('Connections API Error:', error);
    return res.status(500).json({ 
      message: "Failed to fetch connections",
      error: error.message 
    });
  }
}