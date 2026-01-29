import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { loginSchema } from "../../validations/auth.validation.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/tokens.js";

export async function loginUserController(req: Request, res: Response) {
  // validate req body
  const parsedResult = loginSchema.safeParse(req.body);
  if (!parsedResult.success) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST));
    return;
  }

  const { email, password } = parsedResult.data;

  try {
    // check user exist or not
    const userRecord = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!userRecord) {
      res.status(400).json(errorResponse(ERROR_CODES.INVALID_CREDENTIALS));
      return;
    }

    // compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userRecord.password,
    );
    if (!isPasswordCorrect) {
      res.status(400).json(errorResponse(ERROR_CODES.INVALID_CREDENTIALS));
      return;
    }

    const token = generateToken({
      id: userRecord.id,
      name: userRecord.name,
      role: userRecord.role,
    });

    res.status(200).json(
      successResponse({
        token: token,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
        },
      }),
    );
  } catch (error) {
    console.error("Error while user login \n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
}
