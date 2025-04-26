import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || session.user.role !== 'alumni') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();

    // Fetch real stats from your database
    const stats = {
      postedJobs: 0, // Count from jobs collection
      hostedSessions: 0, // Count from sessions collection
      connections: 0, // Count from connections collection
      events: 0, // Count from events collection
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}