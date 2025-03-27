import axios from "axios";
import { supabase } from "../services/supabaseClient.js";
const API_URL = `${import.meta.env.VITE_API_URL}/api/bookings/cancle-seat`; // Adjust based on your backend URL

export const cancleSeats = async (travelerId, seatId) => {
  try {
    // Get the session, which includes the token
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;
    const token = session?.session?.access_token; // Extract access token

    const response = await axios.post(
      `${API_URL}`,
      { travelerId, seatId },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send token
          "Content-Type": "application/json",
        },
      }
    );
    return response; // Successfully booked seats
  } catch (error) {
    console.error("Booking error:", error.response?.data || error.message);
    throw error.response?.data || { error: "Something went wrong" };
  }
};
