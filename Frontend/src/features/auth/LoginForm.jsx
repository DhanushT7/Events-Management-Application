import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";
import {eventState} from "../../shared/context/eventProvider"

const LoginForm = () => {

  const {user, setUser} = eventState(); 
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://10.5.12.1:4000/api/auth/login", { email, password });

      if (res.data.role === role) {
        localStorage.setItem("userInfo", JSON.stringify(res.data)); //  Save all user info
        localStorage.setItem("token", res.data.token); // Store token directly without JSON.stringify
        alert("Login successful");
        setUser(res.data);
        navigate(`/${role}/dashboard`);
      } else {
        alert("Role mismatch! You are not a " + role);
      }
    } catch (err) {

      alert("Login failed");
    }
  };

  return (
    
    <div className="auth-container">
      <div className="auth-card">
        <h2>{role.toUpperCase()} Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p style={{ textAlign: "right", marginTop: "5px" }}>
          <Link to={`/forgot-password/${role}`}>Forgot password?</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginForm;
