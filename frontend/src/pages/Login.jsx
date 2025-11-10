import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login({ onToast }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("accounts/login/", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onToast?.({ type: "success", text: "Welcome back!" });

      // ✅ Redirect based on role
      navigate(
        data.user.role === "admin"
          ? "/admin"
          : data.user.role === "instructor"
          ? "/builder"
          : "/student"
      );
    } catch {
      onToast?.({ type: "error", text: "Invalid username or password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <div className="sub">Sign in to access your dashboard.</div>
        <form onSubmit={submit}>
          <input
            className="input"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={change}
            required
          />
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={change}
            required
          />
          <div className="row">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <Link className="link" to="/register">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
