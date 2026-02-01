import type { Request, Response } from "express";
import { createBookingSchema } from "../../validations/createBooking.validation.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { prisma } from "../../lib/prisma.js";

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const validatedData = createBookingSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST));
    }

    const { checkInDate, checkOutDate, guests, roomId } = validatedData.data;

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      return res.status(404).json(errorResponse(ERROR_CODES.ROOM_NOT_FOUND));
    }

    const isOwner = req.user.role === "owner";
    if (isOwner) {
      return res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
    }

    const pastDateBooking = checkInDate.getTime() < Date.now();
    if (pastDateBooking) {
      return res.status(400).json(errorResponse(ERROR_CODES.INVALID_DATES));
    }

    const capacityExceeded = guests > room.maxOccupancy;
    if (capacityExceeded) {
      return res.status(400).json(errorResponse(ERROR_CODES.INVALID_CAPACITY));
    }

    const bookings = await prisma.booking.findMany({
      where: {
        roomId,
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
      },
    });

    const isOverlapping = bookings.some((booking) => {
      return (
        checkInDate < booking.checkOutDate && checkOutDate > booking.checkInDate
      );
    });
    if (isOverlapping) {
      return res
        .status(400)
        .json(errorResponse(ERROR_CODES.ROOM_NOT_AVAILABLE));
    }

    const nights =
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice = nights * room.pricePerNight.toNumber();

    const booking = await prisma.booking.create({
      data: {
        roomId,
        checkInDate,
        checkOutDate,
        guests,
        userId: req.user.id,
        hotelId: room.hotelId,
        totalPrice,
      },
    });

    return res.status(201).json(
      successResponse({
        id: booking.id,
        userId: booking.userId,
        roomId: booking.roomId,
        hotelId: booking.hotelId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: booking.guests,
        totalPrice: booking.totalPrice.toNumber(),
        status: booking.status,
        bookingDate: booking.bookingDate,
      }),
    );
  } catch (error) {
    console.error("Error in createBookingController\n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
};
