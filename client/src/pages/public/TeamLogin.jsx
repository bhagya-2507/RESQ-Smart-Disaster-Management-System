import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function TeamLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const username = form.username.trim().toUpperCase();
const password = form.password;
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/rescue-team/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to login rescue team."
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Invalid login response from RESQ server."
        );
      }

      localStorage.setItem(
        "resq_token",
        data.token
      );

      login(data.user);

      navigate("/team-dashboard");
    } catch (err) {
      console.error("Team login error:", err);

      setError(
        err.message ||
          "Unable to connect to RESQ server."
      );
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
          <span className="auth-eyebrow">
            EMERGENCY RESPONSE UNIT
          </span>

          <h2>Team Login</h2>

          <p>
            Access assigned incidents and rescue operations.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="auth-field">
            <label>Team Username</label>

            <input
              type="text"
              name="username"
              placeholder="Enter team username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
            />

            <small className="password-hint">
              Password must contain at least 8 characters.
            </small>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : "Enter Rescue Portal →"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Citizen?
          <Link to="/citizen-login">
            {" "}Citizen Login
          </Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to RESQ
        </Link>

      </div>
    </div>
  );
}

export default TeamLogin;