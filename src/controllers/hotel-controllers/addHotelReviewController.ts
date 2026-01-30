import type { Request, Response } from "express";
import { addHotelReviewSchema } from "../../validations/addHotelReview.validation.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import { ERROR_CODES } from "../../utils/constants.js";
import { prisma } from "../../lib/prisma.js";

async function addHotelReviewController(req: Request, res: Response) {
  // check user role
  if (req.user.role !== "customer") {
    res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
    return;
  }

  const user = req.user;

  // validate req body
  const parsedBody = addHotelReviewSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST));
    return;
  }

  const { bookingId, comment, rating } = parsedBody.data;

  try {
    // check booking exist or not
    const bookingRecord = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (!bookingRecord) {
      res.status(404).json(errorResponse(ERROR_CODES.BOOKING_NOT_FOUND));
      return;
    }

    // check review already submitted or not
    const isReviewed = await prisma.review.findFirst({
      where: {
        bookingId: bookingId,
      },
    });
    if (isReviewed) {
      res.status(400).json(errorResponse(ERROR_CODES.ALREADY_REVIEWED));
      return;
    }

    // check booking belongs to user or not
    const isBookingBelongToUser = bookingRecord.userId === user.id;
    if (!isBookingBelongToUser) {
      res.status(403).json(errorResponse(ERROR_CODES.FORBIDDEN));
      return;
    }

    // Booking not eligible for review if (check-out date not passed or cancelled)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkOut = new Date(bookingRecord.checkOutDate);

    const canReview = checkOut < today && bookingRecord.status === "confirmed";
    if (!canReview) {
      res.status(400).json(errorResponse(ERROR_CODES.BOOKING_NOT_ELIGIBLE));
      return;
    }

    const hotelRecord = await prisma.hotel.findUnique({
      where: {
        id: bookingRecord.hotelId,
      },
    });
    if (!hotelRecord) {
      res.status(404).json(errorResponse(ERROR_CODES.HOTEL_NOT_FOUND));
      return;
    }

    // calculate new rating
    const newRating = parseFloat(
      (
        (hotelRecord?.rating * hotelRecord.totalReviews + rating) /
        (hotelRecord.totalReviews + 1)
      ).toFixed(1),
    );

    // create review
    const reviewRecord = await prisma.$transaction(async (tx) => {
      const createdReview = tx.review.create({
        data: {
          hotelId: bookingRecord.hotelId,
          userId: user.id,
          bookingId: bookingId,
          rating,
          comment,
        },
      });

      await tx.hotel.update({
        where: {
          id: hotelRecord.id,
        },
        data: {
          rating: newRating,
          totalReviews: {
            increment: 1,
          },
        },
      });

      return createdReview;
    });

    res.status(201).json(
      successResponse({
        id: reviewRecord.id,
        userId: user.id,
        hotelId: hotelRecord.id,
        bookingId: bookingRecord.id,
        rating: reviewRecord.rating,
        comment: reviewRecord.comment,
        createdAt: reviewRecord.createdAt,
      }),
    );
  } catch (error) {
    console.error("Error while adding hotel review \n", error);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
}

export { addHotelReviewController };
