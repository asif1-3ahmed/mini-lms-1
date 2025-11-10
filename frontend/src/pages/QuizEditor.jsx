import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { goBackAfterSave } from "../utils/navigation";

export default function QuizEditor({ onToast }) {
  const { topicId, quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    title: "",
    instructions: "",
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(!!quizId);
  const [saving, setSaving] = useState(false);

  // 🧠 Load quiz if editing
  useEffect(() => {
    if (!quizId) return;
    (async () => {
      try {
        const { data } = await API.get(`courses/quizzes/${quizId}/`);
        setQuiz({ title: data.title, instructions: data.instructions });
        const { data: qdata } = await API.get("courses/quizquestions/");
        setQuestions(qdata.filter((q) => q.quiz === data.id));
      } catch (err) {
        console.error(err);
        onToast?.({ type: "error", text: "Failed to load quiz data" });
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz({ ...quiz, [name]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { prompt: "", type: "mcq", choices: ["", "", "", ""], correct_answer: "" },
    ]);

  const removeQuestion = (i) =>
    setQuestions(questions.filter((_, idx) => idx !== i));

  // 💾 Save / Update quiz
  const handleSave = async () => {
    if (!quiz.title.trim()) {
      onToast?.({ type: "error", text: "Quiz title is required." });
      return;
    }

    setSaving(true);
    try {
      let quizData = quiz;

      if (quizId) {
        await API.patch(`courses/quizzes/${quizId}/`, quizData);
      } else {
        const { data } = await API.post("courses/quizzes/", {
          ...quizData,
          topic: topicId,
        });
        quizData = data;
      }

      // 🧠 Save questions
      for (const q of questions) {
        if (q.id) {
          await API.patch(`courses/quizquestions/${q.id}/`, q);
        } else {
          await API.post("courses/quizquestions/", {
            ...q,
            quiz: quizId || quizData.id,
          });
        }
      }

      onToast?.({ type: "success", text: "Quiz saved successfully!" });
      goBackAfterSave(navigate, "quiz");
    } catch (err) {
      console.error(err);
      onToast?.({ type: "error", text: "Failed to save quiz." });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading quiz...</p>
      </div>
    );

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>{quizId ? "Edit Quiz" : "Create Quiz"}</h2>
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
            value={quiz.title}
            onChange={handleQuizChange}
            placeholder="Quiz title..."
          />
        </label>

        <label>
          <span className="label">Instructions</span>
          <textarea
            className="textarea"
            name="instructions"
            value={quiz.instructions}
            onChange={handleQuizChange}
            placeholder="Enter quiz instructions..."
          />
        </label>

        <h3>Questions</h3>
        {questions.map((q, i) => (
          <div key={i} className="quiz-card">
            <div className="row space-between">
              <span className="label">Question {i + 1}</span>
              <button className="btn small" onClick={() => removeQuestion(i)}>
                ❌ Remove
              </button>
            </div>

            <textarea
              className="textarea"
              placeholder="Enter question..."
              value={q.prompt}
              onChange={(e) => handleQuestionChange(i, "prompt", e.target.value)}
            />

            <div className="options-grid">
              {q.choices.map((choice, cIdx) => (
                <input
                  key={cIdx}
                  className="input"
                  placeholder={`Option ${cIdx + 1}`}
                  value={choice}
                  onChange={(e) => {
                    const newChoices = [...q.choices];
                    newChoices[cIdx] = e.target.value;
                    handleQuestionChange(i, "choices", newChoices);
                  }}
                />
              ))}
            </div>

            <label>
              <span className="label">Correct Answer</span>
              <input
                className="input"
                placeholder="Enter correct answer text"
                value={q.correct_answer}
                onChange={(e) =>
                  handleQuestionChange(i, "correct_answer", e.target.value)
                }
              />
            </label>
          </div>
        ))}
        <button className="btn" onClick={addQuestion}>
          ➕ Add Question
        </button>
      </div>
    </div>
  );
}
