import dbConnect from '@/lib/mongodb';
import Idea from '@/models/Idea';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();
  
  // Get the session
  const session = await getServerSession(req, res, authOptions);

  switch (req.method) {
    case 'GET':
      try {
        const ideas = await Idea
  .find()
  .populate('postedBy', 'username profile.avatar profile.firstName profile.lastName email')
  .sort({ createdAt: -1 })
  .lean();

        // Transform the data to ensure consistent structure
        const formattedIdeas = ideas.map(idea => ({
          ...idea,
          _id: idea._id.toString(),
          postedBy: idea.postedBy ? {
            _id: idea.postedBy._id.toString(),
            name: idea.postedBy.username || 
                  `${idea.postedBy.profile?.firstName || ''} ${idea.postedBy.profile?.lastName || ''}`.trim() || 
                  idea.postedBy.email.split('@')[0],
            avatar: idea.postedBy.profile?.avatar || null,
            email: idea.postedBy.email
          } : null,
          upvotes: idea.upvotedBy?.length || 0,
          upvotedBy: idea.upvotedBy?.map(id => id.toString()) || []
        }));

        return res.status(200).json({
          success: true,
          ideas: formattedIdeas
        });
      } catch (error) {
        console.error('Fetch ideas error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch ideas"
        });
      }

    // In the POST case of your API handler:

case 'POST':
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to post ideas"
    });
  }

  try {
    console.log('Received idea data:', req.body);
    const { title, description, tags, collegeId } = req.body;

    // Validate required fields
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: "College ID is required"
      });
    }

    // Create new idea using session user data
    const ideaData = {
      title: title.trim(),
      description: description.trim(),
      postedBy: new ObjectId(session.user.id),
      collegeId: new ObjectId(collegeId), // Convert collegeId to ObjectId
      tags: Array.isArray(tags) ? tags : [],
      upvotedBy: [],
      createdAt: new Date()
    };

    console.log('Creating idea with data:', ideaData);

    const idea = new Idea(ideaData);
    await idea.save();
    
    // Populate the postedBy field
    await idea.populate('postedBy', 'username profile.avatar profile.firstName profile.lastName email');

    // Format the response
    const formattedIdea = {
      ...idea.toObject(),
      _id: idea._id.toString(),
      postedBy: {
        _id: idea.postedBy._id.toString(),
        name: idea.postedBy.username || 
              `${idea.postedBy.profile?.firstName || ''} ${idea.postedBy.profile?.lastName || ''}`.trim() || 
              idea.postedBy.email.split('@')[0],
        avatar: idea.postedBy.profile?.avatar || null,
        email: idea.postedBy.email
      },
      collegeId: idea.collegeId.toString(),
      upvotes: 0,
      upvotedBy: []
    };

    return res.status(201).json({
      success: true,
      message: "Idea created successfully",
      idea: formattedIdea
    });
  } catch (error) {
    console.error('Create idea error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create idea"
    });
  }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`
      });
  }
}