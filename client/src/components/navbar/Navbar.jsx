import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";
export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return (
    <header>
      <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link to="/" class="flex items-center">
            <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Book My Train
            </span>
          </Link>
          <div class="flex items-center lg:order-2">
            {user ? (
              <>
                <Link
                  to="/booking"
                  class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
                >
                  Booking
                </Link>
                <Link
                  to="/dashboard"
                  class="text-white bg-primary-900 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                >
                  Dashboard
                </Link>
                <Link
                  onClick={handleLogout}
                  class="text-white bg-primary-900 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  class="text-white bg-primary-900 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
