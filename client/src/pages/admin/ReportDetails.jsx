
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";
function ReportDetails() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [teams, setTeams] = useState([]);
  const [relocationAssessment, setRelocationAssessment] =
    useState(null);
  const [shelterAssessment, setShelterAssessment] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");

  const token = localStorage.getItem("resq_token");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/reports/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load disaster report."
        );
      }

      setReport(data.report);
      setRelocationAssessment(
        data.relocation_assessment || null
      );
      setShelterAssessment(
        data.shelter_assessment || null
      );
    } catch (err) {
      console.error("Report details error:", err);
      setError(err.message || "Unable to load report.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      setTeamsLoading(true);

      const response = await fetch(
        `${API_BASE}/rescue-teams`,
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
      console.error("Teams error:", err);
      setError(err.message || "Unable to load rescue teams.");
    } finally {
      setTeamsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    loadTeams();
  }, [id]);

  const assignTeam = async () => {
    if (!selectedTeam) {
      alert("Please select a rescue team.");
      return;
    }

    try {
      setAssigning(true);

      const response = await fetch(
        `${API_BASE}/reports/admin/${id}/assign-team`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            team_id: selectedTeam,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to assign rescue team."
        );
      }

      setReport(data.report);
      setRelocationAssessment(
        data.relocation_assessment || null
      );
      setShelterAssessment(
        data.shelter_assessment || null
      );
      setSelectedTeam("");

      let message =
        "Rescue team assigned successfully!\n";

      message += "\n===== RELOCATION ASSESSMENT =====\n";

      if (data.relocation_assessment) {
        const relocation = data.relocation_assessment;

        message +=
          `Habitation: ${relocation.habitation_name || "N/A"}\n` +
          `Risk Level: ${relocation.risk_level || "N/A"}\n` +
          `Risk Score: ${relocation.risk_score ?? "N/A"}/100\n` +
          `Priority: ${relocation.relocation_priority || "N/A"}\n` +
          `Recommendation: ${relocation.relocation_recommendation || "Field assessment required"}\n`;
      } else {
        message +=
          "No matching habitation assessment found.\n";
      }

      message += "\n===== SHELTER CAPACITY =====\n";

      if (data.shelter_assessment) {
        const shelter = data.shelter_assessment;

        message +=
          `Open Shelters: ${shelter.open_shelter_count ?? 0}\n` +
          `Available Capacity: ${shelter.total_available_capacity ?? 0}\n` +
          `Estimated Relocation Population: ${shelter.relocation_population_estimate ?? 0}\n` +
          `Capacity Gap: ${shelter.estimated_capacity_gap ?? 0}\n`;
      } else {
        message +=
          "Shelter assessment unavailable. Check backend response.\n";
      }

      message +=
        "\nPlanning estimates only. Follow official disaster-management instructions.";

      alert(message);

      loadTeams();
    } catch (err) {
      console.error("Assign team error:", err);
      alert(err.message || "Unable to assign rescue team.");
    } finally {
      setAssigning(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const response = await fetch(
        `${API_BASE}/reports/admin/${id}/status`,
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
        throw new Error(
          data.message || "Unable to update report status."
        );
      }

      setReport(data.report);
    } catch (err) {
      alert(err.message || "Unable to update status.");
    }
  };

  const availableTeams = teams.filter(
    (team) =>
      team.status === "Active" &&
      team.availability === "Available"
  );

  if (loading) {
    return (
      <div className="admin-page-shell">
        <div className="admin-empty-large">
          Loading disaster report...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="admin-page-shell">
        <div className="admin-error">
          {error || "Disaster report not found."}
        </div>

        <Link to="/admin/reports" className="admin-page-back">
          ← Back to Reports
        </Link>
      </div>
    );
  }

  const assignedTeam = report.assigned_team;

  return (
    <div className="admin-page-shell">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            INCIDENT MANAGEMENT
          </span>

          <h1>Disaster Report Details</h1>

          <p>
            Review incident information and coordinate rescue
            team response.
          </p>
        </div>

        <Link
          to="/admin/reports"
          className="admin-page-back"
        >
          ← Back to Reports
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* INCIDENT INFORMATION */}
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div>
            <span>INCIDENT INFORMATION</span>
            <h2>{report.disaster_type}</h2>
          </div>

          <span
            className={`admin-priority ${(
              report.priority_level ||
              report.severity ||
              "Low"
            ).toLowerCase()}`}
          >
            {report.priority_level || report.severity}
          </span>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>Citizen Name</label>
            <p>{report.citizen_id?.full_name || "Citizen"}</p>
          </div>

          <div className="admin-form-group">
            <label>Contact</label>
            <p>{report.citizen_id?.mobile || "Not available"}</p>
          </div>

          <div className="admin-form-group">
            <label>Disaster Type</label>
            <p>{report.disaster_type}</p>
          </div>

          <div className="admin-form-group">
            <label>Severity</label>
            <p>{report.severity}</p>
          </div>

          <div className="admin-form-group">
            <label>Location</label>
            <p>{report.location}</p>
          </div>

          <div className="admin-form-group">
            <label>City / State</label>
            <p>
              {report.city || "N/A"}, {report.state || "N/A"}
            </p>
          </div>

          <div className="admin-form-group">
            <label>Affected People</label>
            <p>{report.affected_people || 0}</p>
          </div>

          <div className="admin-form-group">
            <label>Injured People</label>
            <p>{report.injured_people || 0}</p>
          </div>

          <div className="admin-form-group">
            <label>Missing People</label>
            <p>{report.missing_people || 0}</p>
          </div>

          <div className="admin-form-group">
            <label>Priority Score</label>
            <p>{report.priority_score ?? "Not available"}</p>
          </div>

          <div className="admin-form-group admin-form-full">
            <label>Description</label>
            <p>
              {report.description || "No description provided."}
            </p>
          </div>

          <div className="admin-form-group admin-form-full">
            <label>AI Recommendation</label>
            <p>
              {report.ai_recommendation ||
                "No recommendation available."}
            </p>
          </div>
        </div>
      </section>

      {/* HAZARD AND RELOCATION INTELLIGENCE */}
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div>
            <span>HAZARD INTELLIGENCE</span>
            <h2>Relocation Assessment</h2>
          </div>
        </div>

        {relocationAssessment ? (
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Habitation</label>
              <p>
                {relocationAssessment.habitation_name || "N/A"}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Risk Level</label>
              <p>
                {relocationAssessment.risk_level || "Not assessed"}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Risk Score</label>
              <p>
                {relocationAssessment.risk_score ?? "N/A"}/100
              </p>
            </div>

            <div className="admin-form-group">
              <label>Relocation Priority</label>
              <p>
                {relocationAssessment.relocation_priority ||
                  "Not assessed"}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Vulnerable People</label>
              <p>
                {relocationAssessment.vulnerable_people ?? "N/A"}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Total Population</label>
              <p>
                {relocationAssessment.total_population ?? "N/A"}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Immediate Relocation</label>
              <p>
                {relocationAssessment.immediate_relocation_required
                  ? "Assessment flag: Yes"
                  : "Assessment flag: No"}
              </p>
            </div>

            <div className="admin-form-group admin-form-full">
              <label>Recommended Action</label>
              <p>
                {relocationAssessment.relocation_recommendation ||
                  "Field assessment required."}
              </p>
            </div>
          </div>
        ) : (
          <p>
            No relocation assessment loaded. The backend must
            return relocation_assessment for this report or
            after rescue-team assignment.
          </p>
        )}
      </section>

      {/* SHELTER CAPACITY */}
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div>
            <span>RELOCATION PLANNING</span>
            <h2>Shelter Capacity Assessment</h2>
          </div>
        </div>

        {shelterAssessment ? (
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Open Shelters</label>
              <p>
                {shelterAssessment.open_shelter_count ?? 0}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Available Capacity</label>
              <p>
                {shelterAssessment.total_available_capacity ?? 0}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Estimated Relocation Population</label>
              <p>
                {shelterAssessment.relocation_population_estimate ?? 0}
              </p>
            </div>

            <div className="admin-form-group">
              <label>Estimated Capacity Gap</label>
              <p>
                {shelterAssessment.estimated_capacity_gap ?? 0}
              </p>
            </div>

            <div className="admin-form-group admin-form-full">
              <label>Planning Note</label>
              <p>
                {(shelterAssessment.estimated_capacity_gap ?? 0) > 0
                  ? "Estimated shelter capacity is insufficient. Additional verified shelter capacity may be required."
                  : "No capacity shortage is indicated by this estimate. Confirm actual occupancy and suitability before relocation."}
              </p>
            </div>
          </div>
        ) : (
          <p>
            Shelter assessment has not been returned by the
            backend. Check the assignment response and API data.
          </p>
        )}
      </section>

      {/* RESCUE TEAM ASSIGNMENT */}
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div>
            <span>RESCUE COORDINATION</span>
            <h2>Assign Rescue Team</h2>
          </div>
        </div>

        {assignedTeam ? (
          <div className="request-assigned-team">
            🚑 {assignedTeam.team_name || "Assigned Team"}

            <small>
              {assignedTeam.team_code || "Team Assigned"}
            </small>
          </div>
        ) : (
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Select Rescue Team</label>

              <select
                className="admin-status-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={
                  teamsLoading ||
                  assigning ||
                  availableTeams.length === 0
                }
              >
                <option value="">
                  {teamsLoading
                    ? "Loading teams..."
                    : availableTeams.length === 0
                    ? "No available teams"
                    : "Select rescue team"}
                </option>

                {availableTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.team_name} — {team.team_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Action</label>

              <button
                type="button"
                className="admin-primary-btn"
                onClick={assignTeam}
                disabled={
                  assigning ||
                  teamsLoading ||
                  !selectedTeam
                }
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Rescue Team"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* INCIDENT STATUS */}
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div>
            <span>INCIDENT STATUS</span>
            <h2>Update Report Status</h2>
          </div>
        </div>

        <div className="admin-form-group">
          <label>Current Status</label>

          <select
            className="admin-status-select"
            value={report.status}
            onChange={(e) => updateStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Response Dispatched">
              Response Dispatched
            </option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </section>
    </div>
  );
}

export default ReportDetails;