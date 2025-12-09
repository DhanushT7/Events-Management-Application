import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/AuthForm.css";

const ForgotPassword = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  // API base url from Vite env
  const baseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
    []
  );

  const [step, setStep] = useState("request"); // request | verify | reset | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [expiresInMinutes, setExpiresInMinutes] = useState(null); // expires for OTP (minutes)
  const [otpCountdown, setOtpCountdown] = useState(null); // seconds remaining for OTP expiry
  const [resendCooldown, setResendCooldown] = useState(0); // seconds before allowed resend

  const emailRef = useRef(null);
  const otpRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  // Initialize otp countdown when expiresInMinutes changes
  useEffect(() => {
    if (!expiresInMinutes) return;
    setOtpCountdown(Math.max(0, Math.floor(expiresInMinutes * 60)));
  }, [expiresInMinutes]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown === null) return;
    if (otpCountdown <= 0) return;
    const t = setInterval(() => setOtpCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [otpCountdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // small helper to format seconds as mm:ss
  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  // Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    // basic validation
    const emailTrim = (email || "").trim();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/forgot-password`, {
        email: emailTrim,
        role,
      });

      const data = res.data || {};
      setMessage(data.message || "OTP sent to your email.");
      // server may return expiresInMinutes
      setExpiresInMinutes(data.expiresInMinutes || 10);
      setStep("verify");

      // set resend cooldown (server may specify; fallback to 30s)
      setResendCooldown(data.resendCooldownSeconds || 30);

      // focus OTP input after a tick
      setTimeout(() => {
        if (otpRef.current) otpRef.current.focus();
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    if (!otp || otp.length < 4) {
      setError("Enter the complete OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/forgot-password/verify`, {
        email: email.trim(),
        role,
        otp,
      });

      const data = res.data || {};
      setResetToken(data.resetToken || "");
      setMessage(data.message || "OTP verified - you can now set a new password.");
      setStep("reset");

      setTimeout(() => {
        // autofocus new password
        const el = document.querySelector('input[name="newPassword"]');
        if (el) el.focus();
      }, 250);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/forgot-password/reset`, {
        email: email.trim(),
        role,
        resetToken,
        newPassword,
      });

      setMessage(res.data?.message || "Password updated successfully.");
      setStep("done");
      // navigate to login after a short delay
      setTimeout(() => navigate(`/login/${role}`), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // resend OTP (calls same endpoint)
  const handleResend = async () => {
    clearAlerts();
    if (resendCooldown > 0) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email to resend OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/forgot-password`, {
        email: email.trim(),
        role,
        resend: true,
      });
      setMessage(res.data?.message || "OTP resent.");
      setExpiresInMinutes(res.data?.expiresInMinutes || 10);
      setResendCooldown(res.data?.resendCooldownSeconds || 30);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  // password strength (simple)
  const passwordStrength = (pwd) => {
    if (!pwd || pwd.length < 8) return { score: 0, label: "Too short" };
    let score = 0;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++; // bonus
    const labels = ["Very weak", "Weak", "Okay", "Good", "Strong", "Excellent"];
    return { score, label: labels[Math.min(score, labels.length - 1)] };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo + small caption */}
        <div className="logo-wrapper" aria-hidden>
          <img src="/event_logo.png" alt="Event Logo" className="login-logo" />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h2 style={{ margin: 0 }}>{role?.toUpperCase()} — Reset Password</h2>
          <div className="role-pill" aria-hidden>{role?.toUpperCase()}</div>
        </div>

        {message && (
          <div className="auth-banner success" role="status" aria-live="polite">
            {message}
          </div>
        )}
        {error && (
          <div className="auth-banner error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* STEP: Request OTP */}
        {step === "request" && (
          <form onSubmit={handleRequestOtp} noValidate>
            <label className="field-label">
              Registered email
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-required
              />
            </label>

            <button
              type="submit"
              className="auth-role-btn default"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <span className="btn-loader" aria-hidden /> : <><span className="btn-icon">✉️</span> Send OTP</>}
            </button>
          </form>
        )}

        {/* STEP: Verify OTP */}
        {step === "verify" && (
          <>
            <form onSubmit={handleVerifyOtp} noValidate>
              <label className="field-label">
                Enter OTP
                <input
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  name="otp"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  disabled={loading}
                  aria-required
                  maxLength={6}
                />
              </label>

              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                <small className="input-note">
                  {otpCountdown > 0 ? `OTP expires in ${formatSeconds(otpCountdown)}` : "OTP expired"}
                </small>

                <button
                  type="button"
                  className="link-button"
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0}
                  aria-disabled={loading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                className={`auth-role-btn ${role ? role.toLowerCase() + "-btn" : "default"}`}
                disabled={loading || otp.length !== 6}
                aria-busy={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? <span className="btn-loader" aria-hidden /> : <><span className="btn-icon">🔐</span> Verify OTP</>}
              </button>
            </form>
          </>
        )}

        {/* STEP: Reset Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} noValidate>
            <label className="field-label">
              New password
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  name="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={() => {
                    const el = document.querySelector('input[name="newPassword"]');
                    if (el) el.type = el.type === "password" ? "text" : "password";
                  }}
                  aria-label="Show/Hide new password"
                >
                  Show
                </button>
              </div>
            </label>

            <div className="password-strength">
              <div className={`strength-bar s-${strength.score}`} aria-hidden></div>
              <small className="input-note">Strength: {strength.label}</small>
            </div>

            <label className="field-label">
              Confirm new password
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={() => {
                    const el = document.querySelector('input[name="confirmPassword"]');
                    if (el) el.type = el.type === "password" ? "text" : "password";
                  }}
                  aria-label="Show/Hide confirm password"
                >
                  Show
                </button>
              </div>
            </label>

            <button
              type="submit"
              className={`auth-role-btn ${role ? role.toLowerCase() + "-btn" : "default"}`}
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              aria-busy={loading}
            >
              {loading ? <span className="btn-loader" aria-hidden /> : <><span className="btn-icon">🔒</span> Update password</>}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="auth-helper-card">
            <h4>Password updated</h4>
            <p>You may now log in with your new password. Redirecting to login…</p>
          </div>
        )}

        {/* contextual helper */}
        <div style={{ marginTop: 12 }}>
          {step === "request" && (
            <div className="auth-helper-card">
              <h4>How it works</h4>
              <ol>
                <li>Enter the email registered with your account</li>
                <li>We will send a one-time code (OTP) to that email</li>
                <li>Verify the code and set a new password</li>
              </ol>
              <p className="note">OTP expires in the time shown after sending. Do not share it with anyone.</p>
            </div>
          )}

          {step === "verify" && (
            <div className="auth-helper-card">
              <h4>Didn't receive OTP?</h4>
              <p className="note">Check your spam folder. If it still doesn't arrive, use the resend button (limited retries).</p>
            </div>
          )}

          {step === "reset" && (
            <div className="auth-helper-card">
              <h4>Password tips</h4>
              <ul>
                <li>Use at least 8 characters (12+ recommended)</li>
                <li>Include upper & lower case letters, numbers and symbols</li>
                <li>Do not reuse old or common passwords</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
