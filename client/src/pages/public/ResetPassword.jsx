
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    () => sessionStorage.getItem("resq_reset_email") || ""
  );
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset failed.");
      }

      sessionStorage.removeItem("resq_reset_email");
      setMessage("Password reset successfully. Redirecting to login...");

      setTimeout(() => navigate("/citizen-login"), 1500);
    } catch (err) {
      setError(err.message || "Unable to connect to RESQ server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">R</div>
          <div>
            <h1>RESQ</h1>
            <span>SMART DISASTER RESPONSE</span>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">CITIZEN PORTAL</span>
          <h2>Reset Password</h2>
          <p>Enter your email, OTP, and choose a new password.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success" role="status">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="reset-email">Registered Email</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reset-otp">6-digit OTP</label>
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP from email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
              required
            />
          </div>

          <small className="password-hint">
            Use 8+ characters with uppercase, lowercase, number and special character.
          </small>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-switch">
          Need another OTP? <Link to="/forgot-password">Request OTP</Link>
        </p>

        <Link to="/citizen-login" className="auth-back">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}