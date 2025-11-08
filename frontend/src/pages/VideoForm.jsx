// frontend/src/pages/VideoForm.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

export default function VideoForm({ onToast }) {
  const { courseId } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_file: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "video_file") {
      setForm({ ...form, video_file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("course", courseId);
    if (form.video_file) formData.append("video_file", form.video_file);

    try {
      await API.post("courses/videos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onToast?.({ type: "success", text: "Video uploaded successfully!" });
      navigate(`/courses/${courseId}/videos`);
    } catch (err) {
      console.error("Upload failed:", err);
      onToast?.({ type: "error", text: "Failed to upload video." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 className="h1">Upload Video</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="input"
          name="title"
          placeholder="Video Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="input"
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />
        <input
          className="input"
          type="file"
          name="video_file"
          accept="video/*"
          onChange={handleChange}
          required
        />

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}
