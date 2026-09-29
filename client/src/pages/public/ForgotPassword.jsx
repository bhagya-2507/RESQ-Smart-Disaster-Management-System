
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      sessionStorage.setItem(
        "resq_reset_email",
        email.trim().toLowerCase()
      );

      setMessage(
        "If this email is registered, an OTP will be sent. Please check your inbox."
      );
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
          <h2>Forgot Password?</h2>
          <p>
            Enter your registered email to receive a password reset OTP.
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {message && (
          <div role="status" className="auth-success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="reset-email">Email Address</label>
            <input
              id="reset-email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {message && (
          <p className="auth-switch">
            <Link to="/reset-password">Continue to OTP verification</Link>
          </p>
        )}

        <p className="auth-switch">
          Remember your password?
          <Link to="/citizen-login"> Login</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to RESQ
        </Link>
      </div>
    </div>
  );
}