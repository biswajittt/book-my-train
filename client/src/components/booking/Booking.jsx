import React, { useState, useEffect } from "react";
import axios from "axios";
import { bookSeats } from "../../handlers/bookSeats.js";
import { useAuth } from "../../context/AuthContext.jsx"; // Get user authentication
import { useNavigate } from "react-router-dom";

export default function Booking() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user details
  const [showCard, setShowCard] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [addTraveller, setAddTraveller] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  //check avaibale seats
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ code: -1, msg: "" });
  const [bookingSuccessful, setBookingSuccessfull] = useState(false);
  const [avaibaleSeatsNumber, setAvailableSeatsNumber] = useState(null);
  const [showTrainSeatsData, setShowTrainSeatsData] = useState(false);
  const [seatRows, setSeatRows] = useState([]);
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bookings/available-seats`
        );
        setSeats(response.data?.seats);
        setAvailableSeatsNumber(response.data?.availableSeatCount);
        //seat show
        const seatsPerRow = 7;
        const rows = [];
        // Sort the data by row_number and then by seat_label
        const sortedSeats = response.data?.seats.sort((a, b) => {
          if (a.row_number !== b.row_number) {
            return a.row_number - b.row_number;
          }
          return a.seat_label.localeCompare(b.seat_label);
        });
        // Group the sorted seats into rows of 7
        for (let i = 0; i < sortedSeats.length; i += seatsPerRow) {
          rows.push(sortedSeats.slice(i, i + seatsPerRow));
        }
        setSeatRows(rows);
      } catch (err) {
        setError({ code: 0, msg: "Failed to load seats" });
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, []);

  const handleAddTraveller = () => {
    if (!name || !age || !gender) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (addTraveller.length >= 7) {
      setErrorMessage("Maximum of 7 travellers allowed.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      // Added name validation
      setErrorMessage("Name must contain only letters and spaces.");
      return;
    }

    if (!/^\d+$/.test(age) || parseInt(age) <= 0) {
      // Added age validation
      setErrorMessage("Age must be a positive number.");
      return;
    }
    setAddTraveller([...addTraveller, { name, age, gender }]);
    setShowCard(false);
    setName("");
    setAge("");
    setGender("");
    setErrorMessage(""); // Clear error message after successful add
  };
  const removeTravellerField = (index) => {
    if (addTraveller.length >= 1) {
      const updatedTravellers = [...addTraveller];
      updatedTravellers.splice(index, 1);
      setAddTraveller(updatedTravellers);
    }
  };
  //book seats
  const bookSeatsHandler = async (e) => {
    e.preventDefault();
    if (!user) {
      // setMessage("You must be logged in to book seats.");
      return;
    }
    if (addTraveller.length === 0) {
      return;
    }
    try {
      setLoading(true);
      const result = await bookSeats(addTraveller);
      if (result?.data?.status === 500) {
        setError({ code: 1, msg: "Something went wrong, please try again" });
      } else if (result?.data?.status === 401) {
        setError({ code: 2, msg: "You must book between 1 and 7 seats" });
      } else if (result?.data?.status === 400) {
        setError({ code: 3, msg: "Not enough seats available" });
      } else if (result?.data?.status === 201) {
        setAvailableSeatsNumber(
          avaibaleSeatsNumber - result?.data.booked_seats.length
        );
        setError({ code: 4, msg: "Seats booked successfully" });
        setName(""), setAge("");
        setGender("");
        setAddTraveller([]);
        setBookingSuccessfull(true);
        // Update seatRows to mark booked seats
        const bookedSeatIds = result?.data?.booked_seats.map(
          (seat) => seat.seat_id
        );
        setSeatRows((prevSeatRows) => {
          return prevSeatRows.map((row) => {
            return row.map((seat) => {
              if (bookedSeatIds.includes(seat.id)) {
                return { ...seat, is_booked: true };
              }
              return seat;
            });
          });
        });
      }
      // setMessage(`Booking successful! Booking ID: ${result.booking_id}`);
    } catch (error) {
      // setMessage(error.error || "Failed to book seats.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  //display seats

  return (
    <>
      {showTrainSeatsData && (
        <div
          id="popup-modal"
          tabindex="-1"
          class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div class="m-auto top-[22%] relative p-4 w-auto sm:w-2xl  max-h-full">
            <div class="relative rounded-lg shadow-sm bg-gray-700">
              <button
                type="button"
                class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="popup-modal"
                onClick={() => {
                  setShowTrainSeatsData(false);
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
              <div class="p-4 md:p-5 text-center">
                <h2 class=" mb-2 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Seats
                </h2>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <div class="space-y-4 md:flex md:items-center md:justify-center md:gap-6 md:space-y-0">
                  <div className="overflow-x-auto w-full">
                    <div className="flex justify-center">
                      {seatRows.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`}>
                          {row.map((seat) => (
                            <div
                              className={`${
                                seat.is_booked ? "bg-gray-500" : "bg-green-500"
                              } text-white font-bold rounded-lg w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] text-xs sm:text-sm border border-solid flex justify-center items-center m-[5px]`}
                              key={seat.id}
                            >
                              {seat.seat_label}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span class="border text-white font-bold border-solid text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm bg-green-500 text-green-300">
                    Availabe
                  </span>
                  <span class="border text-white font-bold border-solid text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm bg-gray-500 text-gray-300">
                    Not Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {bookingSuccessful && (
        <div
          id="successModal"
          tabindex="-1"
          aria-hidden="true"
          class=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
        >
          <div class="m-auto top-[22%] relative p-4 w-auto max-w-md h-full md:h-auto">
            <div class="mt-[12rem] relative p-4 text-center rounded-lg shadow bg-gray-600 sm:p-5 md:mt-[9rem]">
              <button
                onClick={() => {
                  setBookingSuccessfull(false);
                }}
                type="button"
                class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600 hover:text-white"
                data-modal-toggle="successModal"
              >
                <svg
                  aria-hidden="true"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
              {error.code === 4 ? (
                <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                  <svg
                    aria-hidden="true"
                    class="w-8 h-8 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    class="w-8 h-8 text-gray-500"
                  >
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                  </svg>
                </div>
              )}
              <p class="mb-4 text-lg font-semibold text-gray-900 text-white">
                {error.code !== -1 && error.msg}
              </p>
              <button
                onClick={() => {
                  navigate("/dashboard");
                }}
                data-modal-toggle="successModal"
                type="button"
                class="py-2 px-3 text-sm font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 focus:ring-primary-900"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {showCard && (
        <div
          id="popup-modal"
          tabindex="-1"
          class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div class="m-auto top-[22%] relative p-4 w-auto sm:w-2xl  max-h-full">
            <div class="relative rounded-lg shadow-sm bg-gray-700">
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
              <div class="p-4 md:p-5 text-center">
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <div class="space-y-4 md:flex md:items-center md:justify-center md:gap-6 md:space-y-0">
                  <div>
                    <label
                      for="first_name"
                      class="block mb-2 text-sm font-medium text-white"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      class="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="age"
                      class="block mb-2 text-sm font-medium text-white"
                    >
                      Age(In Years)
                    </label>
                    <input
                      type="text"
                      id="age"
                      class=" border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="20"
                      onChange={(e) => {
                        setAge(e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="gender"
                      class="block mb-2 text-sm font-medium text-white"
                    >
                      Select an option
                    </label>
                    <select
                      id="gender"
                      class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                      }}
                    >
                      <option selected>Choose your gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Others</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  class="mt-4 text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
                  onClick={handleAddTraveller}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section class=" pt-4 antialiased bg-gray-900 md:py-8 h-[100vh]">
        <div class="mx-4 mb-4 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-blue-400 border border-blue-400 inline-flex items-center justify-center">
          {avaibaleSeatsNumber >= 0 ? (
            <h3
              className="cursor-pointer"
              onClick={() => {
                setShowTrainSeatsData(true);
              }}
            >
              Seats Availabe: {avaibaleSeatsNumber}
            </h3>
          ) : (
            <h3>...</h3>
          )}
        </div>
        <div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Add Travellers
          </h2>

          <div class="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
            <div class="mx-auto w-auto flex-none md:w-xl lg:max-w-2xl xl:max-w-4xl">
              <div class="space-y-6">
                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                  {addTraveller.length > 0 ? (
                    addTraveller.map((traveller, index) => (
                      <div class="flex items-center gap-4 mb-4" key={index}>
                        <h6 class="text-lg font-bold dark:text-white">
                          {index + 1}
                          {"."}
                        </h6>
                        <div class="font-medium dark:text-white">
                          <div>{traveller.name}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {traveller.age}
                          </div>
                        </div>
                        {loading ? null : (
                          <button
                            type="button"
                            class="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
                            onClick={() => removeTravellerField(index)}
                          >
                            <svg
                              class="me-1.5 h-5 w-5"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18 17.94 6M18 18 6.06 6"
                              />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <h6 class="text-lg font-bold dark:text-white mb-4">
                      No Traveller added
                    </h6>
                  )}
                  {addTraveller.length < 7 ? (
                    <button
                      type="button"
                      class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
                      onClick={() => {
                        setShowCard(true);
                      }}
                    >
                      Add Traveller
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div class="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                <p class="text-xl font-semibold text-gray-900 dark:text-white">
                  Booking summary
                </p>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <dl class="flex items-center justify-between gap-4">
                      <dt class="text-base font-normal text-gray-500 dark:text-gray-400">
                        One Ticket Price
                      </dt>
                      <dd class="text-base font-medium text-gray-900 dark:text-white">
                        100
                      </dd>
                    </dl>

                    <dl class="flex items-center justify-between gap-4">
                      <dt class="text-base font-normal text-gray-500 dark:text-gray-400">
                        Total Travellers
                      </dt>
                      <dd class="text-base font-medium text-green-600">
                        {addTraveller.length === 0 ? "-" : addTraveller.length}
                      </dd>
                    </dl>

                    <dl class="flex items-center justify-between gap-4">
                      <dt class="text-base font-normal text-gray-500 dark:text-gray-400">
                        Total Ticket Price
                      </dt>
                      <dd class="text-base font-medium text-gray-900 dark:text-white">
                        {addTraveller.length === 0
                          ? "-"
                          : addTraveller.length * 100}
                      </dd>
                    </dl>

                    <dl class="flex items-center justify-between gap-4">
                      <dt class="text-base font-normal text-gray-500 dark:text-gray-400">
                        Tax
                      </dt>
                      <dd class="text-base font-medium text-gray-900 dark:text-white">
                        {addTraveller.length === 0 ? "-" : 30}
                      </dd>
                    </dl>
                  </div>

                  <dl class="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt class="text-base font-bold text-gray-900 dark:text-white">
                      Total
                    </dt>
                    <dd class="text-base font-bold text-gray-900 dark:text-white">
                      {addTraveller.length === 0
                        ? "-"
                        : addTraveller.length * 100 + 30}
                    </dd>
                  </dl>
                </div>
                <button
                  type="button"
                  class={`flex w-full items-center justify-center mt-4 text-gray-900 bg-white  ${
                    addTraveller.length === 0 ? null : "hover:bg-gray-100"
                  } border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2`}
                  disabled={addTraveller.length === 0}
                  onClick={(e) => {
                    bookSeatsHandler(e);
                  }}
                >
                  {addTraveller.length === 0
                    ? "No Traveller Added Yet"
                    : loading
                    ? "Loading..."
                    : "Pay to Book"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
