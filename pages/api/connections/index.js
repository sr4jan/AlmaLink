import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get current user's college info
    const currentUser = await User.findOne({ email: session.user.email });
    
    // Find users from the same college
    const connections = await User.find({
      'profile.college.name': currentUser.profile.college.name,
      _id: { $ne: currentUser._id }
    })
    .select('-password')
    .sort({ createdAt: -1 });

    // Transform the data to match the connection card structure
    const formattedConnections = connections.map(user => ({
      id: user._id,
      name: user.username,
      avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      role: user.role,
      company: user.profile?.experience?.[0]?.company || '',
      location: user.profile?.location || '',
      education: `${user.profile?.college?.degree} in ${user.profile?.college?.major}`,
      bio: user.profile?.bio || '',
      skills: user.profile?.skills || [],
      achievements: [], // You can add this field to your User model if needed
      isFollowing: false // You'll need to implement the following system
    }));

    return res.status(200).json(formattedConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return res.status(500).json({ message: "Server error" });
  }
}