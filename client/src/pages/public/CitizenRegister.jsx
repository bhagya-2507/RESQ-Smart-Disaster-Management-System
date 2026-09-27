import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";


function CitizenRegister() {
  const navigate = useNavigate();
  

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
    state: "",
city: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

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
  setLoading(true);

  if (
    !form.full_name ||
    !form.email ||
    !form.mobile ||
    !form.password ||
    !form.confirm_password ||
    !form.state ||
    !form.city
  ) {
    setError("Please fill all required fields.");
    setLoading(false);
    return;
  }

  if (form.password !== form.confirm_password) {
    setError("Passwords do not match.");
    setLoading(false);
    return;
  }

  if (form.mobile.length !== 10 || !/^[0-9]+$/.test(form.mobile)) {
    setError("Mobile number must contain exactly 10 digits.");
    setLoading(false);
    return;
  }

  if (form.password.length < 8) {
    setError("Password must contain at least 8 characters.");
    setLoading(false);
    return;
  }

  if (!/[A-Z]/.test(form.password)) {
    setError("Password must contain an uppercase letter.");
    setLoading(false);
    return;
  }

  if (!/[a-z]/.test(form.password)) {
    setError("Password must contain a lowercase letter.");
    setLoading(false);
    return;
  }

  if (!/[0-9]/.test(form.password)) {
    setError("Password must contain a number.");
    setLoading(false);
    return;
  }

  if (!/[!@#$%^&*]/.test(form.password)) {
    setError("Password must contain a special character.");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(
      "https://resq-smart-disaster-management-system.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
          state: form.state,
          city: form.city,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Registration failed.");
      return;
    }

    setSuccess(
  "Account created successfully! Redirecting to Citizen Login..."
);

// Do not automatically log in after registration
setTimeout(() => {
  navigate("/citizen-login");
}, 2000);
  } catch (error) {
    setError(
      "Unable to connect to RESQ server. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card auth-register-card">

        <div className="auth-brand">
          <div className="auth-logo">R</div>

          <div>
            <h1>RESQ</h1>
            <span>SMART DISASTER RESPONSE</span>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">CITIZEN PORTAL</span>

          <h2>Create Account</h2>

          <p>
            Register with RESQ to report emergencies and request assistance.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        {success && (
  <div className="auth-success">
    ✓ {success}
  </div>
)}

        <form onSubmit={handleSubmit}>

          <div className="auth-field">
            <label>Full Name</label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Mobile Number</label>

            <input
              type="tel"
              name="mobile"
              placeholder="Enter 10-digit mobile number"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
  <label>State</label>

  <select
    name="state"
    value={form.state}
    onChange={handleChange}
  >
    <option value="">Select your state</option>
    <option value="Uttar Pradesh">Uttar Pradesh</option>
    <option value="Delhi">Delhi</option>
    <option value="Haryana">Haryana</option>
    <option value="Rajasthan">Rajasthan</option>
    <option value="Maharashtra">Maharashtra</option>
    <option value="Madhya Pradesh">Madhya Pradesh</option>
    <option value="Punjab">Punjab</option>
    <option value="Uttarakhand">Uttarakhand</option>
    <option value="Bihar">Bihar</option>
    <option value="Gujarat">Gujarat</option>
  </select>
</div>

<div className="auth-field">
  <label>City</label>

  <select
    name="city"
    value={form.city}
    onChange={handleChange}
  >
    <option value="">Select your city</option>
    <option value="Ghaziabad">Ghaziabad</option>
    <option value="Delhi">Delhi</option>
    <option value="Noida">Noida</option>
    <option value="Meerut">Meerut</option>
    <option value="Lucknow">Lucknow</option>
    <option value="Kanpur">Kanpur</option>
    <option value="Agra">Agra</option>
    <option value="Haridwar">Haridwar</option>
    <option value="Jaipur">Jaipur</option>
    <option value="Mumbai">Mumbai</option>
  </select>
</div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
            />

            <small className="password-hint">
              8+ characters, uppercase, lowercase, number & special character.
            </small>
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm your password"
              value={form.confirm_password}
              onChange={handleChange}
            />
          </div>

          <button
  type="submit"
  className="register-submit-btn"
  disabled={loading}
>
  {loading ? "Creating Account..." : "Create Account"}
</button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Already have an account?
          <Link to="/citizen-login"> Sign In</Link>
        </p>

        <Link
          to="/"
          className="auth-back"
        >
          ← Back to RESQ
        </Link>

      </div>
    </div>
  );
}

export default CitizenRegister;