import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🕒 Greet user dynamically based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // 📊 Fetch sample stats (you can replace this later with real API calls)
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalCourses: 12,
        totalUsers: 58,
        totalQuizzes: 24,
        pendingAssignments: 9,
      });
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <div className="dashboard-page">
      {/* 🧭 Header */}
      <div className="card dashboard-header">
        <h1 className="h1">Admin Dashboard</h1>
        <p className="sub">
          {getGreeting()}, <b>{user?.username}</b> 👋 — Manage your learning platform like a pro.
        </p>

        <div className="dashboard-actions">
          <Link to="/courses/new" className="btn primary pulse">
            + Create Course
          </Link>
          <Link to="/courses" className="btn glow">
            Manage Courses
          </Link>
        </div>
      </div>

      {/* 📈 Stats Tiles */}
      <div className="dashboard-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="tile shimmer">
                <div className="shimmer-line" style={{ width: "60%" }}></div>
                <div className="shimmer-line" style={{ width: "80%" }}></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="tile hover-raise">
              <h3>🎓 Total Courses</h3>
              <p className="stat-number">{stats.totalCourses}</p>
              <p className="muted">All courses managed by admins.</p>
            </div>

            <div className="tile hover-raise">
              <h3>👥 Registered Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
              <p className="muted">Includes instructors and students.</p>
            </div>

            <div className="tile hover-raise">
              <h3>🧠 Quizzes Created</h3>
              <p className="stat-number">{stats.totalQuizzes}</p>
              <p className="muted">Across all active topics.</p>
            </div>

            <div className="tile hover-raise">
              <h3>📝 Pending Assignments</h3>
              <p className="stat-number">{stats.pendingAssignments}</p>
              <p className="muted">Submissions awaiting grading.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
