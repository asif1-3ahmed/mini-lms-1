import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseForm({ edit=false }) {
  const [form, setForm] = useState({ title: "", description: "", category: "other" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit && id) {
      API.get(`courses/${id}/`).then(({ data }) => setForm(data));
    }
  }, [edit, id]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (edit) await API.put(`courses/${id}/`, form);
      else await API.post("courses/", form);
      navigate("/courses");
    } catch {
      alert("Only admins can modify courses!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 className="h1">{edit ? "Edit Course" : "Add Course"}</h1>
      <form onSubmit={submit}>
        <input className="input" name="title" placeholder="Title" value={form.title}
               onChange={(e)=>setForm({...form, title:e.target.value})} required />
        <textarea className="input" name="description" placeholder="Description"
                  value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
        <select className="input" name="category" value={form.category}
                onChange={(e)=>setForm({...form, category:e.target.value})}>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="other">Other</option>
        </select>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : edit ? "Update Course" : "Add Course"}
        </button>
      </form>
    </div>
  );
}
