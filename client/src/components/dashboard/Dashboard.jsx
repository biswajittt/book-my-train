import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx"; // Get user authentication
import { useNavigate } from "react-router-dom";
import { fetchAllBookings } from "../../handlers/fetchAllBookings.js";
import { cancleSeats } from "../../handlers/cancleSeatHandler.js";

export default function Dashboard() {
  const { user } = useAuth(); // Get user details
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCard, setShowCard] = useState({
    show: false,
    bookingId: "",
  });
  const [travellers, setTravellers] = useState([]);
  const [seatCancled, setSeatCancled] = useState({}); // Store cancellation per traveller
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const result = await fetchAllBookings(user?.id);
      if (result?.data?.status === 201) {
        setAllBookings(result.data.bookings);
        // Extract all travellers and store in state
        const allTravellers = result.data.bookings.flatMap((booking) =>
          booking.travellers.map((traveller) => ({
            ...traveller,
            booking_id: booking.booking_id, // Ensure traveller has booking_id
          }))
        );
        setTravellers(allTravellers);
      } else {
        setError("Something went wrong!");
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  //delete booking
  const cancleSeatHandler = async (travelerId, seatId) => {
    setSeatCancled((prev) => ({
      ...prev,
      [travelerId]: { status: null, code: 1 }, // Loading state
    }));
    const result = await cancleSeats(travelerId, seatId);
    if (result?.data?.status === 201) {
      setSeatCancled((prev) => ({
        ...prev,
        [travelerId]: { status: true, code: 0 }, // Cancellation successful
      }));
    } else {
      setSeatCancled((prev) => ({
        ...prev,
        [travelerId]: { status: false, code: 2 }, // Failed
      }));
    }
  };
  if (loading) {
    return (
      <section class="bg-gray-900 h-screen flex flex-col">
        <h6 className="text-center text-white mt-16">Loading...</h6>
      </section>
    );
  }
  return (
    <>
      {showCard.show && (
        <div
          id="popup-modal"
          tabindex="-1"
          class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div class="m-auto top-[15%] relative p-4 w-auto w-3xl  sm:w-2xl  max-h-full">
            <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
              <button
                type="button"
                class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="popup-modal"
                onClick={() => {
                  setShowCard(false);
                }}
              >
                <svg
                  class="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
              <div class="p-4 md:p-5 text-center">
                {/* {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} */}

                <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-[4rem] mb-[2rem]">
                  <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" class="px-6 py-3">
                          Name
                        </th>
                        <th scope="col" class="px-6 py-3">
                          Age
                        </th>
                        <th scope="col" class="px-6 py-3">
                          Gender
                        </th>
                        <th scope="col" class="px-6 py-3">
                          Seat Row
                        </th>
                        <th scope="col" class="px-6 py-3">
                          Seat No
                        </th>
                        <th scope="col" class="px-6 py-3">
                          <span class="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {travellers
                        .filter((t) => t.booking_id === showCard.bookingId) // Filter travellers by booking_id
                        .map((traveller, index) => (
                          <tr
                            key={index}
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <th
                              scope="row"
                              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                              {traveller.name}
                            </th>
                            <td class="px-6 py-4">{traveller.age}</td>
                            <td class="px-6 py-4">{traveller.gender}</td>
                            <td class="px-6 py-4">
                              {traveller.seat_row_number}
                            </td>
                            <td class="px-6 py-4">{traveller.seat_label}</td>

                            {traveller.is_cancelled ||
                            seatCancled[traveller.id]?.status === true ? (
                              <td className="px-6 py-4 text-right">
                                <p className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                  Cancelled
                                </p>
                              </td>
                            ) : (
                              <td className="px-6 py-4 text-right">
                                <a
                                  className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                  onClick={() =>
                                    cancleSeatHandler(
                                      traveller.id,
                                      traveller.seat_id
                                    )
                                  }
                                >
                                  {seatCancled[traveller.id]?.status === null &&
                                  seatCancled[traveller.id]?.code === 1
                                    ? "Loading..."
                                    : seatCancled[traveller.id]?.status ===
                                        false &&
                                      seatCancled[traveller.id]?.code === 2
                                    ? "Try Again"
                                    : "Cancel"}
                                </a>
                              </td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <section class="bg-gray-900 h-screen flex flex-col">
        {allBookings.length > 0 ? (
          <>
            <h2 class="my-4 mx-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Bookings
            </h2>
            <div class="lg:w-[70vw] px-4 mx-auto lg:px-12 w-[90vw] flex flex-col">
              {allBookings.map((data, index) => (
                <div
                  key={index}
                  class="cursor-pointer relative mb-4 bg-white shadow-md dark:bg-gray-800 sm:rounded-lg"
                  onClick={() => {
                    setShowCard({ show: true, bookingId: data.booking_id });
                  }}
                >
                  <div class="flex flex-col justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                    <p class="text-base font-medium text-gray-900 dark:text-white">
                      Travellers: {data.travellers.length}
                    </p>
                    <span class="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-indigo-400 border border-indigo-400">
                      Booked at:{" "}
                      {new Date(data.booked_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <h6 className="text-center text-white mt-8">Nothing to Show</h6>
        )}
      </section>
    </>
  );
}
