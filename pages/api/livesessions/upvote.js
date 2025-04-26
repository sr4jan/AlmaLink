import dbConnect from '../../../lib/mongodb';
import LiveSession from '../../../models/LiveSession';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'PATCH') {
    const { id } = req.body;
    try {
      const session = await LiveSession.findById(id);
      if (!session) {
        return res.status(404).json({ success: false });
      }
      session.upvotes += 1;
      await session.save();
      res.status(200).json({ success: true, session });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
