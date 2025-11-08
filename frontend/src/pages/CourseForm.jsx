import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseForm({ edit = false, onToast }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
  });
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState({}); // {filename: percent}
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // 🧠 Load existing course if editing
  useEffect(() => {
    if (edit && id) {
      API.get(`courses/${id}/`).then(({ data }) => setForm(data));
    }
  }, [edit, id]);

  // 🔒 Restrict access — only admin/instructor
  if (!user || (user.role !== "admin" && user.role !== "instructor")) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h1 className="h1">🚫 Access Denied</h1>
        <p className="sub">
          Only <b>admins</b> and <b>instructors</b> can create or edit courses.
        </p>
        <button className="btn primary" onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleVideoChange = (e) => setVideos(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let courseId = id;

      // 🧩 Create or update the course first
      if (edit) {
        await API.put(`courses/${id}/`, form);
      } else {
        const { data } = await API.post("courses/", form);
        courseId = data.id;
      }

      // 🎬 Upload videos (if any) with progress tracking
      if (videos.length > 0 && courseId) {
        for (const file of videos) {
          const videoData = new FormData();
          videoData.append("title", file.name);
          videoData.append("description", "");
          videoData.append("course", courseId);
          videoData.append("video_file", file);

          await API.post("courses/videos/", videoData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const percent = Math.round((event.loaded * 100) / event.total);
              setProgress((prev) => ({ ...prev, [file.name]: percent }));
            },
          });
        }
      }

      onToast?.({
        type: "success",
        text: edit
          ? "Course updated successfully!"
          : "Course created successfully!",
      });
      navigate("/courses");
    } catch (err) {
      console.error("Error saving course:", err);
      onToast?.({ type: "error", text: "Failed to save course." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card course-form">
      <h1 className="h1">{edit ? "Edit Course" : "Create New Course"}</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="input"
          name="title"
          placeholder="Course Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          className="input"
          name="description"
          placeholder="Course Description"
          value={form.description}
          onChange={handleChange}
        />

        {/* Category Selector */}
        <div className="select-wrapper">
          <select
            className="input select"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Video Upload */}
        <label className="muted" style={{ marginTop: "10px", display: "block" }}>
          Upload Course Videos (optional, multiple allowed):
        </label>
        <input
          className="input"
          type="file"
          name="videos"
          accept="video/*"
          multiple
          onChange={handleVideoChange}
        />

        {/* Preview List + Progress Bars */}
        {videos.length > 0 && (
          <ul className="video-preview-list">
            {videos.map((v) => (
              <li key={v.name} className="video-preview-item">
                🎞️ {v.name}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress[v.name] || 0}%` }}
                  ></div>
                </div>
                <span className="progress-percent">
                  {progress[v.name] ? `${progress[v.name]}%` : "0%"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button className="btn primary" type="submit" disabled={loading}>
          {loading
            ? edit
              ? "Updating..."
              : "Creating..."
            : edit
            ? "Update Course"
            : "Create Course"}
        </button>
      </form>
    </div>
  );
}
