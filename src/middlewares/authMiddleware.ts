import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { errorResponse } from "../utils/responses.js";
import { ERROR_CODES } from "../utils/constants.js";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("")) {
    res.status(401).json(errorResponse(ERROR_CODES.UNAUTHORIZED));
    return;
  }

  const token = authHeader.split(" ")[1] || "";
  const JWT_SECRET = process.env.JWT_SECRET!;

  try {
    const tokenData = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // add custom user object to request
    req.user = {
      id: tokenData.id,
      email: tokenData.email,
      role: tokenData.role,
    };

    next();
  } catch (error) {
    console.error("Error while authenticating token \n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
}

export { authMiddleware };
