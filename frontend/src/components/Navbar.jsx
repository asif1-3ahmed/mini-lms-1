import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onToast }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onToast?.({ type: "success", text: "Logged out successfully." });
    navigate("/");
  };

  const goDash = () => {
    if (!user) return navigate("/");
    if (user.role === "admin") navigate("/admin");
    else navigate("/student");
  };

  return (
    <nav className="navbar glassy">
      <div className="brand" onClick={goDash}>
        <div className="logo-glow" />
        <span className="brand-text">NovaLearn</span>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user">
              Hi, <b>{user.username}</b> · {user.role}
            </span>

            {user?.role === "admin" && (
              <button className="btn glassy primary" onClick={() => navigate("/courses/new")}>
                + Add Course
              </button>
            )}

            {user?.role === "student" && (
              <button className="btn glassy primary" onClick={() => navigate("/mycourses")}>
                My Courses
              </button>
            )}

            <button className="btn glassy" onClick={() => navigate("/courses")}>
              Courses
            </button>
            <button className="btn glassy" onClick={goDash}>
              Dashboard
            </button>
            <button className="btn glassy danger" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn glassy" onClick={() => navigate("/")}>
              Login
            </button>
            <button className="btn glassy primary" onClick={() => navigate("/register")}>
              Create Account
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
