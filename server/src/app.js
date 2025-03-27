import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
