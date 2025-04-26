import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const jobs = await Job
          .find()
          .sort({ createdAt: -1 })
          .lean();

        return res.status(200).json({
          success: true,
          jobs: jobs.map(job => ({
            ...job,
            createdAt: new Date(job.createdAt).toISOString()
          }))
        });
      } catch (error) {
        console.error('Fetch jobs error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch jobs",
          jobs: [] // Always include an empty jobs array
        });
      }

    case 'POST':
      try {
        const {
          title,
          company,
          location,
          type,
          description,
          requirements,
          salary,
          userId
        } = req.body;

        if (!title?.trim() || !company?.trim() || !description?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Title, company and description are required"
          });
        }

        const job = new Job({
          title: title.trim(),
          company: company.trim(),
          location: location?.trim(),
          type: type || 'Full-time',
          description: description.trim(),
          requirements: requirements?.trim(),
          salary: salary?.trim(),
          userId: userId || 'sr4jan',
          createdAt: new Date().toISOString()
        });

        await job.save();

        return res.status(201).json({
          success: true,
          job: job.toObject()
        });
      } catch (error) {
        console.error('Create job error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to create job"
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