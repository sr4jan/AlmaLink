import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';
import { getSession } from "next-auth/react";

import College from "@/models/College";

export default async function handler(req, res) {
  try {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // GET request to fetch profile
    if (req.method === 'GET') {
      const user = await User.findById(session.user.id)
        .select('-password')
        .populate('collegeId', 'name code')
        .lean();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ success: true, user });
    }

    // PUT request to update profile
    if (req.method === 'PUT') {
      const { profile } = req.body;

      // Create update object with all editable fields
      const updateData = {
        username: profile.username,
        'profile.avatar': profile.profile?.avatar,
        'profile.firstName': profile.profile?.firstName,
        'profile.lastName': profile.profile?.lastName,
        'profile.bio': profile.profile?.bio,
        'profile.location': profile.profile?.location,
        'profile.avatar': profile.profile?.avatar,
        'profile.skills': profile.profile?.skills,
        'profile.socialLinks': profile.profile?.socialLinks,
        'profile.college.graduationYear': profile.profile?.college?.graduationYear,
        'profile.college.degree': profile.profile?.college?.degree,
        'profile.college.major': profile.profile?.college?.major
      };

      // Add role-specific fields
      if (session.user.role === 'alumni') {
        updateData['profile.company'] = profile.profile?.company;
        updateData['profile.experience'] = profile.profile?.experience;
      }

      if (['student', 'alumni'].includes(session.user.role)) {
        updateData['profile.college.graduationYear'] = profile.profile?.college?.graduationYear;
        updateData['profile.college.degree'] = profile.profile?.college?.degree;
        updateData['profile.college.major'] = profile.profile?.college?.major;
      }

      const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        { $set: updateData },
        { 
          new: true,
          runValidators: true
        }
      )
        .select('-password')
        .populate('collegeId', 'name code')
        .lean();
        await getSession({ req });
      return res.status(200).json({ success: true, user: updatedUser });
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}