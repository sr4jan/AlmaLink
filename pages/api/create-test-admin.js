import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      username: 'testadmin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      profile: {
        college: {
          id: 'TEST123',
          name: 'Test College',
          graduationYear: 2020,
          degree: 'Admin',
          major: 'Administration'
        },
        bio: 'Test Admin Account'
      }
    });

    return res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        email: admin.email,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
}