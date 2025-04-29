import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const event = await Event.findById(id);
        
        if (!event) {
          return res.status(404).json({
            success: false,
            message: "Event not found"
          });
        }

        return res.status(200).json({
          success: true,
          data: event
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching event",
          error: err.message
        });
      }

    case "PUT":
      try {
        const { userId } = req.body;
        const event = await Event.findById(id);

        if (!event) {
          return res.status(404).json({
            success: false,
            message: "Event not found"
          });
        }

        // Check ownership
        if (event.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: "Not authorized to update this event"
          });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: "2025-04-28 19:22:32" },
          { new: true, runValidators: true }
        );

        return res.status(200).json({
          success: true,
          data: updatedEvent
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating event",
          error: err.message
        });
      }

    case "DELETE":
      try {
        const { userId } = req.body;
        const event = await Event.findById(id);

        if (!event) {
          return res.status(404).json({
            success: false,
            message: "Event not found"
          });
        }

        // Check ownership
        if (event.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: "Not authorized to delete this event"
          });
        }

        await Event.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          message: "Event deleted successfully"
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Error deleting event",
          error: err.message
        });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}