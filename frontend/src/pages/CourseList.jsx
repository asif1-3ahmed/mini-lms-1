import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔄 Fetch all courses
  const fetchCourses = async () => {
    try {
      const { data } = await API.get("courses/");
      setCourses(data);
    } catch (err) {
      console.error("⚠️ Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete course (admin only)
  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`courses/${id}/`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Only admins can delete courses!");
    }
  };

  // 🎓 Enroll course (student only)
  const enrollCourse = async (id) => {
    try {
      await API.post(`courses/${id}/enroll/`);
      alert("✅ Enrolled successfully!");
      fetchCourses();
    } catch {
      alert("❌ Enrollment failed or already enrolled.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading)
    return (
      <div className="card course-card">
        <p>Loading courses...</p>
      </div>
    );

  return (
    <div className="card course-card">
      <div className="course-header">
        <h1 className="h1">
          {user.role === "admin" ? "My Courses" : "Available Courses"}
        </h1>

        {user.role === "admin" && (
          <Link className="btn primary add-btn" to="/courses/new">
            + Add Course
          </Link>
        )}
      </div>

      {/* 🧩 Course Grid */}
      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="tile video-tile">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="muted">Category: {course.category}</p>
              <p>
                Instructor: <b>{course.instructor_name}</b>
              </p>

              {/* 🎬 Show videos only if student is enrolled */}
              {course.videos?.length > 0 && (
                <div className="video-preview">
                  <h4>🎞 Preview Videos</h4>
                  {user.role === "student" ? (
                    <p className="muted small-text">
                      Enroll to unlock video access.
                    </p>
                  ) : (
                    <Link
                      to={`/courses/${course.id}/videos`}
                      className="btn small primary"
                    >
                      Manage Videos
                    </Link>
                  )}
                </div>
              )}

              {/* 🧰 Admin actions */}
              {user.role === "admin" && (
                <div className="tile-actions">
                  <Link className="btn small" to={`/courses/edit/${course.id}`}>
                    Edit
                  </Link>
                  <button
                    className="btn danger small"
                    onClick={() => deleteCourse(course.id)}
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* 🎓 Student enroll button */}
              {user.role === "student" && (
                <button
                  className="btn primary enroll-btn"
                  onClick={() => enrollCourse(course.id)}
                >
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
