import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import API from "../api";

export default function CourseVideos() {
  const { id } = useParams(); // course ID
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndVideos = async () => {
      try {
        const { data: courseData } = await API.get(`courses/${id}/`);
        setCourse(courseData);
        const { data: videoData } = await API.get(`courses/videos/?course=${id}`);
        setVideos(videoData);
      } catch (err) {
        console.error("Error loading videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndVideos();
  }, [id]);

  if (loading) return <div className="card">Loading...</div>;
  if (!course) return <div className="card">Course not found.</div>;

  return (
    <div className="card course-card">
      <div className="course-header">
        <h1 className="h1">{course.title}</h1>
        <Link to="/student" className="btn primary">⬅ Back to Courses</Link>
      </div>
      <p className="muted">{course.description}</p>

      {videos.length === 0 ? (
        <div className="empty-videos">No videos yet for this course.</div>
      ) : (
        <div className="course-grid">
          {videos.map((v) => (
            <div key={v.id} className="tile video-tile">
              <h3>{v.title}</h3>
              <p>{v.description}</p>
              <ReactPlayer
                className="react-player"
                url={v.video_file || v.video_url}
                width="100%"
                height="200px"
                controls
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
