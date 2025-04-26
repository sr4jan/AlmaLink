import dbConnect from '@/lib/mongodb';
import Idea from '@/models/Idea';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'PUT':
      try {
        const { title, description, postedBy, userId } = req.body;

        if (!title?.trim() || !description?.trim() || !postedBy) {
          return res.status(400).json({
            success: false,
            message: "Title, description and poster are required"
          });
        }

        const idea = await Idea.findOneAndUpdate(
          { _id: id, userId },
          {
            title: title.trim(),
            description: description.trim(),
            postedBy
          },
          { new: true }
        );

        if (!idea) {
          return res.status(404).json({
            success: false,
            message: "Idea not found or unauthorized"
          });
        }

        return res.status(200).json({
          success: true,
          idea: idea.toObject()
        });
      } catch (error) {
        console.error('Update idea error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to update idea"
        });
      }

    case 'DELETE':
      try {
        const { userId } = req.body;
        
        const idea = await Idea.findOneAndDelete({ _id: id, userId });
        
        if (!idea) {
          return res.status(404).json({
            success: false,
            message: "Idea not found or unauthorized"
          });
        }

        return res.status(200).json({
          success: true,
          message: "Idea deleted successfully"
        });
      } catch (error) {
        console.error('Delete idea error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to delete idea"
        });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`
      });
  }
}