import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";
import { eventState } from "../../shared/context/eventProvider";

const LoginForm = () => {
  const { setUser } = eventState();
  const { role } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [roleMismatch, setRoleMismatch] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setRoleMismatch("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      if (res.data.role.toLowerCase() !== role.toLowerCase()) {
        setRoleMismatch(
          `Role mismatch — your account is "${res.data.role}", but you are logging in as "${role}".`
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("userInfo", JSON.stringify(res.data));
      localStorage.setItem("token", res.data.token);

      setUser(res.data);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* 🔹 LOGO ADDED HERE */}
        <div className="logo-wrapper">
          <img src="/event_logo.png" alt="Event Logo" className="login-logo" />
        </div>

        <h2>{role.toUpperCase()} Login</h2>

        {/* Error banners */}
        {errorMsg && <div className="auth-banner error">{errorMsg}</div>}
        {roleMismatch && <div className="auth-banner error">{roleMismatch}</div>}

        <form onSubmit={handleLogin}>
          <input
            ref={emailRef}
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

          <button
            type="submit"
            className={`auth-role-btn ${role}-btn`}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loader"></span>
            ) : (
              <>
                <span className="btn-icon">🔒</span>
                Login
              </>
            )}
          </button>


        </form>

        <p style={{ textAlign: "right", marginTop: "5px" }}>
          <Link to={`/forgot-password/${role}`}>Forgot password?</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginForm;
