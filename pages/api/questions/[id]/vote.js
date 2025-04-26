import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Please login to vote" });
    }

    const { id } = req.query;
    const { direction } = req.body;
    const userId = session.user.id;

    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    let question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Ensure votes is an array
    if (!Array.isArray(question.votes)) {
      question.votes = [];
    }

    // Find existing vote using Array.prototype.find
    const existingVote = question.votes.find(
      vote => vote.userId && vote.userId.toString() === userId
    );

    if (existingVote) {
      if (existingVote.direction === direction) {
        // Remove the vote if clicking the same direction
        question.votes = question.votes.filter(
          vote => vote.userId.toString() !== userId
        );
      } else {
        // Change vote direction
        existingVote.direction = direction;
      }
    } else {
      // Add new vote
      question.votes.push({
        userId: new mongoose.Types.ObjectId(userId),
        direction
      });
    }

    // Calculate total votes
    question.voteCount = question.votes.reduce((acc, vote) => {
      return acc + (vote.direction === 'up' ? 1 : -1);
    }, 0);

    // Save the updated question
    await question.save();

    // Populate the user data and return
    await question.populate('postedBy', 'username email');
    
    res.status(200).json(question);
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Failed to register vote" });
  }
}