import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import './styles/Login.css';
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await loginUser(email, password);
    if (data.token) {
      dispatch(loginSuccess(data));
      if (data.user.role === "admin") navigate("/admin/dashboard");
      else if (data.user.role === "user") navigate("/normal/home");
      else navigate("/store_owner/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <div className="input-field">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <label>Email</label>
          </div>
          <div className="input-field">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <label>Password</label>
          </div>
          <div className="button-group">
            <button type="submit" className="primary-btn">Login</button>
            <button 
              type="button" 
              onClick={() => navigate("/signup")} 
              className="secondary-btn"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
