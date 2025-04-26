import connectDB from '@/lib/mongodb';
import College from '@/models/College';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'POST') {
      const { name, code, domain, location } = req.body;

      // Validate required fields
      if (!name || !code || !domain) {
        return res.status(400).json({ message: 'Name, code, and domain are required' });
      }

      // Check for existing college
      const existingCollege = await College.findOne({
        $or: [{ code }, { domain }]
      });

      if (existingCollege) {
        return res.status(400).json({ message: 'College with same code or domain already exists' });
      }

      const college = await College.create({
        name,
        code,
        domain,
        location,
        status: 'active'
      });

      return res.status(201).json(college);
    }

    if (req.method === 'GET') {
      // Your existing GET logic here
      const colleges = await College.find({}).sort({ createdAt: -1 }).lean();

      const collegesWithData = await Promise.all(
        colleges.map(async (college) => {
          const [admin, userCount] = await Promise.all([
            User.findOne(
              { collegeId: college._id, role: 'admin' },
              { email: 1, username: 1, profile: 1 }
            ).lean(),
            User.countDocuments({ collegeId: college._id })
          ]);

          return {
            ...college,
            admin: admin ? {
              id: admin._id,
              email: admin.email,
              username: admin.username,
              firstName: admin.profile?.firstName,
              lastName: admin.profile?.lastName
            } : null,
            userCount
          };
        })
      );

      return res.status(200).json(collegesWithData);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling college request:', error);
    res.status(500).json({ message: error.message });
  }
}