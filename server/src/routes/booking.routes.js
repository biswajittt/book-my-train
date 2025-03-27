// routes/seatRoutes.js
import express from "express";
import {
  getAvailableSeats,
  bookSeats,
  cancelBooking,
  getUserBookings,
} from "../controllers/booking.controller.js";

import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/available-seats", getAvailableSeats); // Get available seats (no auth required)
router.post("/book", protectRoute, bookSeats); // Only authenticated users can book
router.post("/all-bookings", protectRoute, getUserBookings);
router.post("/cancle-seat", protectRoute, cancelBooking); // Only authenticated users can cancel

export default router;
