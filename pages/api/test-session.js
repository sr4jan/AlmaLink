import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  res.json({
    authenticated: !!session,
    session,
    timestamp: new Date().toISOString()
  });
}