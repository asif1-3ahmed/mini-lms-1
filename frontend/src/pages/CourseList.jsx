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

  // 🎓 Enroll (student only)
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

        {/* 🧩 Admin — Add Course Button */}
        {user.role === "admin" && (
          <Link className="btn primary add-btn" to="/courses/new">
            + Add Course
          </Link>
        )}
      </div>

      {/* 🧠 Courses Grid */}
      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map((course) => {
            const hasVideo = course.videos && course.videos.length > 0;
            let thumbnail = null;

            // ⚡ Cloudinary thumbnail generation (1st frame)
            if (hasVideo && course.videos[0].video_file.includes("cloudinary")) {
              thumbnail = course.videos[0].video_file
                .replace("/upload/", "/upload/so_1/")
                .replace(".mp4", ".jpg");
            }

            return (
              <div key={course.id} className="tile video-tile">
                {/* 🎞️ Video Thumbnail */}
                {hasVideo ? (
                  <div className="video-preview-container">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="Course Preview"
                        className="video-thumb"
                      />
                    ) : (
                      <video
                        src={course.videos[0].video_file}
                        className="video-thumb"
                        muted
                        playsInline
                      />
                    )}
                  </div>
                ) : (
                  <div className="no-thumb">🎬 No Video Available</div>
                )}

                {/* 📘 Course Details */}
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p className="muted">Category: {course.category}</p>
                <p>
                  Instructor: <b>{course.instructor_name}</b>
                </p>

                {/* 🧰 Admin Actions */}
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

                {/* 🎓 Student Actions */}
                {user.role === "student" && (
                  <div className="tile-actions">
                    <button
                      className="btn primary small enroll-btn"
                      onClick={() => enrollCourse(course.id)}
                    >
                      Enroll
                    </button>
                    <button
                      className="btn small"
                      disabled
                      title="Enroll to unlock videos"
                    >
                      🔒 Locked
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">No courses available yet.</div>
        )}
      </div>
    </div>
  );
}
