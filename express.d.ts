import type { UserRole } from "./src/generated/prisma/client.ts";

declare global {
  declare namespace Express {
    export interface Request {
      user: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
