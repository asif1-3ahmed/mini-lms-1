import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [greeting, setGreeting] = useState("");

  // Dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header Card */}
      <div className="card dashboard-header student">
        <h1 className="h1">Student Dashboard</h1>
        <p className="sub">
          {greeting}, <b>{user?.username}</b> 👋 — Ready to level up your learning today?
        </p>

        <div className="dashboard-actions">
          <Link to="/courses" className="btn primary">
            📚 Browse Courses
          </Link>
          <Link to="/profile" className="btn glow">
            👤 View Profile
          </Link>
        </div>
      </div>

      {/* Tiles Section */}
      <div className="dashboard-grid">
        <div className="tile hover-raise">
          <h3>📈 My Progress</h3>
          <p className="stat-number">78%</p>
          <p className="muted">You're improving steadily. Keep going!</p>
        </div>

        <div className="tile hover-raise">
          <h3>🎓 Enrolled Courses</h3>
          <p className="stat-number">4</p>
          <p className="muted">Continue your active learning sessions.</p>
        </div>

        <div className="tile hover-raise">
          <h3>🏅 Certificates</h3>
          <p className="stat-number">2</p>
          <p className="muted">Achievements unlocked so far.</p>
        </div>
      </div>
    </div>
  );
}
