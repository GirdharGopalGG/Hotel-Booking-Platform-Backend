import type { $Enums } from "./src/generated/prisma/index.js";
import type { UserRole } from "./src/validations/userZodSchema";

declare global {
  declare namespace Express {
    export interface Request {
      user: {
        id: string;
        email: string;
        role: $Enums.UserRole;
      };
    }
  }
}
