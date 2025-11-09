import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user?.role) return <Navigate to="/" replace />;
  return <Outlet />;
}
