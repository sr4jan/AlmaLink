import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { userId } = req.body;
    const currentUser = await User.findOne({ email: session.user.email });

    // Remove from following
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userId }
    });

    // Remove from followers
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUser._id }
    });

    return res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ message: "Server error" });
  }
}