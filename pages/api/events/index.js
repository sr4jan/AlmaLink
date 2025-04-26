import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const events = await Event.find().sort({ date: 1 }); // Sort by date in ascending order
        return res.status(200).json(events);
      } catch (err) {
        console.error("Error fetching events:", err);
        return res.status(500).json({ message: "Error fetching events", error: err.message });
      }

    case "POST":
      try {
        const { title, date, description, registrationLink } = req.body;

        if (!title || !date || !description || !registrationLink) {
          return res.status(400).json({ message: "All fields are required" });
        }

        const newEvent = new Event({
          title,
          date,
          description,
          registrationLink,
        });

        await newEvent.save();
        return res.status(201).json(newEvent);
      } catch (err) {
        console.error("Error creating event:", err);
        return res.status(500).json({ message: "Error creating event", error: err.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
