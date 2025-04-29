import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const { category, status, search } = req.query;
        let query = {};

        // Filter by category
        if (category && category !== 'all') {
          query.category = category;
        }

        // Filter by status
        if (status) {
          query.status = status;
        }

        // Search functionality
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { organizer: { $regex: search, $options: 'i' } }
          ];
        }

        // Get current date
        const now = new Date();

        // Update status of events based on date
        await Event.updateMany(
          { date: { $lt: now }, status: 'upcoming' },
          { status: 'completed' }
        );

        const events = await Event.find(query)
          .sort({ date: 1 })
          .limit(50); // Limit to 50 events for performance

        return res.status(200).json({
          success: true,
          data: events
        });
      } catch (err) {
        console.error("Error fetching events:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching events",
          error: err.message
        });
      }

    case "POST":
      try {
        const {
          title,
          description,
          date,
          location,
          type,
          category,
          capacity,
          registrationLink,
          image,
          tags,
          organizer,
          userId
        } = req.body;

        if (!title || !description || !date || !registrationLink || !userId || !organizer) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields"
          });
        }

        // Create new event
        const newEvent = new Event({
          title,
          description,
          date,
          location: location || 'TBA',
          type: type || 'In-Person',
          category: category || 'other',
          capacity: capacity || null,
          registrationLink,
          image: image || '',
          tags: tags || [],
          organizer,
          userId,
          createdAt: "2025-04-28 19:22:32",
          status: new Date(date) > new Date() ? 'upcoming' : 'completed'
        });

        await newEvent.save();

        return res.status(201).json({
          success: true,
          data: newEvent
        });
      } catch (err) {
        console.error("Error creating event:", err);
        return res.status(500).json({
          success: false,
          message: "Error creating event",
          error: err.message
        });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}