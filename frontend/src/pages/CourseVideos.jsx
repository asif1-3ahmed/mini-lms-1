// frontend/src/pages/CourseVideos.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import API from "../api";

export default function CourseVideos() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get(`courses/${courseId}/`).then(({ data }) => setCourse(data));
    API.get(`courses/videos/?course=${courseId}`).then(({ data }) =>
      setVideos(data)
    );
  }, [courseId]);

  return (
    <div className="card">
      <h1 className="h1">{course?.title} — Videos</h1>

      {user.role === "admin" && (
        <Link
          to={`/courses/${courseId}/upload`}
          className="btn primary"
          style={{ marginBottom: "16px" }}
        >
          + Upload New Video
        </Link>
      )}

      {videos.length === 0 ? (
        <p className="muted">No videos uploaded yet.</p>
      ) : (
        <div className="course-grid">
          {videos.map((v) => (
            <div key={v.id} className="tile">
              <h3>{v.title}</h3>
              <p className="muted">{v.description}</p>
              {v.video_file && (
                <ReactPlayer
                  url={v.video_file}
                  controls
                  width="100%"
                  height="180px"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
