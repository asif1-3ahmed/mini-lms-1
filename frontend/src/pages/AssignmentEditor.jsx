import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { goBackAfterSave } from "../utils/navigation";

export default function AssignmentEditor({ onToast }) {
  const { topicId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState({
    title: "",
    description: "",
    allowed_languages: ["python"],
  });
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(!!assignmentId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!assignmentId) return;
    (async () => {
      try {
        const { data } = await API.get(`courses/assignments/${assignmentId}/`);
        setAssignment({
          title: data.title,
          description: data.description,
          allowed_languages: data.allowed_languages || ["python"],
        });
        const { data: testData } = await API.get("courses/assignmenttests/");
        setTests(testData.filter((t) => t.assignment === data.id));
      } catch (err) {
        console.error(err);
        onToast?.({ type: "error", text: "Failed to load assignment data" });
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignment({ ...assignment, [name]: value });
  };

  const addTest = () => setTests([...tests, { input_data: "", expected_output: "" }]);
  const removeTest = (i) => setTests(tests.filter((_, idx) => idx !== i));
  const updateTest = (i, field, value) => {
    const newTests = [...tests];
    newTests[i][field] = value;
    setTests(newTests);
  };

  const handleSave = async () => {
    if (!assignment.title.trim()) {
      onToast?.({ type: "error", text: "Assignment title is required." });
      return;
    }

    setSaving(true);
    try {
      let assignmentData = assignment;

      if (assignmentId) {
        await API.patch(`courses/assignments/${assignmentId}/`, assignmentData);
      } else {
        const { data } = await API.post("courses/assignments/", {
          ...assignmentData,
          topic: topicId,
        });
        assignmentData = data;
      }

      for (const t of tests) {
        if (t.id) {
          await API.patch(`courses/assignmenttests/${t.id}/`, t);
        } else {
          await API.post("courses/assignmenttests/", {
            ...t,
            assignment: assignmentId || assignmentData.id,
          });
        }
      }

      onToast?.({ type: "success", text: "Assignment saved successfully!" });
      goBackAfterSave(navigate, "assignment");
    } catch (err) {
      console.error(err);
      onToast?.({ type: "error", text: "Failed to save assignment." });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading assignment...</p>
      </div>
    );

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>{assignmentId ? "Edit Assignment" : "Create Assignment"}</h2>
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
            value={assignment.title}
            onChange={handleChange}
            placeholder="Assignment title..."
          />
        </label>

        <label>
          <span className="label">Description</span>
          <textarea
            className="textarea"
            name="description"
            value={assignment.description}
            onChange={handleChange}
            placeholder="Describe the problem..."
          />
        </label>

        <h3>Test Cases</h3>
        {tests.map((t, i) => (
          <div key={i} className="quiz-card">
            <div className="row space-between">
              <span className="label">Test Case {i + 1}</span>
              <button className="btn small" onClick={() => removeTest(i)}>
                ❌ Remove
              </button>
            </div>
            <label>
              <span className="label">Input</span>
              <textarea
                className="textarea"
                value={t.input_data}
                onChange={(e) => updateTest(i, "input_data", e.target.value)}
              />
            </label>
            <label>
              <span className="label">Expected Output</span>
              <textarea
                className="textarea"
                value={t.expected_output}
                onChange={(e) =>
                  updateTest(i, "expected_output", e.target.value)
                }
              />
            </label>
          </div>
        ))}
        <button className="btn" onClick={addTest}>
          ➕ Add Test Case
        </button>
      </div>
    </div>
  );
}
