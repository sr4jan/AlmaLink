import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Please login to perform this action" });
  }

  if (req.method === "PUT") {
    try {
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check if user has permission to edit
      if (question.postedBy.toString() !== session.user.id) {
        return res.status(403).json({ message: "Not authorized to edit this question" });
      }

      const { title, description } = req.body;
      const updated = await Question.findByIdAndUpdate(
        id, 
        { title, description }, 
        { new: true }
      ).populate('postedBy', 'username profile.avatar');
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update question." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check permissions
      const canDelete = 
        session.user.role === 'superadmin' || 
        (session.user.role === 'admin' && question.collegeId.toString() === session.user.collegeId) ||
        question.postedBy.toString() === session.user.id;

      if (!canDelete) {
        return res.status(403).json({ message: "Not authorized to delete this question" });
      }

      await Question.findByIdAndDelete(id);
      res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question." });
    }
  }
}