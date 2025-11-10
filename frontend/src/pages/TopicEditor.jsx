import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { goBackAfterSave } from "../utils/navigation";

export default function TopicEditor({ onToast }) {
  const { weekId, topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState({
    title: "",
    subheading: "",
    content: "",
  });
  const [video, setVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!topicId);

  // 🧠 Load topic data if editing
  useEffect(() => {
    if (!topicId) return;

    (async () => {
      try {
        const { data } = await API.get(`courses/topics/${topicId}/`);
        setTopic({
          title: data.title || "",
          subheading: data.subheading || "",
          content: data.content || "",
        });
      } catch (err) {
        console.error(err);
        onToast?.({ type: "error", text: "Failed to load topic data" });
      } finally {
        setLoading(false);
      }
    })();
  }, [topicId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTopic({ ...topic, [name]: value });
  };

  const handleFileChange = (e) => setVideo(e.target.files[0]);

  const handleSave = async () => {
    if (!topic.title.trim()) {
      onToast?.({ type: "error", text: "Title is required" });
      return;
    }

    setSaving(true);
    try {
      let topicData = topic;

      if (topicId) {
        // ✏️ Update existing topic
        await API.patch(`courses/topics/${topicId}/`, topicData);
      } else {
        // 🆕 Create new topic
        const { data: created } = await API.post("courses/topics/", {
          ...topicData,
          week: weekId,
        });
        topicData = created;
      }

      // 🎞 Upload video if provided
      if (video) {
        const formData = new FormData();
        formData.append("topic", topicId || topicData.id);
        formData.append("title", video.name);
        formData.append("video_file", video);

        await API.post("courses/topicvideos/", formData, {
          onUploadProgress: (p) =>
            setUploadProgress(Math.round((p.loaded * 100) / p.total)),
        });
      }

      onToast?.({ type: "success", text: "Topic saved successfully!" });
      goBackAfterSave(navigate, "topic");
    } catch (err) {
      console.error(err);
      onToast?.({ type: "error", text: "Failed to save topic." });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading topic...</p>
      </div>
    );

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>{topicId ? "Edit Topic" : "Create New Topic"}</h2>
        <button className="btn primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="editor-form">
        <label>
          <span className="label">Title</span>
          <input
            className="input"
            name="title"
            value={topic.title}
            onChange={handleChange}
            placeholder="Topic title..."
          />
        </label>

        <label>
          <span className="label">Subheading</span>
          <input
            className="input"
            name="subheading"
            value={topic.subheading}
            onChange={handleChange}
            placeholder="Optional subheading..."
          />
        </label>

        <label>
          <span className="label">Content</span>
          <textarea
            className="textarea"
            name="content"
            value={topic.content}
            onChange={handleChange}
            placeholder="Add description, overview, or notes..."
          />
        </label>

        <label>
          <span className="label">Upload Video (optional)</span>
          <input type="file" accept="video/*" onChange={handleFileChange} />
        </label>

        {video && (
          <div className="upload-progress">
            <div
              className="upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
