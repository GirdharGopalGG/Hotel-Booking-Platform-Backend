import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { BookingStatus, Prisma } from "../../generated/prisma/client.js";

export const cancelBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId as string;
    const status = req.query.status as string;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
    });
    if (!booking) {
      return res.status(404).json(errorResponse(ERROR_CODES.BOOKING_NOT_FOUND));
    }

    if (booking.userId !== userId) {
      return res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
    }

    if (booking.status === "cancelled") {
      return res.status(400).json(errorResponse(ERROR_CODES.ALREADY_CANCELLED));
    }

    const hoursUntilCheckIn =
      (booking.checkInDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return res
        .status(400)
        .json(errorResponse(ERROR_CODES.CANCELLATION_DEADLINE_PASSED));
    }

    const statusFilter: Prisma.BookingWhereInput = { userId };

    if (status) {
      statusFilter.status = {
        equals: status as BookingStatus,
      };

      const bookings = await prisma.booking.findMany({
        where: statusFilter,
        select: {
          id: true,
          roomId: true,
          hotelId: true,
          checkInDate: true,
          checkOutDate: true,
          guests: true,
          totalPrice: true,
          status: true,
          bookingDate: true,
          cancelledAt: true,
        },
      });

      return res.status(200).json(successResponse(bookings));
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    return res.status(200).json(
      successResponse({
        id: updatedBooking.id,
        status: updatedBooking.status,
        cancelledAt: updatedBooking.cancelledAt,
      }),
    );
  } catch (error) {
    console.error("Error fetching bookings\n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
};
