import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import College from "@/models/College";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { collegeId } = req.query;
      
      const college = await College.findById(collegeId)
        .select('name type location admin');

      if (!college) {
        return res.status(404).json({ message: 'College not found' });
      }

      return res.status(200).json({ college });
    } catch (error) {
      console.error('Error fetching college:', error);
      return res.status(500).json({ message: 'Error fetching college data' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}