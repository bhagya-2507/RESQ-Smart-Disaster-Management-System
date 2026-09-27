import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function RescueRequests() {
  const [requests, setRequests] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resq_token");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestsRes, teamsRes] = await Promise.all([
        fetch("http://localhost:5000/api/rescue-requests/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:5000/api/rescue-teams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const requestsData = await requestsRes.json();
      const teamsData = await teamsRes.json();

      if (!requestsRes.ok) {
        throw new Error(
          requestsData.message || "Unable to load rescue requests."
        );
      }

      if (!teamsRes.ok) {
        throw new Error(
          teamsData.message || "Unable to load rescue teams."
        );
      }

      setRequests(requestsData.requests || []);
      setTeams(teamsData.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/rescue-requests/admin/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setRequests((prev) =>
        prev.map((request) =>
          request._id === id
            ? { ...request, status: data.request.status }
            : request
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const assignTeam = async (requestId, teamId) => {
    if (!teamId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/rescue-requests/admin/${requestId}/assign-team`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            team_id: teamId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to assign rescue team.");
      }

      alert("Rescue team assigned successfully.");

      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-shell">
        <div className="admin-empty-large">
          Loading rescue requests...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">

      {/* HEADER */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            EMERGENCY RESPONSE
          </div>

          <h1>Rescue Requests</h1>

          <p>
            Monitor and manage citizen emergency rescue requests.
          </p>
        </div>

        <Link to="/admin" className="admin-page-back">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* REQUESTS */}
      <div className="admin-table-panel">

        <div className="admin-table-header">
          <div>
            <div className="admin-eyebrow">
              ALL EMERGENCY REQUESTS
            </div>

            <h2>
              {requests.length} Requests
            </h2>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="admin-empty">
            No rescue requests found.
          </div>
        ) : (
          <div className="admin-request-list">

            {requests.map((request) => {

              const assignedTeam =
                request.assigned_team_id;

              const availableTeams = teams.filter(
                (team) =>
                  team.status === "Active" &&
                  team.availability === "Available"
              );

              return (
                <div
                  key={request._id}
                  className="admin-request-card"
                >

                  {/* REQUEST INFO */}
                  <div className="admin-request-summary">

                    <div>
                      <span>REQUESTER</span>
                      <strong>
                        {request.requester_name}
                      </strong>

                      <small>
                        {request.contact}
                      </small>
                    </div>

                    <div>
                      <span>EMERGENCY</span>
                      <strong>
                        {request.disaster_type}
                      </strong>

                      <small>
                        {request.severity}
                      </small>
                    </div>

                    <div>
                      <span>LOCATION</span>
                      <strong>
                        {request.location}
                      </strong>

                      <small>
                        {request.city}, {request.state}
                      </small>
                    </div>

                    <div>
                      <span>PEOPLE</span>
                      <strong>
                        {request.people_count}
                      </strong>

                      <small>People</small>
                    </div>

                  </div>

                  {/* DESCRIPTION */}
                  <div className="admin-request-description">
                    <span>REQUEST DETAILS</span>
                    <p>
                      {request.description}
                    </p>
                  </div>

                  {/* ASSIGNED TEAM */}
                  <div className="admin-request-assignment">

                    <div>
                      <span>RESCUE TEAM</span>

                      {assignedTeam ? (
                        <div className="request-assigned-team">
                          🚑{" "}
                          {assignedTeam.team_name ||
                            "Assigned Team"}
                          {assignedTeam.team_code && (
                            <small>
                              {assignedTeam.team_code}
                            </small>
                          )}
                        </div>
                      ) : request.status === "Resolved" ? (
                        <div className="request-team-disabled">
                          Request already resolved
                        </div>
                      ) : availableTeams.length === 0 ? (
                        <div className="request-team-disabled">
                          No available rescue team
                        </div>
                      ) : (
                        <select
                          className="rescue-team-select"
                          defaultValue=""
                          onChange={(e) =>
                            assignTeam(
                              request._id,
                              e.target.value
                            )
                          }
                        >
                          <option value="" disabled>
                            Assign Rescue Team
                          </option>

                          {availableTeams.map((team) => (
                            <option
                              key={team._id}
                              value={team._id}
                            >
                              {team.team_name} —{" "}
                              {team.team_code}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* STATUS */}
                    <div>
                      <span>STATUS</span>

                      <select
                        className="admin-status-select"
                        value={request.status}
                        onChange={(e) =>
                          updateStatus(
                            request._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Responding">
                          Responding
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>
                      </select>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default RescueRequests;