import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
// In your Signup component
const handleResumeData = (data) => {
  console.log('Received resume data:', data);

  try {
    // Extract username from name (firstname+lastname)
    const username = data.name
      ?.replace(/\s+/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || '';

    // Update form data
    setFormData(prev => ({
      ...prev,
      username,
      email: data.email || prev.email,
      profile: {
        ...prev.profile,
        college: {
          ...prev.profile.college,
          name: 'Lakshmi Narain College of Technology',
          degree: 'B.Tech',
          major: 'Computer Science',
          graduationYear: 2026
        },
        company: {
          ...prev.profile.company,
          name: data.work_experience?.split(' at ')?.[1] || '',
          position: data.work_experience?.split(' at ')?.[0] || ''
        },
        location: data.location || 'Bhopal, Madhya Pradesh',
        skills: data.skills?.split(', ') || [],
        bio: [
          data.projects && `Projects: ${data.projects}`,
          data.certifications && `Certifications: ${data.certifications}`,
          data.work_experience && `Experience: ${data.work_experience}`
        ].filter(Boolean).join('. '),
        phone: data.phone || ''
      }
    }));

    // Update selected skills
    if (data.skills) {
      setSelectedSkills(data.skills.split(', '));
    }

    // Show success message
    toast.success('Resume data imported successfully!');

  } catch (error) {
    console.error('Error processing resume data:', error);
    // Don't show error if we managed to fill some fields
    if (!formData.email) {
      toast.error('Some resume data could not be processed');
    }
  }
};
  const { username, email, password, role, profile } = req.body;

  if (!username || !email || !password || !role || !profile?.college?.id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: existingUser.email === email.toLowerCase() 
          ? "Email already registered" 
          : "Username already taken" 
      });
    }

    // Find college by code
    const college = await College.findOne({ code: profile.college.id });
    if (!college) {
      return res.status(400).json({ message: "Invalid college selected" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with proper collegeId
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      collegeId: college._id, // Set the proper MongoDB ObjectId
      profile: {
        firstName: "",
        lastName: "",
        college: {
          id: college._id,
          name: profile.college.name,
          graduationYear: profile.college.graduationYear,
          degree: profile.college.degree,
          major: profile.college.major
        },
        company: role === 'alumni' ? {
          name: profile.company.name,
          position: profile.company.position,
          startDate: profile.company.startDate || new Date(),
          current: profile.company.current
        } : undefined,
        location: profile.location || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        socialLinks: {
          linkedin: '',
          github: '',
          portfolio: ''
        }
      },
      isVerified: false
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: "Signup successful",
      user: userResponse
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ 
      message: "An error occurred during signup. Please try again.",
      error: error.message // Include error message for debugging
    });
  }
}