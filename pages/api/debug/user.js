import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ 
        message: "No session found",
        auth: false 
      });
    }

    await dbConnect();

    const user = await User.findOne({
      $or: [
        { _id: session.user.id },
        { email: session.user.email }
      ]
    });

    return res.status(200).json({
      message: "Debug info",
      sessionData: {
        ...session,
        user: {
          ...session.user,
          password: undefined // Don't send password
        }
      },
      userFound: !!user,
      userData: user ? {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      } : null
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in debug route",
      error: error.message
    });
  }
}