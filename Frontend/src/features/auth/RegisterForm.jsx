import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";

const RegisterForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  // API Base URL from VITE ENV
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (formData.name.trim().length < 3) {
      setErrorMsg("Name must be at least 3 characters.");
      return false;
    }
    if (!formData.email.includes("@")) {
      setErrorMsg("Enter a valid email.");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        ...formData,
        role,
      });

      setSuccessMsg("Registered successfully!");
      setTimeout(() => navigate(`/login/${role}`), 1000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* 🔹 Logo on top */}
        <div className="logo-wrapper">
          <img src="/event_logo.png" alt="Event Logo" className="login-logo" />
        </div>

        <h2>{role.toUpperCase()} Registration</h2>

        {/* 🔹 banners */}
        {errorMsg && <div className="auth-banner error">{errorMsg}</div>}
        {successMsg && <div className="auth-banner success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <input
            ref={nameRef}
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <input
            name="department"
            placeholder="Department"
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>
          Already registered?{" "}
          <Link to={`/login/${role}`}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
