import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";

const ForgotPassword = () => {
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('ForgotPassword component - role from URL:', role);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Sending forgot password request:', { email, role });
    
    try {
      const res = await axios.post("http://10.5.12.1:4000/api/auth/forgot-password", { email, role });
      setMessage(res.data.message);
    } catch (err) {
      console.error('Forgot password error:', err.response?.data);
      setMessage(err.response?.data?.message || "Email not registered or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{role.toUpperCase()} - Forgot Password</h2>
        
        {/* Information about the process */}
        <div style={{ 
          backgroundColor: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>Password Reset Process:</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
            <li>Enter your registered email and submit the request</li>
            <li>Your request will be sent to the admin for approval</li>
            <li>Once approved, your password will be reset to your email address</li>
            <li>You will receive an email notification with your new password</li>
          </ol>
        </div>

        <form onSubmit={handleSend}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending Request...' : 'Send Password Reset Request'}
          </button>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: "15px", 
            padding: "10px", 
            borderRadius: "5px",
            textAlign: "center",
            backgroundColor: message.includes('error') || message.includes('not found') ? '#ffebee' : '#e8f5e8',
            color: message.includes('error') || message.includes('not found') ? '#c62828' : '#2e7d32',
            border: `1px solid ${message.includes('error') || message.includes('not found') ? '#ffcdd2' : '#c8e6c9'}`
          }}>
            {message}
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '5px',
          border: '1px solid #ffeaa7'
        }}>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#856404' }}>
            <strong>Note:</strong> This is a secure process that requires admin approval to ensure account security.
            Please be patient while your request is being processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
