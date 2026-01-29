import jwt from "jsonwebtoken";
import type { $Enums } from "../generated/prisma/index.js";

function generateToken(data: {
  id: string;
  name: string;
  role: $Enums.UserRole;
}) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const token = jwt.sign(data, JWT_SECRET);

  return token;
}

export { generateToken };
