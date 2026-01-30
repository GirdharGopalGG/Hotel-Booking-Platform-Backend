import express from "express";
import { loginUserController } from "../controllers/auth-controllers/loginUserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addHotelRoomController } from "../controllers/hotel-controllers/addHotelRoomController.js";
import { getHotelDetailsController } from "../controllers/hotel-controllers/getHotelDetailsController.js";
import { signupController } from "../controllers/auth-controllers/signupController.js";
import { createHotelController } from "../controllers/hotel-controllers/createHotel.js";

const router = express.Router();

// auth controllers
router.post('/auth/signup',signupController)
router.post("/auth/login", loginUserController);

// hotels controllers
router.post('/hotels', authMiddleware, createHotelController)

router.post("/hotels/:hotelId/rooms", authMiddleware, addHotelRoomController);

router.get("/hotels/:hotelId", authMiddleware, getHotelDetailsController);

router.get("/bookings", authMiddleware, getHotelDetailsController);

export default router;
