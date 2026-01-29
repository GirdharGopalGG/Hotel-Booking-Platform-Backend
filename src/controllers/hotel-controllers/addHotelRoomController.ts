import type { Request, Response } from "express";
import { ERROR_CODES } from "../../utils/constants.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import {
  addHotelRoomParamsSchema,
  addHotelRoomSchema,
} from "../../validations/addHotelRoom.validation.js";
import { prisma } from "../../lib/prisma.js";

async function addHotelRoomController(req: Request, res: Response) {
  // check user role is owner or not
  if (req.user.role !== "owner") {
    res.status(401).json(errorResponse(ERROR_CODES.UNAUTHORIZED));
    return;
  }

  // validate params
  const parsedParams = addHotelRoomParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST));
    return;
  }

  const { hotelId } = parsedParams.data;

  // validate req body
  const parsedResult = addHotelRoomSchema.safeParse(req.body);
  if (!parsedResult.success) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST));
    return;
  }

  const { roomNumber, roomType, pricePerNight, maxOccupancy } =
    parsedResult.data;

  try {
    // check hotel exist or not
    const hotelRecord = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
      select: {
        id: true,
        ownerId: true,
        rooms: {
          where: {
            roomNumber,
          },
        },
      },
    });
    if (!hotelRecord) {
      res.status(404).json(errorResponse(ERROR_CODES.HOTEL_NOT_FOUND));
      return;
    }

    // check is hotel owned by user
    const isHotelOwnedByUser = hotelRecord.ownerId !== req.user.id;
    if (!isHotelOwnedByUser) {
      res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
      return;
    }

    // check roomNumber already exist or not
    if (hotelRecord.rooms.length > 0) {
      res.status(400).json(errorResponse(ERROR_CODES.ROOM_ALREADY_EXISTS));
      return;
    }

    // add new room to hotel
    const roomRecord = await prisma.room.create({
      data: {
        roomNumber,
        roomType,
        pricePerNight,
        maxOccupancy,
        hotelId,
      },
    });

    res.status(201).json(
      successResponse({
        id: roomRecord.id,
        hotelId: roomRecord.hotelId,
        roomNumber: roomRecord.roomNumber,
        roomType: roomRecord.roomType,
        pricePerNight: roomRecord.pricePerNight,
        maxOccupancy: roomRecord.maxOccupancy,
      }),
    );
  } catch (error) {
    console.error("Error while adding room to hotel \n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
}

export { addHotelRoomController };
