import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function EditTeam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resq_token");

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/rescue-teams",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load team."
          );
        }

        const team = data.teams.find(
          (item) => item._id === id
        );

        if (!team) {
          throw new Error("Rescue team not found.");
        }

        setForm({
          team_name: team.team_name || "",
          team_code: team.team_code || "",
          leader_name: team.leader_name || "",
          contact: team.contact || "",
          specialization: team.specialization || "",
          members_count: team.members_count || "",
          location: team.location || "",
          city: team.city || "",
          state: team.state || "",
          latitude: team.latitude ?? "",
          longitude: team.longitude ?? "",
          status: team.status || "Active",
          availability:
            team.availability || "Available",
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [id]);

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

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:5000/api/rescue-teams/${id}`,
        {
          method: "PATCH",
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
          data.message || "Unable to update team."
        );
      }

      alert("Rescue team updated successfully.");

      navigate("/admin/rescue-teams");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-shell">
        <div className="admin-empty">
          Loading team...
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="admin-page-shell">
        <div className="admin-error">
          {error || "Team not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">

        <div>
          <span className="admin-eyebrow">
            TEAM MANAGEMENT
          </span>

          <h1>Edit Rescue Team</h1>

          <p>
            Update response team information.
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
            />
          </label>

          <label>
            Team Code *
            <input
              name="team_code"
              value={form.team_code}
              onChange={handleChange}
            />
          </label>

          <label>
            Team Leader *
            <input
              name="leader_name"
              value={form.leader_name}
              onChange={handleChange}
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
            />
          </label>

          <label>
            Specialization *
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
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
            />
          </label>

          <label className="admin-form-full">
            Location *
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </label>

          <label>
            City *
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
            />
          </label>

          <label>
            State *
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
            />
          </label>

          <label>
            Latitude
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
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
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </label>

          <label>
            Availability
            <select
              name="availability"
              value={form.availability}
              onChange={handleChange}
            >
              <option value="Available">
                Available
              </option>

              <option value="Busy">
                Busy
              </option>

              <option value="Unavailable">
                Unavailable
              </option>
            </select>
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
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditTeam;