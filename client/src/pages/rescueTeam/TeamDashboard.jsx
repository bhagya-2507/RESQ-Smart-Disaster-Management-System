import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function TeamDashboard() {
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [requests, setRequests] = useState([]);
  const [team, setTeam] = useState(user?.team || null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const token = localStorage.getItem("resq_token");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/rescue-teams/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load rescue team dashboard."
        );
      }

      setTeam(data.team || user?.team || null);
      setReports(data.reports || []);
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Team dashboard error:", err);
      setError(
        err.message ||
          "Unable to connect to RESQ server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateReportStatus = async (
    reportId,
    status
  ) => {
    try {
      setUpdating(reportId);

      const response = await fetch(
        `https://resq-smart-disaster-management-system.onrender.com/api/rescue-teams/reports/${reportId}/status`,
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
          data.message ||
            "Unable to update incident status."
        );
      }

      setReports((current) =>
        current.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: data.report.status,
              }
            : report
        )
      );

      if (status === "Resolved") {
        setTeam((current) =>
          current
            ? {
                ...current,
                availability: "Available",
              }
            : current
        );
      }
    } catch (err) {
      alert(
        err.message ||
          "Unable to update incident status."
      );
    } finally {
      setUpdating(null);
    }
  };

  const updateRequestStatus = async (
    requestId,
    status
  ) => {
    try {
      setUpdating(requestId);

      const response = await fetch(
        `https://resq-smart-disaster-management-system.onrender.com/api/rescue-teams/requests/${requestId}/status`,
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
          data.message ||
            "Unable to update rescue request."
        );
      }

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status: data.request.status,
              }
            : request
        )
      );

      if (status === "Resolved") {
        setTeam((current) =>
          current
            ? {
                ...current,
                availability: "Available",
              }
            : current
        );
      }
    } catch (err) {
      alert(
        err.message ||
          "Unable to update rescue request."
      );
    } finally {
      setUpdating(null);
    }
  };

  const activeReports = reports.filter(
    (report) =>
      report.status !== "Resolved" &&
      report.status !== "Rejected"
  ).length;

  const activeRequests = requests.filter(
    (request) =>
      request.status !== "Resolved"
  ).length;

  const resolvedCases =
    reports.filter(
      (report) => report.status === "Resolved"
    ).length +
    requests.filter(
      (request) => request.status === "Resolved"
    ).length;

  if (loading) {
    return (
      <div className="team-dashboard-page">
        <div className="team-loading">
          Loading rescue operations...
        </div>
      </div>
    );
  }

  return (
    <div className="team-dashboard-page">

      {/* SIDEBAR */}
      <aside className="team-sidebar">

        <div className="team-brand">
          <div className="team-brand-logo">
            R
          </div>

          <div>
            <strong>RESQ</strong>
            <span>
              COMMAND CENTER
            </span>
          </div>
        </div>

        <div className="team-sidebar-profile">

          <div className="team-avatar">
            🚑
          </div>

          <div>
            <strong>
              {team?.team_name ||
                user?.team_name ||
                "Rescue Team"}
            </strong>

            <span>
              {team?.team_code ||
                "RESPONSE UNIT"}
            </span>
          </div>

        </div>

        <nav className="team-navigation">

          <a
            href="#overview"
            className="team-nav-link active"
          >
            ▣ Dashboard
          </a>

          <a
            href="#incidents"
            className="team-nav-link"
          >
            ⚠ Assigned Incidents
          </a>

          <a
            href="#requests"
            className="team-nav-link"
          >
            🆘 Rescue Requests
          </a>

        </nav>

        <button
          className="team-logout"
          onClick={logout}
        >
          ↪ Logout
        </button>

      </aside>

      {/* MAIN */}
      <main className="team-main">

        {/* TOPBAR */}
        <header className="team-topbar">

          <div>
            <span className="team-eyebrow">
              RESCUE OPERATIONS
            </span>

            <h1>
              Rescue Team Dashboard
            </h1>

            <p>
              Monitor assigned emergencies and
              coordinate field response.
            </p>
          </div>

          <div className="team-live-status">

            <span className="team-status-dot"></span>

            <div>
              <small>TEAM STATUS</small>

              <strong>
                {team?.availability ||
                  "Available"}
              </strong>
            </div>

          </div>

        </header>

        {error && (
          <div className="team-error">
            {error}
          </div>
        )}

        {/* TEAM PROFILE */}
        <section
          id="overview"
          className="team-profile-card"
        >

          <div className="team-profile-main">

            <div className="team-large-icon">
              🚑
            </div>

            <div>
              <span className="team-section-label">
                RESPONSE UNIT
              </span>

              <h2>
                {team?.team_name ||
                  user?.team_name ||
                  "Rescue Team"}
              </h2>

              <p>
                {team?.specialization ||
                  "Emergency Response"}
              </p>
            </div>

          </div>

          <div className="team-profile-details">

            <div>
              <span>TEAM CODE</span>
              <strong>
                {team?.team_code || "—"}
              </strong>
            </div>

            <div>
              <span>LEADER</span>
              <strong>
                {team?.leader_name || "—"}
              </strong>
            </div>

            <div>
              <span>MEMBERS</span>
              <strong>
                {team?.members_count || 0}
              </strong>
            </div>

            <div>
              <span>CONTACT</span>
              <strong>
                {team?.contact || "—"}
              </strong>
            </div>

          </div>

        </section>

        {/* STATS */}
        <section className="team-stats">

          <div className="team-stat-card">
            <span>ACTIVE INCIDENTS</span>
            <strong>
              {String(activeReports).padStart(
                2,
                "0"
              )}
            </strong>
          </div>

          <div className="team-stat-card">
            <span>ACTIVE RESCUES</span>
            <strong>
              {String(activeRequests).padStart(
                2,
                "0"
              )}
            </strong>
          </div>

          <div className="team-stat-card">
            <span>TOTAL ASSIGNMENTS</span>
            <strong>
              {String(
                reports.length +
                  requests.length
              ).padStart(2, "0")}
            </strong>
          </div>

          <div className="team-stat-card">
            <span>RESOLVED CASES</span>
            <strong>
              {String(resolvedCases).padStart(
                2,
                "0"
              )}
            </strong>
          </div>

        </section>

        {/* ASSIGNED INCIDENTS */}
        <section
          id="incidents"
          className="team-operation-section"
        >

          <div className="team-section-heading">
            <div>
              <span className="team-section-label">
                FIELD OPERATIONS
              </span>

              <h2>
                Assigned Disaster Incidents
              </h2>
            </div>

            <span className="team-count-badge">
              {reports.length} Assigned
            </span>
          </div>

          {reports.length === 0 ? (

            <div className="team-empty">
              <div>✓</div>
              <h3>No assigned incidents</h3>
              <p>
                New disaster assignments will
                appear here.
              </p>
            </div>

          ) : (

            <div className="team-operation-grid">

              {reports.map((report) => (

                <article
                  className="team-operation-card"
                  key={report._id}
                >

                  <div className="team-operation-top">

                    <div>
                      <span className="team-operation-type">
                        DISASTER INCIDENT
                      </span>

                      <h3>
                        {report.disaster_type}
                      </h3>
                    </div>

                    <span
                      className={`team-priority ${
                        String(
                          report.priority_level ||
                            report.severity ||
                            "High"
                        ).toLowerCase()
                      }`}
                    >
                      {report.priority_level ||
                        report.severity ||
                        "High"}
                    </span>

                  </div>

                  <div className="team-operation-info">

                    <div>
                      <span>LOCATION</span>
                      <strong>
                        📍 {report.location}
                      </strong>
                    </div>

                    <div>
                      <span>IMPACT</span>
                      <strong>
                        {report.affected_people ||
                          0}{" "}
                        affected
                      </strong>
                    </div>

                    <div>
                      <span>STATUS</span>
                      <strong>
                        {report.status}
                      </strong>
                    </div>

                  </div>

                  <p className="team-operation-description">
                    {report.description ||
                      "No additional incident description."}
                  </p>

                  <div className="team-operation-actions">

                    <select
                      value={report.status}
                      disabled={
                        updating === report._id
                      }
                      onChange={(e) =>
                        updateReportStatus(
                          report._id,
                          e.target.value
                        )
                      }
                    >

                      <option value="Response Dispatched">
                        Response Dispatched
                      </option>

                      <option value="Responding">
                        Responding
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>

                    </select>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* RESCUE REQUESTS */}
        <section
          id="requests"
          className="team-operation-section"
        >

          <div className="team-section-heading">

            <div>
              <span className="team-section-label">
                EMERGENCY ASSISTANCE
              </span>

              <h2>
                Assigned Rescue Requests
              </h2>
            </div>

            <span className="team-count-badge">
              {requests.length} Assigned
            </span>

          </div>

          {requests.length === 0 ? (

            <div className="team-empty">
              <div>✓</div>

              <h3>
                No assigned rescue requests
              </h3>

              <p>
                SOS requests assigned to this
                team will appear here.
              </p>
            </div>

          ) : (

            <div className="team-operation-grid">

              {requests.map((request) => (

                <article
                  className="team-operation-card rescue-request-card"
                  key={request._id}
                >

                  <div className="team-operation-top">

                    <div>
                      <span className="team-operation-type">
                        SOS REQUEST
                      </span>

                      <h3>
                        {request.disaster_type}
                      </h3>
                    </div>

                    <span className="team-sos-badge">
                      🆘 EMERGENCY
                    </span>

                  </div>

                  <div className="team-operation-info">

                    <div>
                      <span>LOCATION</span>

                      <strong>
                        📍 {request.location}
                      </strong>
                    </div>

                    <div>
                      <span>PEOPLE</span>

                      <strong>
                        {request.people_count ||
                          0}
                      </strong>
                    </div>

                    <div>
                      <span>SEVERITY</span>

                      <strong>
                        {request.severity ||
                          "High"}
                      </strong>
                    </div>

                  </div>

                  <p className="team-operation-description">
                    {request.description ||
                      "Emergency rescue assistance requested."}
                  </p>

                  <div className="team-operation-actions">

                    <select
                      value={request.status}
                      disabled={
                        updating ===
                        request._id
                      }
                      onChange={(e) =>
                        updateRequestStatus(
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

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default TeamDashboard;