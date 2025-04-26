import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await connectDB();

    const { username, email, password, firstName, lastName, collegeId } = req.body;

    // Validate collegeId
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Check if admin already exists for this college
    const existingAdmin = await User.findOne({ 
      collegeId: collegeId,
      role: 'admin'
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'An admin already exists for this college' 
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already in use' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      collegeId: college._id,
      isVerified: true,
      profile: {
        firstName,
        lastName
      }
    });

    // Return success response
    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        collegeName: college.name
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      message: 'Error creating admin',
      error: error.message
    });
  }
}