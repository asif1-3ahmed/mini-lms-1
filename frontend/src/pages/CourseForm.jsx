import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseForm({ edit = false, onToast }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
  });
  const [videos, setVideos] = useState([]); // 🎥 store multiple videos
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // 🧠 Load existing course if editing
  useEffect(() => {
    if (edit && id) {
      API.get(`courses/${id}/`).then(({ data }) => setForm(data));
    }
  }, [edit, id]);

  // 📥 Handle basic form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🎥 Handle video uploads
  const handleVideoChange = (e) => {
    setVideos(Array.from(e.target.files)); // multiple file support
  };

  // 🧾 Submit handler for both course + videos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let courseId = id;

      if (edit) {
        // ✏️ Update existing course
        await API.put(`courses/${id}/`, form);
      } else {
        // ➕ Create new course
        const { data } = await API.post("courses/", form);
        courseId = data.id;
      }

      // 🎬 Upload all videos (if any)
      if (videos.length > 0 && courseId) {
        for (const file of videos) {
          const videoData = new FormData();
          videoData.append("title", file.name);
          videoData.append("description", "");
          videoData.append("course", courseId);
          videoData.append("video_file", file);
          await API.post("courses/videos/", videoData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      onToast?.({
        type: "success",
        text: edit ? "Course updated successfully!" : "Course created successfully!",
      });
      navigate("/courses");
    } catch (err) {
      console.error("Error saving course:", err);
      onToast?.({ type: "error", text: "Failed to save course. Check permissions or data." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card course-form">
      <h1 className="h1">{edit ? "Edit Course" : "Create New Course"}</h1>
      <form onSubmit={handleSubmit}>
        {/* 🏷️ Course Info */}
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

        {/* 🎥 Video Uploads */}
        <label className="muted" style={{ marginTop: "10px", display: "block" }}>
          Upload Course Videos (you can select multiple):
        </label>
        <input
          className="input"
          type="file"
          name="videos"
          accept="video/*"
          multiple
          onChange={handleVideoChange}
        />

        {/* 📋 Show selected files */}
        {videos.length > 0 && (
          <ul className="video-preview-list">
            {videos.map((v, i) => (
              <li key={i} className="video-preview-item">
                🎞️ {v.name}
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
