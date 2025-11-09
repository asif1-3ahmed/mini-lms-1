import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">
          Welcome, {user.username || "User"} 👋
        </h1>
        <p className="dashboard-sub">
          You are logged in as <b>{user.role}</b>.
        </p>

        <div className="dashboard-actions">
          {user.role === "admin" ? (
            <>
              <Link className="btn primary" to="/courses/new">+ Create Course</Link>
              <Link className="btn" to="/courses">Manage Courses</Link>
            </>
          ) : (
            <>
              <Link className="btn primary" to="/mycourses">My Courses</Link>
              <Link className="btn" to="/courses">Explore Courses</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
