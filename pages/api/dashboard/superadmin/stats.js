import connectDB from '@/lib/mongodb';
import College from '@/models/College';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await connectDB();

    const [
      totalColleges,
      activeColleges,
      totalUsers,
      pendingApprovals
    ] = await Promise.all([
      College.countDocuments(),
      College.countDocuments({ status: 'active' }),
      User.countDocuments(),
      College.countDocuments({ status: 'pending' })
    ]);

    res.status(200).json({
      totalColleges,
      activeColleges,
      totalUsers,
      pendingApprovals
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
}