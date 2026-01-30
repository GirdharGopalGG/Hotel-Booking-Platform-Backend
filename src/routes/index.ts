import express from "express";
import { loginUserController } from "../controllers/auth-controllers/loginUserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addHotelRoomController } from "../controllers/hotel-controllers/addHotelRoomController.js";
import { getHotelDetailsController } from "../controllers/hotel-controllers/getHotelDetailsController.js";
import { addHotelReviewController } from "../controllers/hotel-controllers/addHotelReviewController.js";

const router = express.Router();

// auth controllers
router.post("/auth/login", loginUserController);

// hotels controllers
router.post("/hotels/:hotelId/rooms", authMiddleware, addHotelRoomController);

router.get("/hotels/:hotelId", authMiddleware, getHotelDetailsController);

router.get("/bookings", authMiddleware, getHotelDetailsController);

router.post("/reviews", authMiddleware, addHotelReviewController);

export default router;
