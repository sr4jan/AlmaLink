import connectDB from '@/lib/mongodb';
import College from '@/models/College';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'POST') {
    try {
      const college = await College.create(req.body);
      res.status(201).json(college);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const colleges = await College.find().sort({ createdAt: -1 });
      res.status(200).json(colleges);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}