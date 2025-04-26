import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Please login to reply" });
  }

  try {
    const { questionId, text } = req.body;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.replies.push({ 
      text,
      postedBy: session.user.id,
      createdAt: new Date()
    });

    await question.save();
    await question.populate('replies.postedBy', 'username profile.avatar');
    
    res.status(200).json(question);
  } catch (error) {
    console.error("Reply error:", error);
    res.status(500).json({ message: "Failed to add reply" });
  }
}