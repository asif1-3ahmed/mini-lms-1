import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseList from "./pages/CourseList";
import CourseForm from "./pages/CourseForm";
import CourseBuilder from "./pages/CourseBuilder";
import MyCourses from "./pages/MyCourses";
import API from "./api";

export default function App() {
  const [toast, setToast] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // ✅ Verify session once on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckingSession(false);
      return;
    }

    API.get("accounts/me/")
      .then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToast({
          type: "error",
          text: "Session expired. Please log in again.",
        });
        navigate("/");
      })
      .finally(() => setCheckingSession(false));
  }, [navigate]);

  // 🔔 Auto-dismiss toast after few seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ⏳ Render loading *after* all hooks
  if (checkingSession) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar onToast={setToast} />
      <div className="container">
        <Routes>
          {/* 🔓 Public Routes */}
          <Route path="/" element={<Login onToast={setToast} />} />
          <Route path="/register" element={<Register onToast={setToast} />} />

          {/* 🔒 Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/new" element={<CourseForm onToast={setToast} />} />
            <Route path="/courses/edit/:id" element={<CourseForm edit onToast={setToast} />} />
            <Route path="/courses/:id/builder" element={<CourseBuilder onToast={setToast} />} />
            <Route path="/mycourses" element={<MyCourses />} />
          </Route>
        </Routes>
      </div>

      {/* 🔔 Toast notifications */}
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </div>
  );
}