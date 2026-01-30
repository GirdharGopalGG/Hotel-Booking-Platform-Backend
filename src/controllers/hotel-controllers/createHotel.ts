import type { Request, Response } from "express";
import { addHotelSchema } from "../../validations/addHotel.validation.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { prisma } from "../../lib/prisma.js";
export const createHotelController = async (req: Request, res: Response) => {
  try {
    const validatedData = addHotelSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST));
    }
    const { amenities, city, country, description, name } = validatedData.data;

    const isOwner = req.user.role === "owner";

    if (!isOwner) {
      return res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
    }

    const hotel = await prisma.hotel.create({
      data: {
        city,
        country,
        name,
        amenities,
        description,
        ownerId: req.user.id,
      },
    });

    res.status(201).json(
      successResponse({
        id: hotel.id,
        ownerId: hotel.ownerId,
        name: hotel.name,
        description: hotel.description,
        city: hotel.city,
        country: hotel.country,
        amenities: hotel.amenities,
        rating: hotel.rating,
        totalReviews: hotel.totalReviews,
      }),
    );
  } catch (error) {
    console.error("Error in creating hotel\n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
};
