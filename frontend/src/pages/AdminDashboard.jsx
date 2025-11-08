import React from "react";

export default function AdminDashboard(){
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div style={{width:"100%"}}>
      <div className="card" style={{marginBottom:16}}>
        <h1 className="h1">Admin Dashboard</h1>
        <div className="sub">Welcome, {user?.username}. Manage your platform like a boss.</div>
      </div>
      <div className="dashboard">
        <div className="tile">
          <h3>Overview</h3>
          <p className="muted">Quick stats panel. Hook to analytics later.</p>
        </div>
        <div className="tile">
          <h3>Users</h3>
          <p className="muted">Add user management in Week 2.</p>
        </div>
        <div className="tile">
          <h3>Courses</h3>
          <p className="muted">CRUD coming soon.</p>
        </div>
        <div className="tile">
          <h3>Settings</h3>
          <p className="muted">Branding, emails, etc.</p>
        </div>
      </div>
    </div>
  );
}
