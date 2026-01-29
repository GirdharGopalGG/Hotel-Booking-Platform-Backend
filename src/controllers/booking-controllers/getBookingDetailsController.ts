import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { prisma } from "../../lib/prisma.js";

async function getBookingDetailsController(req: Request, res: Response) {
  const bookingStatus = req.query.status;

  const user = req.user;

  // check role
  if (user.role !== "customer") {
    res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
    return;
  }

  try {
    let userBookingRecords;

    if (bookingStatus === "cancelled" || bookingStatus === "confirmed") {
      // search wiht status
      userBookingRecords = await prisma.booking.findMany({
        where: {
          userId: user.id,
          status: bookingStatus,
        },
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
          Hotel: {
            select: {
              name: true,
            },
          },
          Room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
            },
          },
        },
      });
    } else {
      // get all user bookings
      userBookingRecords = await prisma.booking.findMany({
        where: {
          userId: user.id,
        },
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
          Hotel: {
            select: {
              name: true,
            },
          },
          Room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
            },
          },
        },
      });
    }

    if (userBookingRecords.length === 0) {
      res.status(200).json(successResponse([]));
      return;
    }

    // format
    const bookingRecord = userBookingRecords?.map((booking) => {
      return {
        id: booking.id,
        roomId: booking.Room.id,
        hotelId: booking.hotelId,
        hotelName: booking.Hotel.name,
        roomNumber: booking.Room.roomNumber,
        roomType: booking.Room.roomType,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: booking.guests,
        totalPrice: booking.totalPrice.toNumber(),
        status: booking.status,
        bookingDate: booking.bookingDate,
      };
    });

    res.status(200).json(successResponse(bookingRecord));
  } catch (error) {
    console.error("Error while get booking details \n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
}

export { getBookingDetailsController };
