import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function AddTeam() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    team_name: "",
    team_code: "",
    leader_name: "",
    contact: "",
    specialization: "",
    members_count: "",
    location: "",
    city: "",
    state: "",
    password: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("resq_token");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !form.team_name ||
      !form.team_code ||
      !form.leader_name ||
      !form.contact ||
      !form.specialization ||
      !form.members_count ||
      !form.location ||
      !form.city ||
      !form.state
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.contact)) {
      setError(
        "Contact number must contain exactly 10 digits."
      );
      return;
    }

    if (
      Number(form.members_count) < 1 ||
      Number(form.members_count) > 100
    ) {
      setError(
        "Members count must be between 1 and 100."
      );
      return;
    }

    if (
      form.latitude &&
      (Number(form.latitude) < -90 ||
        Number(form.latitude) > 90)
    ) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (
      form.longitude &&
      (Number(form.longitude) < -180 ||
        Number(form.longitude) > 180)
    ) {
      setError(
        "Longitude must be between -180 and 180."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/rescue-teams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create team."
        );
      }

      alert("Rescue team created successfully.");

      navigate("/admin/rescue-teams");

    } catch (err) {
      setError(
        err.message || "Unable to create rescue team."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">

        <div>
          <span className="admin-eyebrow">
            TEAM MANAGEMENT
          </span>

          <h1>Add Rescue Team</h1>

          <p>
            Register a new emergency response team.
          </p>
        </div>

        <Link
          to="/admin/rescue-teams"
          className="admin-page-back"
        >
          ← Teams
        </Link>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <form
        className="admin-form-panel"
        onSubmit={handleSubmit}
      >

        <div className="admin-form-grid">

          <label>
            Team Name *
            <input
              name="team_name"
              value={form.team_name}
              onChange={handleChange}
              placeholder="e.g. Rapid Response Team"
            />
          </label>

          <label>
            Team Code *
            <input
              name="team_code"
              value={form.team_code}
              onChange={handleChange}
              placeholder="e.g. RRT-001"
            />
          </label>

          <label>
            Team Leader *
            <input
              name="leader_name"
              value={form.leader_name}
              onChange={handleChange}
              placeholder="Leader name"
            />
          </label>

          <label>
            Contact *
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              maxLength="10"
              inputMode="numeric"
              placeholder="10 digit number"
            />
          </label>

          <label>
            Specialization *
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Flood Rescue / Medical / Fire"
            />
          </label>

          <label>
            Members Count *
            <input
              type="number"
              name="members_count"
              value={form.members_count}
              onChange={handleChange}
              min="1"
              max="100"
              placeholder="Team members"
            />
          </label>

          <label className="admin-form-full">
            Location *
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Current team location"
            />
          </label>

          <label>
            City *
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
            />
          </label>

          <label>
            State *
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
            />
          </label>
          <div className="admin-form-group">
  <label htmlFor="password">
    Login Password *
  </label>

  <input
    id="password"
    name="password"
    type="password"
    value={form.password}
    onChange={handleChange}
    placeholder="Enter minimum 8 characters"
    minLength={8}
    required
  />

  <small className="form-help-text">
    This password will be used by the rescue team for login.
  </small>
</div>

          <label>
            Latitude
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="e.g. 28.6692"
            />
          </label>

          <label>
            Longitude
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="e.g. 77.4538"
            />
          </label>

        </div>

        <div className="admin-form-actions">

          <Link
            to="/admin/rescue-teams"
            className="admin-secondary-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="admin-primary-btn"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Rescue Team"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddTeam;