import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { filter } = req.query; // 'alumni' or 'students'
    
    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Base query
    let query = {
      _id: { $ne: currentUser._id },
      'profile.college.name': currentUser.profile?.college?.name,
      role: filter === 'alumni' ? 'alumni' : 'student'
    };

    const connections = await User
      .find(query)
      .select('username email profile role connections followers following')
      .sort({ 'profile.graduationYear': -1 })
      .limit(50);

    // Transform data for frontend
    const formattedConnections = connections.map(user => ({
      id: user._id,
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username,
      avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      role: user.role,
      graduationYear: user.profile?.college?.graduationYear,
      degree: user.profile?.college?.degree,
      major: user.profile?.college?.major,
      company: user.profile?.company?.name,
      position: user.profile?.company?.position,
      location: user.profile?.location,
      bio: user.profile?.bio,
      skills: user.profile?.skills || [],
      experience: user.profile?.experience || [],
      socialLinks: user.profile?.socialLinks || {},
      connections: user.connections?.length || 0,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      isConnected: user.connections?.includes(currentUser._id),
      isFollowing: user.followers?.includes(currentUser._id)
    }));

    return res.status(200).json(formattedConnections);
  } catch (error) {
    console.error('Error fetching filtered connections:', error);
    return res.status(500).json({ 
      message: "Failed to fetch connections",
      error: error.message 
    });
  }
}