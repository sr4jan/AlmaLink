import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import dbConnect from "@/lib/mongodb"
import Message from "@/models/Message"

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { chatId } = req.query

    await dbConnect()

    await Message.updateMany(
      {
        receiver: session.user.id,
        sender: chatId,
        status: { $ne: 'read' }
      },
      { $set: { status: 'read' } }
    )

    return res.status(200).json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Read messages API Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}