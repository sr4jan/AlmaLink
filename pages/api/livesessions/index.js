import connectDB from '@/lib/mongodb';
import LiveSession from '@/models/LiveSession';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const sessions = await LiveSession.find({});
    return res.status(200).json(sessions);
  } else if (req.method === 'POST') {
    const { title, speaker, date, time, description } = req.body;
    const newSession = new LiveSession({ title, speaker, date, time, description });
    await newSession.save();
    return res.status(201).json(newSession);
  } else {
    return res.status(405).end();
  }
}
