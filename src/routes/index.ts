import express from "express";
import { loginUserController } from "../controllers/auth-controllers/loginUserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addHotelRoomController } from "../controllers/hotel-controllers/addHotelRoomController.js";
import { getHotelDetailsController } from "../controllers/hotel-controllers/getHotelDetailsController.js";
import { addHotelReviewController } from "../controllers/hotel-controllers/addHotelReviewController.js";
import { signupController } from "../controllers/auth-controllers/signupController.js";
import { createHotelController } from "../controllers/hotel-controllers/createHotel.js";
import { getAllHotels } from "../controllers/hotel-controllers/getAllHotels.js";
import { createBookingController } from "../controllers/booking-controllers/createBookingController.js";
import { cancelBookingController } from "../controllers/booking-controllers/cancelBookingController.js";
import { getBookingDetailsController } from "../controllers/booking-controllers/getBookingDetailsController.js";
// import { getAllBookingsController } from "../controllers/hotel-controllers/getAllBookingsController.js";

const router = express.Router();

// auth controllers
router.post("/auth/signup", signupController);
router.post("/auth/login", loginUserController);

// hotels controllers
router.post("/hotels", authMiddleware, createHotelController);
router.post("/hotels/:hotelId/rooms", authMiddleware, addHotelRoomController);
router.get("/hotels", authMiddleware, getAllHotels);
router.get("/hotels/:hotelId", authMiddleware, getHotelDetailsController);

// booking controllers
router.post("/bookings", authMiddleware, createBookingController);
router.get("/bookings", authMiddleware, getBookingDetailsController);
router.put(
  "/bookings/:bookingId/cancel",
  authMiddleware,
  cancelBookingController,
);
router.post("/reviews", authMiddleware, addHotelReviewController);

export default router;
