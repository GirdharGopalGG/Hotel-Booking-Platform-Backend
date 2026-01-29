import jwt from "jsonwebtoken";
import type { UserRole } from "../generated/prisma/enums.js";

function generateToken(data: { id: string; name: string; role: UserRole }) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const token = jwt.sign(data, JWT_SECRET);

  return token;
}

export { generateToken };
