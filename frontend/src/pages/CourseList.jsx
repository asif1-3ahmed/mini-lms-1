import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchCourses = async () => {
    try {
      const { data } = await API.get("courses/");
      setCourses(data);
    } catch {
      alert("Failed to load courses.");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`courses/${id}/`);
      setCourses(courses.filter((c) => c.id !== id));
    } catch {
      alert("Only admins can delete courses!");
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  return (
    <div className="card">
      <h1 className="h1">{user.role === "admin" ? "My Courses" : "Available Courses"}</h1>

      {/* ✅ Admin-only Add Course Button */}
      {user.role === "admin" && (
        <Link
          className="btn primary"
          to="/courses/new"
          style={{ marginBottom: "20px", display: "inline-block" }}
        >
          + Add New Course
        </Link>
      )}

      <div>
        {courses.map((c) => (
          <div key={c.id} className="tile">
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <p className="muted">Category: {c.category}</p>
            <p>Instructor: <b>{c.instructor_name}</b></p>

            {user.role === "admin" && (
              <div style={{ marginTop: "10px" }}>
                <Link className="btn small" to={`/courses/edit/${c.id}`}>Edit</Link>
                <button className="btn danger small" onClick={() => deleteCourse(c.id)}>Delete</button>
              </div>
            )}

            {user.role === "student" && (
              <button className="btn primary small">Enroll</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
