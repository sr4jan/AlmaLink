// pages/api/pusher/auth.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import pusher from "@/lib/pusher";

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Parse socket_id and channel_name from request body
    const { socket_id, channel_name } = req.body;

    // Validate required parameters
    if (!socket_id) {
      return res.status(400).json({ message: 'Missing socket_id' });
    }

    if (!channel_name) {
      return res.status(400).json({ message: 'Missing channel_name' });
    }

    // Create presence data
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      }
    };

    // Authorize the channel
    const auth = await pusher.authorizeChannel(socket_id, channel_name, presenceData);
    res.json(auth);
  } catch (error) {
    console.error('Pusher Auth Error:', error);
    res.status(500).json({ 
      message: 'Error authenticating Pusher channel',
      error: error.message 
    });
  }
}