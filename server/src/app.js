import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();

//cors
app.use(
  cors({
    origin: "https://book-my-train-wine.vercel.app", // Only allow your frontend to access the backend
    // origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"], // Ensure Authorization is allowed
  })
);
app.use(express.json());

app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
