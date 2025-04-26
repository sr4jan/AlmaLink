import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { username, email, password, collegeCode } = req.body;

    // Validation
    if (!username || !email || !password || !collegeCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Get college
    const college = await College.findOne({ code: collegeCode });
    if (!college) {
      return res.status(400).json({ message: 'Invalid college code' });
    }

    // Check if college already has an admin
    const existingAdmin = await User.findOne({
      role: 'admin',
      'profile.college.id': college._id
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'College already has an admin' 
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
      isVerified: true,
      profile: {
        college: {
          id: college._id,
          name: college.name,
        },
        bio: `Admin at ${college.name}`,
      }
    });

    // Update college with admin reference
    college.admin = admin._id;
    await college.save();

    return res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        college: college.name
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ message: 'Error creating admin account' });
  }
}