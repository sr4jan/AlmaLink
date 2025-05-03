import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    await connectDB();

    // Get user from database
    const user = await User.findById(session.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to delete their own account
    if (user._id.toString() !== session.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete the user
    await User.findByIdAndDelete(session.user.id);

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}