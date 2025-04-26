import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '@/lib/mongodb';
import College from '@/models/College';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is superadmin
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await connectDB();

    const { 
      collegeName, 
      collegeCode, 
      collegeDomain,
      location,
      adminUsername,
      adminEmail,
      adminPassword
    } = req.body;

    // Create college
    const college = await College.create({
      name: collegeName,
      code: collegeCode,
      domain: collegeDomain,
      location: location
    });

    // Create college admin
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      college: college._id,
      isVerified: true,
      profile: {
        firstName: adminUsername,
        lastName: 'Admin'
      }
    });

    return res.status(201).json({
      message: 'College and admin created successfully',
      college: {
        id: college._id,
        name: college.name,
        code: college.code
      },
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Error creating college:', error);
    return res.status(500).json({ message: 'Error creating college', error: error.message });
  }
}