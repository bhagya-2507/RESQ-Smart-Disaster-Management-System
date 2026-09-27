import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function RescueTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/rescue-teams",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load rescue teams."
        );
      }

      setTeams(data.teams || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to connect to RESQ server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const deleteTeam = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rescue team?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/rescue-teams/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete team."
        );
      }

      setTeams((current) =>
        current.filter((team) => team._id !== id)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const updateAvailability = async (id, availability) => {
    try {
      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/rescue-teams/${id}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update availability."
        );
      }

      setTeams((current) =>
        current.map((team) =>
          team._id === id
            ? {
                ...team,
                availability: data.team.availability,
              }
            : team
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">

        <div>
          <span className="admin-eyebrow">
            EMERGENCY RESPONSE
          </span>

          <h1>Rescue Teams</h1>

          <p>
            Manage emergency response teams and availability.
          </p>
        </div>

        <div className="admin-page-header-actions">

          <Link
            to="/admin"
            className="admin-page-back"
          >
            ← Dashboard
          </Link>

          <Link
            to="/admin/rescue-teams/add"
            className="admin-primary-btn"
          >
            + Add Team
          </Link>

        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {loading ? (

        <div className="admin-panel">
          <div className="admin-empty">
            Loading rescue teams...
          </div>
        </div>

      ) : teams.length === 0 ? (

        <div className="admin-panel">
          <div className="admin-empty admin-empty-large">
            <div className="admin-empty-icon">🚑</div>

            <strong>
              No rescue teams yet
            </strong>

            <span>
              Add your first emergency response team.
            </span>

            <button
              className="admin-primary-btn"
              onClick={() =>
                navigate("/admin/rescue-teams/add")
              }
            >
              + Add Rescue Team
            </button>
          </div>
        </div>

      ) : (

        <div className="admin-team-grid">

          {teams.map((team) => (

            <div
              className="admin-team-card"
              key={team._id}
            >

              <div className="admin-team-header">

                <div className="admin-team-icon">
                  🚑
                </div>

                <span
                  className={`admin-team-status ${
                    team.status?.toLowerCase()
                  }`}
                >
                  {team.status}
                </span>

              </div>

              <h3>
                {team.team_name}
              </h3>

              <div className="admin-team-code">
                {team.team_code}
              </div>

              <div className="admin-team-info">

                <div>
                  <span>Leader</span>
                  <span>{team.leader_name}</span>
                </div>

                <div>
                  <span>Contact</span>
                  <span>{team.contact}</span>
                </div>

                <div>
                  <span>Specialization</span>
                  <span>{team.specialization}</span>
                </div>

                <div>
                  <span>Members</span>
                  <span>{team.members_count}</span>
                </div>

                <div>
                  <span>Location</span>
                  <span>
                    {team.city}, {team.state}
                  </span>
                </div>

              </div>

              <div className="admin-team-availability-row">

                <span>Availability</span>

                <select
                  className="admin-team-availability-select"
                  value={
                    team.availability ||
                    "Available"
                  }
                  onChange={(e) =>
                    updateAvailability(
                      team._id,
                      e.target.value
                    )
                  }
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

              </div>

              <div className="admin-team-actions">

                <Link
                  to={`/admin/rescue-teams/edit/${team._id}`}
                >
                  Edit
                </Link>

                <button
                  className="danger"
                  onClick={() =>
                    deleteTeam(team._id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default RescueTeams;