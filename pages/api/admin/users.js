import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    await dbConnect();

    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    // Check for admin role
    if (session.user?.role !== 'admin' && session.user?.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (req.method === 'GET') {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const role = req.query.role || 'all';
      const search = req.query.search || '';

      // Base query
      let query = {};

      // For regular admin, filter by college
      if (session.user.role === 'admin') {
        // Find admin's college first
        const adminUser = await User.findById(session.user.id).select('collegeId');
        if (!adminUser?.collegeId) {
          return res.status(400).json({
            success: false,
            message: 'Admin college not found'
          });
        }
        query.collegeId = adminUser.collegeId;
      }

      // Role filtering
      if (role !== 'all') {
        query.role = role;
      } else {
        // For admin, only show students and alumni
        query.role = { $in: ['student', 'alumni'] };
      }

      // Search filtering
      if (search.trim()) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .populate('collegeId', 'name code')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      });
    }

    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}