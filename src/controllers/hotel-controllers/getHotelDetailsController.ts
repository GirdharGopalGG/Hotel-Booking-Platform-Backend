import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { prisma } from "../../lib/prisma.js";

async function getHotelDetailsController(req: Request, res: Response) {
  const hotelId = req.params.hotelId as string;

  try {
    // check hotel exist or not
    const hotelRecord = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        description: true,
        city: true,
        country: true,
        amenities: true,
        rating: true,
        totalReviews: true,
        rooms: true,
      },
    });
    if (!hotelRecord) {
      res.status(404).json(errorResponse(ERROR_CODES.HOTEL_NOT_FOUND));
      return;
    }

    res.status(200).json(
      successResponse({
        id: hotelRecord.id,
        ownerId: hotelRecord.ownerId,
        name: hotelRecord.name,
        description: hotelRecord.description,
        city: hotelRecord.city,
        country: hotelRecord.country,
        amenities: hotelRecord.amenities,
        rating: hotelRecord.rating,
        totalReviews: hotelRecord.totalReviews,
        rooms: hotelRecord.rooms.map((room) => {
          return {
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            maxOccupancy: room.maxOccupancy,
          };
        }),
      }),
    );
  } catch (error) {
    console.error("Error while get hotel details \n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
}

export { getHotelDetailsController };
