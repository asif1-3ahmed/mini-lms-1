import React, { useEffect, useState } from "react";
import API from "../api";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);

  const fetchEnrolled = async () => {
    try {
      const { data } = await API.get("courses/mycourses/");
      setCourses(data);
    } catch {
      alert("Failed to load enrolled courses");
    }
  };

  useEffect(() => { fetchEnrolled(); }, []);

  return (
    <div className="card">
      <h1 className="h1">My Enrolled Courses</h1>
      {courses.length === 0 ? <p>No enrolled courses yet.</p> :
        courses.map((c)=>(
          <div key={c.id} className="tile">
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <p>Instructor: <b>{c.instructor_name}</b></p>
          </div>
        ))
      }
    </div>
  );
}
