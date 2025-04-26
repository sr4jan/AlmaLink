// lib/jwt.js

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret"; // Put a real secret in production

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // 7 days validity
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
