import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Hammer } from "lucide-react";

export default function CourseForm({ edit = false, onToast }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const { id } = useParams();

  // 🧩 Basic form fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 📥 Load existing course (edit mode)
  useEffect(() => {
    if (edit && id) {
      setLoading(true);
      API.get(`courses/${id}/`)
        .then(({ data }) => setForm(data))
        .catch((err) => console.error("❌ Failed to load course:", err))
        .finally(() => setLoading(false));
    }
  }, [edit, id]);

  // 🚫 Restrict access
  if (!user || (user.role !== "admin" && user.role !== "instructor")) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h1 className="h1">🚫 Access Denied</h1>
        <p className="sub">
          Only <b>admins</b> or <b>instructors</b> can create/edit courses.
        </p>
        <button className="btn primary" onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    );
  }

  // 🧠 Handle form updates
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 💾 Handle create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let courseId = id;
      if (edit) {
        await API.put(`courses/${id}/`, form);
      } else {
        const { data } = await API.post("courses/", form);
        courseId = data.id;
      }

      onToast?.({
        type: "success",
        text: edit
          ? "Course updated successfully!"
          : "Course created successfully!",
      });

      // 🚀 Redirect to Builder (new course) or Courses (edit)
      navigate(`/builder/${courseId}`);
    } catch (err) {
      console.error("❌ Error saving course:", err);
      onToast?.({ type: "error", text: "Failed to save course." });
    } finally {
      setSaving(false);
    }
  };

  // ⌛ Loading spinner
  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <Loader2 className="spin" size={24} />
        <p className="sub">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="card course-form">
      <h1 className="h1">{edit ? "Edit Course" : "Create New Course"}</h1>
      <p className="sub">
        {edit
          ? "Update course details or manage its content in the builder."
          : "Start by adding course details. You’ll structure lessons next."}
      </p>

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

        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="spin" size={18} />{" "}
              {edit ? "Updating..." : "Creating..."}
            </>
          ) : edit ? (
            "Update Course"
          ) : (
            "Create Course"
          )}
        </button>

        {/* 🔧 Builder Shortcut (visible on edit mode) */}
        {edit && (
          <button
            type="button"
            className="btn small"
            style={{ marginLeft: "10px" }}
            onClick={() => navigate(`/builder/${id}`)}
          >
            <Hammer size={16} /> Open Course Builder
          </button>
        )}
      </form>
    </div>
  );
}
