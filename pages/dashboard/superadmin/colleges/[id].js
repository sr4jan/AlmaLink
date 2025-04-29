import connectDB from '@/lib/mongodb';
import College from '@/models/College';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  await connectDB();

  if (req.method === 'DELETE') {
    try {
      // Check if college has users
      const usersCount = await User.countDocuments({ collegeId: id });
      if (usersCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete college with existing users' 
        });
      }

      const college = await College.findByIdAndDelete(id);
      if (!college) {
        return res.status(404).json({ message: 'College not found' });
      }

      res.status(200).json({ message: 'College deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}