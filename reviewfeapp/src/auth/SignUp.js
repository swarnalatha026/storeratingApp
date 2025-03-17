import React, { useState } from "react";
import { signupUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import './styles/SignUp.css';
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
//   const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const data = await signupUser(name, email, password,address);
    console.log(data);
    if (data?.user?.id) navigate("/");
    else alert("Signup Failed");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1>Create Account</h1>
        <form onSubmit={handleSignup}>
          <div className="input-field">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <label>Name</label>
          </div>
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
          <div className="input-field">
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required 
            />
            <label>Address</label>
          </div>
          <div className="button-group">
            <button type="submit" className="primary-btn">Sign Up</button>
            <button 
              type="button" 
              onClick={() => navigate("/")} 
              className="secondary-btn"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

{/* <select value={role} onChange={(e) => setRole(e.target.value)}>
  <option value="user">User</option>
  <option value="admin">Admin</option>
  <option value="store_owner">Store Owner</option>
</select> */}
