import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  console.log('🚀 Starting superadmin setup...');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    console.log('✅ Database connected');

    // Create system college
    console.log('🏛️ Setting up system college...');
    let systemCollege = await College.findOne({ code: 'SYSTEM' });
    
    if (!systemCollege) {
      systemCollege = await College.create({
        name: 'System Administration',
        code: 'SYSTEM',
        domain: 'system.almalink.com',
        status: 'active',
        location: {
          city: 'System',
          state: 'System',
          country: 'System'
        }
      });
    }
    console.log('✅ System college ready:', systemCollege._id);

    // Check for existing superadmin
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('ℹ️ Superadmin already exists');
      return res.status(200).json({ 
        message: 'Superadmin already exists',
        user: {
          email: existingSuperAdmin.email,
          username: existingSuperAdmin.username
        }
      });
    }

    // Create superadmin
    console.log('👤 Creating superadmin user...');
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);
    
    const superAdmin = await User.create({
      username: 'sr4jan',
      email: 'sr4jan@almalink.com',
      password: hashedPassword,
      role: 'superadmin',
      collegeId: systemCollege._id, // Changed from college to collegeId
      isVerified: true,
      profile: {
        firstName: 'Srajan',
        lastName: 'Administrator'
      }
    });

    console.log('✅ Superadmin created successfully:', superAdmin._id);

    return res.status(201).json({
      message: 'Superadmin created successfully',
      user: {
        id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email
      }
    });

  } catch (error) {
    console.error('❌ Setup error:', error);
    return res.status(500).json({ 
      message: 'Error creating superadmin', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.name
    });
  }
}