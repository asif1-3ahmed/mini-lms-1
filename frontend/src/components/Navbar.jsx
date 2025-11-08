// frontend/src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onToast }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onToast?.({ type: "success", text: "Logged out." });
    navigate("/");
  };

  const goDash = () => {
    if (!user) return navigate("/");
    if (user.role === "admin") navigate("/admin");
    else navigate("/student");
  };

  return (
    <div className="navbar">
      <div className="brand" onClick={goDash} style={{ cursor: "pointer" }}>
        <div className="logo" />
        <div className="title">NovaLearn</div>
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            <div className="muted">
              Hi, <b>{user.username}</b> · {user.role}
            </div>

            {/* 👇 Add the My Courses button here for students */}
            {user?.role === "student" && (
              <button className="btn" onClick={() => navigate("/mycourses")}>
                My Courses
              </button>
            )}

            <button className="btn" onClick={goDash}>Dashboard</button>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => navigate("/")}>Login</button>
            <button className="btn primary" onClick={() => navigate("/register")}>Create account</button>
          </>
        )}
      </div>
    </div>
  );
}
