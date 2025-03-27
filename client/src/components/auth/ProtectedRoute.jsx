import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute() {
  const auth = useAuth();

  if (!auth || auth.loading) return <div>Loading...</div>; // Handle undefined case

  if (!auth.user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet context={{ user: auth.user }} />;
}

export default ProtectedRoute;
