import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import axios from "axios";

// ML model configuration
const ML_MODEL_URL = "https://question-classifier-backend.onrender.com";

// Function to classify question using ML model
async function classifyQuestion(title, description) {
  try {
    // Combine title and description into a single text
    const text = description ? `${title} ${description}` : title;

    const response = await axios.post(`${ML_MODEL_URL}/predict`, {
      text: text // Send in the format the API expects
    });

    if (response.data && response.data.category) {
      return response.data.category;
    }
    
    return 'General'; // Default category if classification fails
  } catch (error) {
    console.error("ML Classification error:", error);
    console.error("Error details:", error.response?.data); // Log the error response
    return 'General'; // Default category if service is unavailable
  }
}

export default async function handler(req, res) {
  try {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);

    if (req.method === "GET") {
      const questions = await Question
  .find()
  .populate({
    path: 'postedBy',
    select: 'username email profile.avatar profile.firstName profile.lastName'
  })
  .sort({ createdAt: -1 });
        
  const formattedQuestions = questions.map(q => {
    const question = q.toObject();
    const postedBy = question.postedBy || {};
    
    return {
      ...question,
      postedBy: {
        _id: postedBy._id?.toString(),
        username: postedBy.username,
        name: postedBy.username || 
              `${postedBy.profile?.firstName || ''} ${postedBy.profile?.lastName || ''}`.trim() || 
              postedBy.email?.split('@')[0] || 'Anonymous',
        avatar: postedBy.profile?.avatar || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(postedBy.username || 'A')}&background=random`,
        email: postedBy.email
      }
    };
  });

      return res.status(200).json(formattedQuestions);
    }

    if (req.method === "POST") {
      if (!session) {
        return res.status(401).json({ message: "Please login to post questions" });
      }

      const { title, description = "" } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      // First, create the question with "Pending" category
      const question = new Question({
        title: title.trim(),
        description: description.trim(),
        postedBy: session.user.id,
        createdAt: new Date(),
        votes: [],
        voteCount: 0,
        replies: [],
        category: 'Pending'
      });
      await question.populate({
        path: 'postedBy',
        select: 'username email profile.avatar profile.firstName profile.lastName'
      });
      await question.save();

      // Then classify the question
      const category = await classifyQuestion(title, description);
      
      // Update the question with the classified category
      question.category = category;
      await question.save();

      // Populate and return the formatted question
      const populatedQuestion = await Question.findById(question._id)
        .populate('postedBy', 'username email _id');

      const formattedQuestion = {
        ...populatedQuestion.toObject(),
        postedBy: {
          _id: populatedQuestion.postedBy._id.toString(),
          username: populatedQuestion.postedBy.username || populatedQuestion.postedBy.email?.split('@')[0],
          email: populatedQuestion.postedBy.email
        }
      };

      return res.status(201).json(formattedQuestion);
    }

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
}