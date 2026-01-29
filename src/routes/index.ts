import express from "express";
import { loginUserController } from "../controllers/auth-controllers/loginUserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addHotelRoomController } from "../controllers/hotel-controllers/addHotelRoomController.js";

const router = express.Router();

// auth controllers
router.post("/auth/login", loginUserController);

// hotels controllers
router.post("/hotels/:hotelId/rooms", authMiddleware, addHotelRoomController);

export default router;
