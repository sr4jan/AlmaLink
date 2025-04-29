import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import axios from "axios";
import { categorySkillsMap } from "@/data/categorySkillsMap";

// ML model configuration
const ML_MODEL_URL = "https://question-classifier-backend.onrender.com";

async function classifyQuestion(title, description) {
  try {
    const text = description ? `${title} ${description}` : title;
    const response = await axios.post(`${ML_MODEL_URL}/predict`, {
      text: text
    });
    return response.data?.category || 'General';
  } catch (error) {
    console.error("ML Classification error:", error);
    return 'General';
  }
}

export default async function handler(req, res) {
  try {
    await dbConnect();

    // GET method - Fetch questions
    if (req.method === "GET") {
      const session = await getServerSession(req, res, authOptions);
      
      // First, get all questions with populated user data
      const questions = await Question
        .find()
        .populate('postedBy', 'username email profile.avatar profile.firstName profile.lastName')
        .sort({ createdAt: -1 })
        .lean();

      // If user is alumni, filter questions based on their skills
      let filteredQuestions = [...questions];
      
      if (session?.user?.role === 'alumni') {
        try {
          const currentUser = await User.findById(session.user.id).lean();
          const userSkills = currentUser?.profile?.skills || [];

          filteredQuestions = questions.filter(question => {
            // Always show pending or general questions
            if (!question.category || question.category === 'Pending' || question.category === 'General') {
              return true;
            }

            // Get required skills for the question category
            const categorySkills = categorySkillsMap[question.category] || [];
            
            // Show question if user has at least one required skill
            return categorySkills.some(skill => userSkills.includes(skill));
          });
        } catch (error) {
          console.error("Error filtering questions:", error);
          // If there's an error filtering, return all questions
          filteredQuestions = questions;
        }
      }

      // Format the questions for response
      const formattedQuestions = filteredQuestions.map(question => ({
        ...question,
        _id: question._id.toString(),
        postedBy: question.postedBy ? {
          _id: question.postedBy._id.toString(),
          username: question.postedBy.username,
          name: question.postedBy.username || 
                `${question.postedBy.profile?.firstName || ''} ${question.postedBy.profile?.lastName || ''}`.trim() || 
                question.postedBy.email?.split('@')[0] || 
                'Anonymous',
          avatar: question.postedBy.profile?.avatar || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(question.postedBy.username || 'A')}&background=random`,
          email: question.postedBy.email
        } : null,
        votes: question.votes || [],
        voteCount: question.voteCount || 0,
        replies: (question.replies || []).map(reply => ({
          ...reply,
          _id: reply._id.toString(),
          postedBy: reply.postedBy.toString()
        }))
      }));

      return res.status(200).json(formattedQuestions);
    }

    // POST method - Create new question
    if (req.method === "POST") {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        return res.status(401).json({ message: "Please login to post questions" });
      }

      const { title, description = "" } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Create initial question with pending category
      const newQuestion = new Question({
        title: title.trim(),
        description: description.trim(),
        postedBy: session.user.id,
        category: 'Pending',
        createdAt: new Date(),
        votes: [],
        voteCount: 0,
        replies: []
      });

      await newQuestion.save();

      // Populate user data
      await newQuestion.populate('postedBy', 'username email profile.avatar profile.firstName profile.lastName');

      // Classify the question
      const category = await classifyQuestion(title, description);
      newQuestion.category = category;
      await newQuestion.save();

      // Format the response
      const formattedQuestion = {
        ...newQuestion.toObject(),
        _id: newQuestion._id.toString(),
        postedBy: {
          _id: newQuestion.postedBy._id.toString(),
          username: newQuestion.postedBy.username,
          name: newQuestion.postedBy.username || 
                `${newQuestion.postedBy.profile?.firstName || ''} ${newQuestion.postedBy.profile?.lastName || ''}`.trim() || 
                newQuestion.postedBy.email?.split('@')[0] || 
                'Anonymous',
          avatar: newQuestion.postedBy.profile?.avatar || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(newQuestion.postedBy.username || 'A')}&background=random`,
          email: newQuestion.postedBy.email
        },
        votes: [],
        voteCount: 0,
        replies: []
      };

      return res.status(201).json(formattedQuestion);
    }

    // Method not allowed
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}