import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";

const RegisterForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: ''
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://10.5.12.1:4000/api/auth/register", {
        ...formData,
        role
      });
      alert("Registered successfully!");
      navigate(`/login/${role}`);
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (

    <div className="auth-container">
      <div className="auth-card">
        <h2>{role.toUpperCase()} Registration</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          {/* {role !== 'participant' && ( */}
            <input name="department" placeholder="Department" onChange={handleChange} required />
          {/* )} */}
          <button type="submit">Register</button>
        </form>
        <p>
          Already registered? <Link to={`/login/${role}`}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
