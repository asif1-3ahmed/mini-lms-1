import React from "react";

export default function StudentDashboard(){
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div style={{width:"100%"}}>
      <div className="card" style={{marginBottom:16}}>
        <h1 className="h1">Student Dashboard</h1>
        <div className="sub">Hey {user?.username}, continue your learning journey.</div>
      </div>
      <div className="dashboard">
        <div className="tile">
          <h3>My Progress</h3>
          <p className="muted">Progress charts drop in Week 3.</p>
        </div>
        <div className="tile">
          <h3>Assigned Courses</h3>
          <p className="muted">Courses listing coming next.</p>
        </div>
        <div className="tile">
          <h3>Certificates</h3>
          <p className="muted">Showcase achievements soon.</p>
        </div>
      </div>
    </div>
  );
}
