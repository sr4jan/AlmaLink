import dbConnect from '../../../lib/mongodb';
import LiveSession from '../../../models/LiveSession';

export default async function handler(req, res) {
  await dbConnect();

  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'PUT':
      try {
        const session = await LiveSession.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!session) return res.status(404).json({ success: false });
        res.status(200).json(session);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedSession = await LiveSession.deleteOne({ _id: id });
        if (!deletedSession) return res.status(404).json({ success: false });
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
