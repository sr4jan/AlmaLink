import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    await connectDB();

    const admin = await User.findOneAndDelete({
      _id: id,
      role: 'admin'
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: error.message });
  }
}