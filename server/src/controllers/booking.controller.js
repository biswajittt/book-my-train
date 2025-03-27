import supabase from "../supabase.js";
export const getAvailableSeats = async (req, res) => {
  const { data, error } = await supabase
    .from("seats")
    .select("*")
    .eq("is_booked", false);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
// book seat
export const bookSeats = async (req, res) => {
  try {
    const user_id = req.user.id; // Get user_id from middleware
    const travellers = req.body.travellers; // Array of travellers [{name, age, gender}]
    // Validate traveler count (must be between 1 and 7)
    if (
      !Array.isArray(travellers) ||
      travellers.length < 1 ||
      travellers.length > 7
    ) {
      return res
        .status(201)
        .json({ status: 401, message: "You must book between 1 and 7 seats." });
    }

    // Fetch available seats (prioritizing same-row booking)
    const { data: availableSeats, error: seatError } = await supabase
      .from("seats")
      .select("*")
      .eq("is_booked", false)
      .order("row_number", { ascending: true }) // Sort by row priority
      .limit(travellers.length);
    console.log(availableSeats);
    if (seatError)
      return res.status(201).json({
        status: 500,
        message: "Something went wrong, please try again.",
      });

    if (!availableSeats || availableSeats.length < travellers.length) {
      return res
        .status(201)
        .json({ status: 400, message: "Not enough seats available." });
    }
    // Create a new booking record
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert([{ user_id, is_active: true }])
      .select("id")
      .single();

    if (bookingError)
      return res.status(201).json({
        status: 500,
        message: "Something went wrong, please try again.",
      });
    const booking_id = newBooking.id;

    // Step 3: Assign seats to travellers
    const travellersData = travellers.map((traveler, index) => ({
      booking_id,
      name: traveler.name,
      age: traveler.age,
      gender: traveler.gender,
      seat_id: availableSeats[index].id.toString(),
      seat_row_number: availableSeats[index].row_number,
      seat_label: availableSeats[index].seat_label,
    }));

    const { error: travellersError } = await supabase
      .from("travellers")
      .insert(travellersData);

    if (travellersError)
      return res.status(201).json({
        status: 500,
        message: "Something went wrong, please try again.",
      });

    // Update seat status to booked
    const seatIds = availableSeats.map((seat) => seat.id);

    const { error: seatUpdateError } = await supabase
      .from("seats")
      .update({ is_booked: true })
      .in("id", seatIds);

    if (seatUpdateError)
      return res.status(201).json({
        status: 500,
        message: "Something went wrong, please try again.",
      });

    // Return success response with booked seats
    return res.status(201).json({
      status: 201,
      message: "Seats booked successfully!",
      booking_id,
      booked_seats: availableSeats.map(({ id, row_number, seat_label }) => ({
        seat_id: id,
        row_number,
        seat_label,
      })),
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(201).json({
      status: 500,
      message: "Something went wrong, please try again.",
    });
  }
};

//fetch all bookings
export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id; // Get authenticated user ID

    // Fetch all bookings for the user, sorted by most recent
    const { data: bookings, error: bookingError } = await supabase
      .from("bookings")
      .select("id, is_active, booked_at")
      .eq("user_id", user_id)
      .order("booked_at", { ascending: false });

    if (bookingError) throw bookingError;

    // Fetch travellers for each booking
    const bookingIds = bookings.map((booking) => booking.id);

    const { data: travellers, error: travellersError } = await supabase
      .from("travellers")
      .select(
        "id, booking_id, name, age, gender, seat_id, seat_row_number,seat_label,is_cancelled,cancelled_at"
      )
      .in("booking_id", bookingIds);

    if (travellersError) throw travellersError;

    // Organize bookings with corresponding travellers
    const result = bookings.map((booking) => ({
      booking_id: booking.id,
      is_active: booking.is_active,
      booked_at: booking.booked_at,
      travellers: travellers
        .filter((t) => t.booking_id === booking.id)
        .map(({ booking_id, ...rest }) => rest), // Remove booking_id for clarity
    }));
    console.log(result);
    return res
      .status(201)
      .json({ status: 201, success: true, bookings: result });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res
      .status(201)
      .json({ status: 500, message: "Something went wrong" });
  }
};

//cancle bookings
export const cancelBooking = async (req, res) => {
  const { travelerId, seatId } = req.body;
  console.log(travelerId, " ", seatId);
  // ✅ Mark traveller's seat as cancelled
  const { error: travellerError } = await supabase
    .from("travellers")
    .update({ is_cancelled: true, cancelled_at: new Date() })
    .eq("id", travelerId);

  if (travellerError)
    return res
      .status(201)
      .json({ status: 500, message: "Failed to cancel traveller seat" });

  // ✅ Free the seat in the `seats` table
  const { error: seatError } = await supabase
    .from("seats")
    .update({ is_booked: false })
    .eq("id", seatId);

  if (seatError)
    return res
      .status(500)
      .json({ status: 500, message: "Failed to update seat status" });

  return res
    .status(201)
    .json({ status: 201, message: "Seat cancelled successfully" });
};
