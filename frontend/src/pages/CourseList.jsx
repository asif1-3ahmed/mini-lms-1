import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔄 Fetch all courses
  const fetchCourses = async () => {
    try {
      const { data } = await API.get("courses/");
      setCourses(data);
    } catch {
      alert("⚠️ Failed to load courses.");
    }
  };

  // ❌ Delete a course (admin only)
  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`courses/${id}/`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Only admins can delete courses!");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="card">
      <div className="course-header">
        <h1 className="h1">
          {user.role === "admin" ? "My Courses" : "Available Courses"}
        </h1>

        {/* 🧠 Show 'Add New Course' button only for admins */}
        {user.role === "admin" && (
          <Link className="btn primary add-btn" to="/courses/new">
            + Add Course
          </Link>
        )}
      </div>

      {/* 🧩 Grid layout for course tiles */}
      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map((c) => (
            <div key={c.id} className="tile">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <p className="muted">Category: {c.category}</p>
              <p>
                Instructor: <b>{c.instructor_name}</b>
              </p>

              {/* 🧰 Admin actions */}
              {user.role === "admin" && (
                <div className="tile-actions">
                  <Link className="btn small" to={`/courses/edit/${c.id}`}>
                    Edit
                  </Link>
                  <button
                    className="btn danger small"
                    onClick={() => deleteCourse(c.id)}
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* 🎓 Student enroll */}
              {user.role === "student" && (
                <button className="btn primary small enroll-btn">
                  Enroll
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">No courses available yet.</div>
        )}
      </div>
    </div>
  );
}
