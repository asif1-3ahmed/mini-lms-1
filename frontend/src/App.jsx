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

// 🧱 Builder Editors (Create + Edit)
import TopicEditor from "./pages/TopicEditor";
import QuizEditor from "./pages/QuizEditor";
import AssignmentEditor from "./pages/AssignmentEditor";

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

  // ⏳ Loading screen while checking auth
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
            <Route
              path="/courses/new"
              element={<CourseForm onToast={setToast} />}
            />
            <Route
              path="/courses/edit/:id"
              element={<CourseForm edit onToast={setToast} />}
            />

            {/* 🧱 Course Builder Dashboard */}
            <Route
              path="/courses/:courseId/builder"
              element={<CourseBuilder onToast={setToast} />}
            />

            {/* 🧩 Builder Editors */}
            {/* Topic */}
            <Route
              path="/builder/topics/:weekId/new"
              element={<TopicEditor onToast={setToast} />}
            />
            <Route
              path="/builder/topics/:topicId/edit"
              element={<TopicEditor onToast={setToast} />}
            />

            {/* Quiz */}
            <Route
              path="/builder/topics/:topicId/quiz"
              element={<QuizEditor onToast={setToast} />}
            />
            <Route
              path="/builder/quiz/:quizId/edit"
              element={<QuizEditor onToast={setToast} />}
            />

            {/* Assignment */}
            <Route
              path="/builder/topics/:topicId/assignment"
              element={<AssignmentEditor onToast={setToast} />}
            />
            <Route
              path="/builder/assignment/:assignmentId/edit"
              element={<AssignmentEditor onToast={setToast} />}
            />

            {/* 📚 My Courses */}
            <Route path="/mycourses" element={<MyCourses />} />
          </Route>
        </Routes>
      </div>

      {/* 🔔 Toast notifications */}
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </div>
  );
}
