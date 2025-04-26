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

    const currentUser = await User.findOne({ email: session.user.email });
    
    // Get alumni from the same college
    const alumni = await User.find({
      role: 'alumni',
      'profile.college.name': currentUser.profile.college.name,
      _id: { $ne: currentUser._id }
    })
    .select('-password')
    .populate('followers')
    .populate('following');

    return res.status(200).json(alumni);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return res.status(500).json({ message: "Server error" });
  }
}