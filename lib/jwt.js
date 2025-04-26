import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret"; // Put a real secret in production

// Add role to the payload before signing the token
export function signToken(user) {
  const { _id, username, email, role } = user;
  const payload = { _id, username, email, role }; // Include role in payload
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // 7 days validity
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET); // Verify and decode the token
}
