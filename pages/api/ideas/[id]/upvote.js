import dbConnect from '@/lib/mongodb';
import Idea from '@/models/Idea';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }

  try {
    await dbConnect();
    const { id } = req.query;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const idea = await Idea.findById(new ObjectId(id));
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found"
      });
    }

    // Initialize upvotedBy if it doesn't exist
    if (!Array.isArray(idea.upvotedBy)) {
      idea.upvotedBy = [];
    }

    const hasUpvoted = idea.upvotedBy.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      idea.upvotedBy = idea.upvotedBy.filter(id => id !== userId);
      idea.upvotes = Math.max(0, idea.upvotes - 1);
    } else {
      // Add upvote
      idea.upvotedBy.push(userId);
      idea.upvotes = (idea.upvotes || 0) + 1;
    }

    await idea.save();

    return res.status(200).json({
      success: true,
      message: hasUpvoted ? 'Upvote removed' : 'Idea upvoted successfully',
      idea: idea.toObject()
    });
  } catch (error) {
    console.error('Upvote error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to update upvote"
    });
  }
}