// frontend/src/pages/CourseBuilder.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
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
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="sortable-row" {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function CourseBuilder({ onToast }) {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("courses/weeks/");
        const normalized = data.map((w) => ({ ...w, open: false, topics: [] }));
        const withTopics = await Promise.all(
          normalized.map(async (w) => {
            const { data: tdata } = await API.get(`courses/topics/?week=${w.id}`);
            return { ...w, topics: tdata.map((t) => ({ ...t, blocks: [] })) };
          })
        );
        setWeeks(withTopics);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleWeek = (id) =>
    setWeeks((prev) => prev.map((w) => (w.id === id ? { ...w, open: !w.open } : w)));

  const addWeek = async () => {
    setSaving(true);
    try {
      const { data } = await API.post("courses/weeks/", {
        course: courseId,  // ✅ REQUIRED for backend serializer
        title: `New Week ${weeks.length + 1}`,
        order: weeks.length,
      });
      setWeeks([...weeks, { ...data, open: true, topics: [] }]);
      onToast?.({ type: "success", text: "Week added" });
    } catch {
      onToast?.({ type: "error", text: "Failed to add week" });
    } finally {
      setSaving(false);
    }
  };


  const renameWeek = async (id, title) => {
    setWeeks((prev) => prev.map((w) => (w.id === id ? { ...w, title } : w)));
    try {
      await API.patch(`courses/weeks/${id}/`, { title });
      onToast?.({ type: "success", text: "Renamed successfully" });
    } catch { }
  };

  const addTopic = async (weekId) => {
    setSaving(true);
    try {
      const week = weeks.find((w) => w.id === weekId);
      const nextOrder = week?.topics?.length || 0;
      const { data } = await API.post("courses/topics/", {
        week: weekId,
        title: "New Topic",
        order: nextOrder,
      });
      setWeeks((prev) =>
        prev.map((w) =>
          w.id === weekId ? { ...w, topics: [...w.topics, { ...data, blocks: [] }] } : w
        )
      );
      onToast?.({ type: "success", text: "Topic added" });
    } catch {
      onToast?.({ type: "error", text: "Failed to add topic" });
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async (weekId, topicId, type) => {
    const endpointMap = {
      video: "topicvideos/",
      quiz: "quizzes/",
      assignment: "assignments/",
    };
    const endpoint = endpointMap[type];
    setSaving(true);
    try {
      const { data } = await API.post(`courses/${endpoint}`, {
        topic: topicId,
        title: `New ${type}`,
      });
      setWeeks((prev) =>
        prev.map((w) =>
          w.id === weekId
            ? {
              ...w,
              topics: w.topics.map((t) =>
                t.id === topicId ? { ...t, blocks: [...t.blocks, { ...data, type }] } : t
              ),
            }
            : w
        )
      );
      onToast?.({ type: "success", text: `${type} added!` });
    } catch {
      onToast?.({ type: "error", text: `Failed to add ${type}` });
    } finally {
      setSaving(false);
    }
  };

  const weekIds = useMemo(() => weeks.map((w) => `week-${w.id}`), [weeks]);

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading builder...</p>
      </div>
    );

  return (
    <div className="builder-container">
      <div className="builder-header">
        <h1 className="h1">NovaLearn Builder 2.0</h1>
        <p className="sub">Organize your weeks, topics, and content intuitively.</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <SortableContext items={weekIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {weeks.map((week) => (
              <motion.div
                key={week.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="week-card">
                  <div className="week-header">
                    <div className="week-left" onClick={() => toggleWeek(week.id)}>
                      {week.open ? <ChevronDown /> : <ChevronRight />}
                      <input
                        className="week-input"
                        value={week.title}
                        onChange={(e) => renameWeek(week.id, e.target.value)}
                      />
                    </div>
                    <div className="week-actions">
                      <button className="btn small" onClick={() => addTopic(week.id)}>
                        + Topic
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {week.open && (
                      <motion.div
                        className="topic-list"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {week.topics.length ? (
                          week.topics.map((topic) => (
                            <motion.div
                              key={topic.id}
                              layout
                              className="topic-card"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="topic-top">
                                <input
                                  className="topic-input"
                                  value={topic.title}
                                  onChange={(e) =>
                                    setWeeks((prev) =>
                                      prev.map((w) =>
                                        w.id === week.id
                                          ? {
                                            ...w,
                                            topics: w.topics.map((t) =>
                                              t.id === topic.id
                                                ? { ...t, title: e.target.value }
                                                : t
                                            ),
                                          }
                                          : w
                                      )
                                    )
                                  }
                                />
                                <div className="topic-actions">
                                  <button
                                    className="btn small"
                                    onClick={() => addBlock(week.id, topic.id, "video")}
                                  >
                                    <Video size={16} /> Video
                                  </button>
                                  <button
                                    className="btn small"
                                    onClick={() => addBlock(week.id, topic.id, "quiz")}
                                  >
                                    <BookOpen size={16} /> Quiz
                                  </button>
                                  <button
                                    className="btn small"
                                    onClick={() => addBlock(week.id, topic.id, "assignment")}
                                  >
                                    <Code2 size={16} /> Assignment
                                  </button>
                                </div>
                              </div>

                              {topic.blocks?.length > 0 && (
                                <div className="block-list">
                                  {topic.blocks.map((b) => (
                                    <motion.div
                                      key={b.id}
                                      className={`block-card block-${b.type}`}
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <div className="block-icon">
                                        {b.type === "video" && <Video size={16} />}
                                        {b.type === "quiz" && <BookOpen size={16} />}
                                        {b.type === "assignment" && <Code2 size={16} />}
                                      </div>
                                      <div>
                                        <strong>{b.title}</strong>
                                        <p className="small muted">{b.type.toUpperCase()}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <p className="empty-state">No topics yet. Add one ➕</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      <button className="btn primary fab-btn" onClick={addWeek} disabled={saving}>
        {saving ? <Loader2 className="spin" /> : <Plus />} Add Week
      </button>

      {uploadProgress > 0 && (
        <div className="upload-progress top">
          <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}
    </div>
  );
}
