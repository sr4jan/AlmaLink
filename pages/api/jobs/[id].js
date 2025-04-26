// pages/api/jobs/[id].js
import dbConnect from "@/lib/mongodb"; // Ensure this is correct
import Job from "@/models/Job"; // Ensure this is correct

export default async function handler(req, res) {
  await dbConnect(); // Connect to MongoDB

  const { id } = req.query;

  switch (req.method) {
    case "DELETE":
      try {
        const deleted = await Job.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ message: "Job not found" });
        }
        return res.status(200).json({ message: "Job deleted successfully" });
      } catch (err) {
        console.error(`DELETE /api/jobs/${id} error:`, err);
        return res.status(500).json({ message: "Error deleting job", error: err.message });
      }

    default:
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
