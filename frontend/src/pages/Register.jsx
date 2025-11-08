import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register({ onToast }){
  const [form, setForm] = useState({ username:"", email:"", password:"", role:"student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e)=> setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try{
      const { data } = await API.post("register/", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onToast?.({type:"success", text:"Account created!"});
      if(data.user.role === "admin") navigate("/admin");
      else navigate("/student");
    }catch{
      onToast?.({type:"error", text:"Could not register. Try a different username/email."});
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 className="h1">Create your account</h1>
      <div className="sub">Join in 10 seconds. No fluff.</div>
      <form onSubmit={submit}>
        <input className="input" name="username" placeholder="Username" value={form.username} onChange={change} required />
        <input className="input" type="email" name="email" placeholder="Email" value={form.email} onChange={change} required />
        <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={change} required />
        <select className="input select" name="role" value={form.role} onChange={change}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <div className="row">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <Link className="link" to="/">I already have an account</Link>
        </div>
      </form>
    </div>
  );
}
