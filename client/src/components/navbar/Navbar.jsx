import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";
export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); // Clear all items from localStorage
    navigate("/");
  };
  return (
    <header>
      <nav class="border-gray-200 px-4 lg:px-6 py-2.5 bg-gray-800">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link to="/" class="flex items-center">
            <span class="self-center text-xl font-semibold whitespace-nowrap text-white">
              Book My Train
            </span>
          </Link>
          <div class="flex items-center lg:order-2">
            {user ? (
              <>
                <Link
                  to="/booking"
                  class="text-gray-800 text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 hover:bg-gray-700 focus:outline-none focus:ring-gray-800"
                >
                  Booking
                </Link>
                <Link
                  to="/dashboard"
                  class="text-gray-800 text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 hover:bg-gray-700 focus:outline-none focus:ring-gray-800"
                >
                  Dashboard
                </Link>
                <Link
                  onClick={handleLogout}
                  class="text-gray-800 text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 hover:bg-gray-700 focus:outline-none focus:ring-gray-800"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  class="text-gray-800 text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 hover:bg-gray-700 focus:outline-none focus:ring-gray-800"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  class="text-gray-800 text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 hover:bg-gray-700 focus:outline-none focus:ring-gray-800"
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
