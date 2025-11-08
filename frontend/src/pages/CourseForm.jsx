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
  const [overallProgress, setOverallProgress] = useState(0); // new global progress
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // 🧠 Load existing course if editing
  useEffect(() => {
    if (edit && id) {
      API.get(`courses/${id}/`).then(({ data }) => setForm(data));
    }
  }, [edit, id]);

  // 🧱 Restrict access — only admins/instructors
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

      if (edit) {
        await API.put(`courses/${id}/`, form);
      } else {
        const { data } = await API.post("courses/", form);
        courseId = data.id;
      }

      // 🎬 Upload each video with progress tracking
      if (videos.length > 0 && courseId) {
        let totalUploaded = 0;
        let totalSize = videos.reduce((sum, f) => sum + f.size, 0);

        for (const file of videos) {
          const videoData = new FormData();
          videoData.append("title", file.name);
          videoData.append("description", "");
          videoData.append("course", courseId);
          videoData.append("video_file", file);

          await API.post("courses/videos/", videoData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const filePercent = Math.round(
                (event.loaded * 100) / event.total
              );

              setProgress((prev) => ({
                ...prev,
                [file.name]: filePercent,
              }));

              // Global progress
              const uploadedBytes =
                totalUploaded + (event.loaded / event.total) * file.size;
              const overall = Math.min(
                Math.round((uploadedBytes / totalSize) * 100),
                100
              );
              setOverallProgress(overall);
            },
          });

          totalUploaded += file.size; // update completed bytes
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
      setOverallProgress(100);
      setTimeout(() => setOverallProgress(0), 1500); // fade out after done
    }
  };

  return (
    <div className="card course-form">
      {/* 🌈 Global Loading Bar */}
      {loading && (
        <div className="global-progress-bar">
          <div
            className="global-progress-fill"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      )}

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
        <div className="select-wrapper">
          <select
            className="input"
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

        {videos.length > 0 && (
          <ul className="video-preview-list">
            {videos.map((v) => (
              <li key={v.name} className="video-preview-item">
                🎞️ {v.name}
                {progress[v.name] ? (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress[v.name]}%` }}
                    ></div>
                  </div>
                ) : null}
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
