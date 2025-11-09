import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Video,
  Code2,
  BookOpen,
  Loader2,
  GripVertical,
} from "lucide-react";
import API from "../api";

// ---------- Sortable Row ----------
function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-row">
      <span className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={18} />
      </span>
      <div className="sortable-content">{children}</div>
    </div>
  );
}

export default function CourseBuilder({ courseId, onToast }) {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );

  // ---------- Load data ----------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get(`courses/weeks/?course=${courseId}`);
        const normalized = data.map((w) => ({ open: true, topics: [], ...w }));

        const withTopics = await Promise.all(
          normalized.map(async (w) => {
            try {
              const { data: tdata } = await API.get(`courses/topics/?week=${w.id}`);
              return { ...w, topics: tdata.map((t) => ({ ...t, blocks: t.blocks || [] })) };
            } catch {
              return w;
            }
          })
        );

        setWeeks(withTopics);
      } catch (e) {
        console.error("Failed to load weeks/topics", e);
        onToast?.({ type: "error", text: "Failed to load course data." });
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, onToast]);

  // ---------- Add Week ----------
  const addWeek = async () => {
    try {
      setSaving(true);
      const { data } = await API.post("courses/weeks/", {
        course: courseId,
        title: `New Week ${weeks.length + 1}`,
        order: weeks.length,
      });
      setWeeks((prev) => [...prev, { ...data, open: true, topics: [] }]);
      onToast?.({ type: "success", text: "✅ Week added successfully!" });
    } catch (err) {
      console.error(err);
      onToast?.({ type: "error", text: "Failed to add week." });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Toggle Week ----------
  const toggleWeek = (id) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, open: !w.open } : w))
    );
  };

  // ---------- Rename Week ----------
  const renameWeek = async (weekId, title) => {
    setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, title } : w)));
    try {
      await API.patch(`courses/weeks/${weekId}/`, { title });
    } catch (e) {
      console.error("Failed to rename week:", e);
    }
  };

  // ---------- Add Topic ----------
  const addTopic = async (weekId) => {
    try {
      setSaving(true);
      const week = weeks.find((w) => w.id === weekId);
      const nextOrder = week?.topics?.length || 0;

      const { data } = await API.post("courses/topics/", {
        week: weekId,
        title: "New Topic",
        order: nextOrder,
      });

      setWeeks((prev) =>
        prev.map((w) =>
          w.id === weekId
            ? { ...w, topics: [...(w.topics || []), { ...data, blocks: [] }] }
            : w
        )
      );
      onToast?.({ type: "success", text: "📘 Topic added successfully!" });
    } catch (err) {
      console.error(err);
      onToast?.({ type: "error", text: "Failed to add topic." });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Rename Topic ----------
  const renameTopic = async (topicId, title) => {
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        topics: w.topics.map((t) => (t.id === topicId ? { ...t, title } : t)),
      }))
    );
    try {
      await API.patch(`courses/topics/${topicId}/`, { title });
    } catch (e) {
      console.error("Failed to rename topic:", e);
    }
  };

  // ---------- Add Block (Video/Quiz/Assignment) ----------
  const addBlock = async (weekId, topicId, type) => {
    const endpointMap = {
      video: "topicvideos/",
      quiz: "quizzes/",
      assignment: "assignments/",
    };
    const endpoint = endpointMap[type];

    try {
      setSaving(true);
      setUploadProgress(0);

      const payload = {
        topic: topicId,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      };

      const { data } = await API.post(`courses/${endpoint}`, payload, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
      });

      setWeeks((prev) =>
        prev.map((w) =>
          w.id === weekId
            ? {
                ...w,
                topics: w.topics.map((t) =>
                  t.id === topicId
                    ? { ...t, blocks: [...(t.blocks || []), { ...data, type }] }
                    : t
                ),
              }
            : w
        )
      );

      onToast?.({ type: "success", text: `🎞️ ${type} added successfully!` });
    } catch (err) {
      console.error(err);
      onToast?.({ type: "error", text: `Failed to add ${type}.` });
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const weekIds = useMemo(() => weeks.map((w) => String(w.id)), [weeks]);

  if (loading) return <div className="card"><p>Loading course builder...</p></div>;

  return (
    <div className="builder-container">
      <div className="builder-header">
        <h1 className="builder-title">🧱 Course Builder</h1>
        <p className="builder-sub">
          Manage your course structure. Add weeks, topics, videos, assignments, and quizzes.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <SortableContext items={weekIds.map((id) => `week:_:${id}`)} strategy={verticalListSortingStrategy}>
          {weeks.map((week) => (
            <SortableRow key={`week:_:${week.id}`} id={`week:_:${week.id}`}>
              <div className="week-card glassy">
                <div className="week-header" onClick={() => toggleWeek(week.id)}>
                  <div className="week-title">
                    {week.open ? <ChevronDown /> : <ChevronRight />}
                    <input
                      className="week-input"
                      value={week.title}
                      onChange={(e) => renameWeek(week.id, e.target.value)}
                    />
                  </div>
                  <button
                    className="btn small glassy add-topic-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addTopic(week.id);
                    }}
                  >
                    + Add Topic
                  </button>
                </div>

                {week.open && (
                  <div className="topics-list">
                    {week.topics?.length ? (
                      week.topics.map((topic) => (
                        <div key={topic.id} className="topic-card glassy">
                          <input
                            className="topic-input"
                            value={topic.title}
                            onChange={(e) => renameTopic(topic.id, e.target.value)}
                          />
                          <div className="topic-actions">
                            <button
                              disabled={saving || uploadProgress > 0}
                              onClick={() => addBlock(week.id, topic.id, "video")}
                            >
                              <Video size={18} /> Video
                            </button>
                            <button onClick={() => addBlock(week.id, topic.id, "assignment")}>
                              <Code2 size={18} /> Assignment
                            </button>
                            <button onClick={() => addBlock(week.id, topic.id, "quiz")}>
                              <BookOpen size={18} /> Quiz
                            </button>
                          </div>

                          {topic.blocks?.length > 0 && (
                            <div className="blocks-list">
                              {topic.blocks.map((block) => (
                                <div key={`${block.type}-${block.id}`} className={`block-item block-${block.type}`}>
                                  <strong>{block.title}</strong>
                                  <p className="muted small">Type: {block.type}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state small">No topics yet. Add one 👆</div>
                    )}
                  </div>
                )}
              </div>
            </SortableRow>
          ))}
        </SortableContext>
        <DragOverlay />
      </DndContext>

      <button className="btn primary add-week-btn glassy" onClick={addWeek} disabled={saving}>
        {saving ? <Loader2 className="spin" /> : <Plus />} Add Week
      </button>

      {uploadProgress > 0 && (
        <div className="upload-progress glassy">
          <div
            className="upload-progress-bar"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="upload-progress-text">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
}