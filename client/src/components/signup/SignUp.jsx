import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient.js";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function SignUp() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/booking" replace />;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173/signin",
      },
    });
    console.log(response);
    if (response?.error) {
      setError(response?.error.message);
      setLoading(false);
    } else {
      alert("Check your email for confirmation");
      setLoading(false);
    }
    setLoading(false);
  };
  return (
    <div class="m-auto mt-8 w-full max-w-sm p-4 border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 bg-gray-800 border-gray-700">
      <form class="space-y-6" onSubmit={handleSignUp}>
        <h5 class="text-xl font-medium text-gray-900 text-white">
          Sign up to our platform
        </h5>
        <div>
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900 text-white"
          >
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-gray-900 text-white"
          >
            Your password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div class="text-sm font-medium text-gray-500 text-gray-300">
          Already have an account?{" "}
          <Link
            to="/signin"
            class="text-blue-700 hover:underline text-blue-500"
          >
            Signin
          </Link>
        </div>
      </form>
    </div>
  );
}
