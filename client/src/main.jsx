import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import SignUp from "./components/signup/SignUp.jsx";
import Booking from "./components/booking/Booking.jsx";
import SignIn from "./components/signin/SignIn.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; // Make sure AuthProvider is imported
import Dashboard from "./components/dashboard/Dashboard.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* <Route path="" element={<Home />} /> */}
      <Route path="signup" element={<SignUp />} />
      <Route path="signin" element={<SignIn />} />
      <Route element={<ProtectedRoute />}>
        <Route path="booking" element={<Booking />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
      {/* <Route path="booking" element={<Booking />} /> */}
    </Route>
  )
);
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
