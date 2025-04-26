import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Prevent access in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      message: 'This endpoint is not available in production' 
    });
  }

  // Verify setup token
  const setupToken = process.env.SETUP_TOKEN;
  const providedToken = req.headers['x-setup-token'];

  if (!setupToken || providedToken !== setupToken) {
    return res.status(403).json({ 
      message: 'Invalid setup token' 
    });
  }

  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'An admin account already exists' 
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // First, ensure the college exists
    let college = await College.findOne({ code: 'IITB' });
    
    if (!college) {
      college = await College.create({
        name: 'Indian Institute of Technology Bombay',
        code: 'IITB',
        type: 'IIT',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra'
        }
      });
    }

    const admin = await User.create({
      username: 'admin',
      email: 'admin@iitb.ac.in',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      profile: {
        college: {
          id: college._id,
          name: college.name,
          graduationYear: 2020,  // Add required fields
          degree: 'Administration',
          major: 'College Administration'
        },
        bio: 'College Administrator'
      }
    });

    // Update college with admin reference
    college.admin = admin._id;
    await college.save();

    // Log creation time
    console.log(`Admin account created at ${new Date().toISOString()}`);

    return res.status(201).json({
      message: 'Admin account created successfully',
      email: 'admin@iitb.ac.in',
      password: 'admin123',
      setupTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ 
      message: 'Error setting up admin account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}