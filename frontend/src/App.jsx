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
import MyCourses from "./pages/MyCourses";
import CourseVideos from "./pages/CourseVideos";
import VideoForm from "./pages/VideoForm";
import API from "./api";

export default function App() {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Verify token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    API.get("accounts/me/")
      .then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToast({ type: "error", text: "Session expired. Please login again." });
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="app-shell">
      <Navbar onToast={setToast} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Login onToast={setToast} />} />
          <Route path="/register" element={<Register onToast={setToast} />} />
          <Route element={<PrivateRoute />}>
            <Route path="/courses/:id/videos" element={<CourseVideos />} />
            <Route path="/courses/:courseId/upload" element={<VideoForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/new" element={<CourseForm />} />
            <Route path="/courses/edit/:id" element={<CourseForm edit />} />
            <Route path="/mycourses" element={<MyCourses />} />
          </Route>
        </Routes>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
