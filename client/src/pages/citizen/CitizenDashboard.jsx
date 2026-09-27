import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import ResQAI from "../../components/common/ResQAI";
import Feedback from "./Feedback";



function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [rescueRequests, setRescueRequests] = useState([]);
const [rescueRequestsLoading, setRescueRequestsLoading] = useState(true);
const [resourceRequests, setResourceRequests] = useState([]);
const [resourceRequestsLoading, setResourceRequestsLoading] = useState(true);
const [shelterRequests, setShelterRequests] = useState([]);
const [shelterRequestsLoading, setShelterRequestsLoading] = useState(true);
const [alerts, setAlerts] = useState([]);
const [alertsLoading, setAlertsLoading] = useState(true);
const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem("resq_token");

      if (!token) {
        setReportsLoading(false);
        return;
      }

      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/reports/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setReports(data.reports || []);
    } catch (error) {
      console.error("Dashboard reports error:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchMyRescueRequests = async () => {
    try {
      const token = localStorage.getItem("resq_token");
      if (!token) {
        setRescueRequestsLoading(false);
        return;
      }
      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/rescue-requests/my",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error(data.message);
        return;
      }
      setRescueRequests(Array.isArray(data) ? data : data.requests || []);
    } catch (error) {
      console.error("Dashboard rescue requests error:", error);
    } finally {
      setRescueRequestsLoading(false);
    }
  };
  const fetchMyResourceRequests = async () => {
  try {
    setResourceRequestsLoading(true);

    const token = localStorage.getItem("resq_token");

    if (!token) {
      setResourceRequestsLoading(false);
      return;
    }

    const response = await fetch(
      "https://resq-smart-disaster-management-system.onrender.com/api/resource-requests/my",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setResourceRequests(data.requests || []);
  } catch (error) {
    console.error(
      "Dashboard resource requests error:",
      error
    );
  } finally {
    setResourceRequestsLoading(false);
  }
};
const fetchMyShelterRequests = async () => {
  try {
    setShelterRequestsLoading(true);

    const token = localStorage.getItem("resq_token");

    if (!token) {
      setShelterRequestsLoading(false);
      return;
    }

    const response = await fetch(
      "https://resq-smart-disaster-management-system.onrender.com/api/shelter-requests/my",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setShelterRequests(data.requests || []);
  } catch (error) {
    console.error(
      "Dashboard shelter requests error:",
      error
    );
  } finally {
    setShelterRequestsLoading(false);
  }
};


  const fetchActiveAlerts = async () => {
  try {
    setAlertsLoading(true);

    const token = localStorage.getItem("resq_token");

    if (!token) {
      console.error("Authentication required.");
      return;
    }

    const response = await fetch(
      "https://resq-smart-disaster-management-system.onrender.com/api/alerts",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load alerts."
      );
    }

    const activeAlerts = (data.alerts || []).filter(
      (alert) => alert.status === "Active"
    );

    setAlerts(activeAlerts);

  } catch (error) {
    console.error(
      "Citizen alerts error:",
      error.message
    );

    setAlerts([]);

  } finally {
    setAlertsLoading(false);
  }
};


  fetchMyReports();
  fetchMyRescueRequests();
  fetchMyResourceRequests();
  fetchMyShelterRequests();
  fetchActiveAlerts();
}, []);
  const activeReports = reports.filter(
    (report) =>
      report.status === "Pending" ||
      report.status === "Under Review" ||
      report.status === "Response Dispatched"
  ).length;

  const totalReports = reports.length;

  const resolvedReports = reports.filter(
    (report) => report.status === "Resolved"
  ).length;

  const pendingRescueRequests = rescueRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  
  return (
    <div className="citizen-dashboard">

      {/* TOP NAVBAR */}
      <header className="citizen-topbar">

        <Link to="/" className="citizen-brand">
          <div className="citizen-brand-logo">R</div>

          <div>
            <strong>RESQ</strong>
            <span>CITIZEN PORTAL</span>
          </div>
        </Link>

        <div className="citizen-nav">

          <Link className="active" to="/citizen-dashboard">
            Dashboard
          </Link>

          <Link to="/report">
            Report Disaster
          </Link>

          <Link to="/rescue-request">
            Rescue Request
          </Link>
          <div className="notification-wrapper">
  <button
    type="button"
    className="notification-bell"
    onClick={() => setShowNotifications(!showNotifications)}
    aria-label="Emergency Notifications"
  >
    🔔

    {alerts.length > 0 && (
      <span className="notification-count">
        {alerts.length}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="notification-dropdown">
      <div className="notification-header">
        <div>
          <span>PUBLIC SAFETY</span>
          <strong>Emergency Alerts</strong>
        </div>

        <b>{alerts.length}</b>
      </div>

      {alerts.length === 0 ? (
        <div className="notification-empty">
          <span>✓</span>
          <p>No active emergency alerts</p>
        </div>
      ) : (
        <div className="notification-list">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert._id}
              className={`notification-item notification-${(
                alert.severity || "medium"
              ).toLowerCase()}`}
            >
              <div className="notification-item-top">
                <strong>{alert.title}</strong>

                <span>{alert.severity}</span>
              </div>

              <p>{alert.message}</p>

              <small>
                📍 {alert.city || alert.location || "Emergency Area"}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

          <div className="citizen-profile">
            <div className="profile-avatar">
              {(user?.full_name || "C").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.full_name || "Citizen"}</strong>
              <small>{user?.email || "Citizen Account"}</small>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>

        </div>
      </header>


      {/* MAIN */}
      <main className="citizen-content">
        <ResQAI />

        {/* PAGE HEADER */}
        <section className="citizen-page-header">

          <div>
            <span className="dashboard-eyebrow">
              RESQ / CITIZEN COMMAND CENTER
            </span>

            <h1>
              Emergency <span>Dashboard</span>
            </h1>

            <p>
              Monitor your emergency reports, rescue requests and response
              activity from one place.
            </p>
          </div>

          <div className="live-system">
            <span className="live-dot"></span>
            SYSTEM OPERATIONAL
          </div>

        </section>


        {/* STAT CARDS */}
        {/* STAT CARDS */}
<section className="citizen-stats">

  <div className="citizen-stat-card">
    <div className="stat-icon red">🚨</div>

    <div>
      <span>ACTIVE REPORTS</span>
      <strong>{String(activeReports).padStart(2, "0")}</strong>
      <small>Currently under response</small>
    </div>
  </div>


  <div className="citizen-stat-card">
    <div className="stat-icon orange">🆘</div>

    <div>
      <span>RESCUE REQUESTS</span>
      <strong>{String(pendingRescueRequests).padStart(2, "0")}</strong>
      <small>Awaiting response</small>
    </div>
  </div>


  <div className="citizen-stat-card">
    <div className="stat-icon blue">📋</div>

    <div>
      <span>TOTAL REPORTS</span>
      <strong>{String(totalReports).padStart(2, "0")}</strong>
      <small>Submitted through RESQ</small>
    </div>
  </div>


  <div className="citizen-stat-card">
    <div className="stat-icon green">✓</div>

    <div>
      <span>RESOLVED</span>
      <strong>{String(resolvedReports).padStart(2, "0")}</strong>
      <small>Successfully closed</small>
    </div>
  </div>

</section>


        {/* QUICK ACTIONS */}
        <section className="citizen-quick-section">

          <div className="section-heading">
            <div>
              <span>EMERGENCY ACTIONS</span>
              <h2>Quick Response</h2>
            </div>
          </div>


          <div className="citizen-action-grid">

            <Link to="/report" className="citizen-action emergency-action">

              <div className="action-symbol">🚨</div>

              <div>
                <span>EMERGENCY</span>
                <h3>Report a Disaster</h3>
                <p>
                  Submit a new disaster incident with location and affected
                  people details.
                </p>
              </div>

              <b>→</b>

            </Link>


            <Link
              to="/rescue-request"
              className="citizen-action rescue-action"
            >

              <div className="action-symbol">🆘</div>

              <div>
                <span>IMMEDIATE ASSISTANCE</span>
                <h3>Request Rescue</h3>
                <p>
                  Request emergency assistance from the coordinated rescue
                  response team.
                </p>
              </div>


              <b>→</b>

            </Link>
            <Link
  to="/resource-request"
  className="citizen-action resource-action"
>
  <div className="action-symbol">📦</div>

  <div>
    <span>EMERGENCY RESOURCES</span>
    <h3>Request a Resource</h3>
    <p>
      Request ambulance, medical supplies,
      food, water or other available emergency resources.
    </p>
  </div>

  <b>→</b>
</Link>
{/* REQUEST SHELTER */}
<Link
  to="/citizen/shelter-request"
  className="citizen-action shelter-action"
>
  <div className="action-symbol">🏠</div>

  <div>
    <span>EMERGENCY ACCOMMODATION</span>
    <h3>Request Shelter</h3>
    <p>
      Find available emergency shelters and request safe accommodation.
    </p>
  </div>

  <b>→</b>
</Link>

          </div>

        </section>
        

        {/* CITIZEN FEEDBACK */}
        <section className="citizen-resource-section">
          <div className="citizen-panel resource-requests-panel">
            <div className="panel-header">
              <div>
                <span>RESCUE EXPERIENCE</span>
                <h2>Share Your Feedback</h2>
              </div>
            </div>

            {rescueRequestsLoading ? (
              <div className="citizen-alert-empty">
                Loading your rescue requests...
              </div>
            ) : rescueRequests.length === 0 ? (
              <div className="citizen-alert-empty">
                <div className="alert-empty-icon">💬</div>
                <div>
                  <strong>No rescue requests found</strong>
                  <small>
                    Your feedback form will appear after a rescue request.
                  </small>
                </div>
              </div>
            ) : (
              rescueRequests.map((request) => (
                <div
                  className="resource-request-card"
                  key={request._id}
                >
                  <div className="resource-request-icon">
                    🆘
                  </div>

                  <div className="resource-request-info">
                    <h3>Rescue Request</h3>

                    <p>
                      Status: <strong>{request.status}</strong>
                    </p>

                    <small>
                      Request ID: {request._id}
                    </small>

                    {request.status === "Resolved" && (
                      <Feedback
                        citizenId={user?._id || user?.id}
                        rescueRequestId={request._id}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="citizen-main-grid">

          {/* RECENT REPORTS */}
          <div className="citizen-panel reports-panel">

            <div className="panel-header">

              <div>
                <span>INCIDENT ACTIVITY</span>
                <h2>Recent Reports</h2>
              </div>

              <Link to="/report">
                + New Report
              </Link>

            </div>


            
          <div className="report-list">

  {reportsLoading ? (
    <div className="report-empty">
      Loading your reports...
    </div>
  ) : reports.length === 0 ? (
    <div className="report-empty">
      No disaster reports submitted yet.
    </div>
  ) : (
    reports.map((report) => (
      <div
        className="citizen-report-row"
        key={report._id}
      >

        <div className="report-type-icon">
          {report.disaster_type === "Flood" && "🌊"}
          {report.disaster_type === "Fire" && "🔥"}
          {report.disaster_type === "Road Accident" && "🚗"}
          {!["Flood", "Fire", "Road Accident"].includes(
            report.disaster_type
          ) && "🚨"}
        </div>

        <div className="report-info">
          <strong>{report.disaster_type}</strong>

          <span>
            📍 {report.location}, {report.city}
          </span>

          <small>
            {report.createdAt
              ? new Date(report.createdAt).toLocaleDateString()
              : "Date unavailable"}
          </small>
        </div>

        <div className="report-meta">

          <span
            className={`severity-badge ${
              (
                report.priority_level ||
                report.severity ||
                "low"
              ).toLowerCase()
            }`}
          >
            {report.priority_level || report.severity}
          </span>

          <small>
            {report.status}
          </small>

        </div>

      </div>
    ))
  )}

</div>
</div>

</section>
          
{/* EMERGENCY STATUS */}
<div className="citizen-panel status-panel">

  <div className="panel-header">
    <div>
      <span>RESPONSE MONITOR</span>
      <h2>Emergency Status</h2>
    </div>

    <span className="status-live">LIVE</span>
  </div>

  {rescueRequestsLoading ? (

    <div className="report-empty">
      Loading rescue status...
    </div>

  ) : rescueRequests.length === 0 ? (

    <div className="report-empty">
      No rescue request submitted yet.
    </div>

  ) : (

    (() => {
      const latestRequest = rescueRequests[0];
      const status = latestRequest.status;
      const teamAssigned = !!latestRequest.assigned_team_id;

      const submittedCompleted =
        ["Pending", "Responding", "Resolved"].includes(status);

      const teamAssignedCompleted =
        teamAssigned &&
        ["Responding", "Resolved"].includes(status);

      const rescueInProgress =
        status === "Responding";

      const rescueCompleted =
        status === "Resolved";

      return (
        <div className="response-timeline">

          {/* STEP 1 */}
          <div
            className={`timeline-item ${
              submittedCompleted ? "completed" : ""
            }`}
          >
            <div className="timeline-dot">
              {submittedCompleted ? "✓" : "1"}
            </div>

            <div>
              <strong>Request Submitted</strong>

              <small>
                Your emergency rescue request has been received.
              </small>
            </div>
          </div>


          {/* STEP 2 */}
          <div
            className={`timeline-item ${
              teamAssignedCompleted
                ? "completed"
                : teamAssigned
                ? "current"
                : ""
            }`}
          >
            <div className="timeline-dot">
              {teamAssignedCompleted
                ? "✓"
                : teamAssigned
                ? "●"
                : "2"}
            </div>

            <div>
              <strong>Rescue Team Assigned</strong>

              <small>
                {teamAssigned
                  ? `Team ${
                      latestRequest.assigned_team_id?.team_name ||
                      "Rescue Team"
                    } has been assigned.`
                  : "Waiting for rescue team assignment."}
              </small>
            </div>
          </div>


          {/* STEP 3 */}
          <div
            className={`timeline-item ${
              rescueInProgress
                ? "current"
                : rescueCompleted
                ? "completed"
                : ""
            }`}
          >
            <div className="timeline-dot">
              {rescueCompleted
                ? "✓"
                : rescueInProgress
                ? "●"
                : "3"}
            </div>

            <div>
              <strong>Rescue In Progress</strong>

              <small>
                {rescueInProgress
                  ? "Rescue team is responding to your emergency."
                  : rescueCompleted
                  ? "Rescue response has been completed."
                  : "Rescue operation will begin after team response."}
              </small>
            </div>
          </div>


          {/* STEP 4 */}
          <div
            className={`timeline-item ${
              rescueCompleted ? "completed" : ""
            }`}
          >
            <div className="timeline-dot">
              {rescueCompleted ? "✓" : "4"}
            </div>

            <div>
              <strong>Rescue Completed</strong>

              <small>
                {rescueCompleted
                  ? "Your rescue request has been marked as resolved."
                  : "Request will be closed after rescue is completed."}
              </small>
            </div>
          </div>


          {/* CURRENT STATUS */}
          <div className="timeline-status-summary">
            <strong>Current Status:</strong>{" "}
            <span>{status}</span>
          </div>


          {/* ASSIGNED RESCUE TEAM */}
          {teamAssigned && latestRequest.assigned_team_id && (

            <div className="assigned-team-card">

              <div className="assigned-team-header">

                <div>
                  <span className="assigned-team-label">
                    🚑 ASSIGNED RESCUE TEAM
                  </span>

                  <h3>
                    {latestRequest.assigned_team_id.team_name ||
                      "Rescue Team"}
                  </h3>
                </div>

                <span
                  className={`team-availability ${
                    latestRequest.assigned_team_id.availability ===
                    "Available"
                      ? "available"
                      : "busy"
                  }`}
                >
                  ●{" "}
                  {latestRequest.assigned_team_id.availability ||
                    "Assigned"}
                </span>

              </div>


              <div className="assigned-team-details">

                <div className="team-detail-item">
                  <span className="detail-icon">🔖</span>

                  <div>
                    <small>Team Code</small>

                    <strong>
                      {latestRequest.assigned_team_id.team_code ||
                        "Not available"}
                    </strong>
                  </div>
                </div>


                <div className="team-detail-item">
                  <span className="detail-icon">👤</span>

                  <div>
                    <small>Team Leader</small>

                    <strong>
                      {latestRequest.assigned_team_id.leader_name ||
                        "Team Leader"}
                    </strong>
                  </div>
                </div>


                <div className="team-detail-item">
                  <span className="detail-icon">📞</span>

                  <div>
                    <small>Contact</small>

                    <strong>
                      {latestRequest.assigned_team_id.contact ||
                        latestRequest.assigned_team_id.contact_number ||
                        "Contact unavailable"}
                    </strong>
                  </div>
                </div>


                <div className="team-detail-item">
                  <span className="detail-icon">🛠️</span>

                  <div>
                    <small>Specialization</small>

                    <strong>
                      {latestRequest.assigned_team_id.specialization ||
                        "Emergency Response"}
                    </strong>
                  </div>
                </div>

              </div>


              <div className="team-response-footer">

                <span>
                  📍{" "}
                  {latestRequest.assigned_team_id.location ||
                    latestRequest.assigned_team_id.city ||
                    "Emergency response location"}
                </span>

                <span>
                  Status: <strong>{status}</strong>
                </span>

              </div>

            </div>

          )}

        </div>
      );

    })()

  )}

</div>

{/* MY RESOURCE REQUESTS */}

        {/* MY RESOURCE REQUESTS */}
<section className="citizen-resource-section">
  <div className="citizen-panel resource-requests-panel">
    <div className="panel-header">
      <div>
        <span>RESOURCE TRACKING</span>
        <h2>My Resource Requests</h2>
      </div>

      <Link to="/resource-request">
        + New Request
      </Link>
    </div>

    {resourceRequestsLoading ? (
      <div className="citizen-alert-empty">
        Loading your resource requests...
      </div>
    ) : resourceRequests.length === 0 ? (
      <div className="citizen-alert-empty">
        <div className="alert-empty-icon">📦</div>
        <div>
          <strong>No resource requests yet</strong>
          <small>
            Your submitted resource requests will appear here.
          </small>
        </div>
      </div>
    ) : (
      <div className="resource-request-list">
        {resourceRequests.map((request) => (
          <div
            className="resource-request-card"
            key={request._id}
          >
            <div className="resource-request-icon">
              📦
            </div>

            <div className="resource-request-info">
              <h3>
                {request.resource_name ||
                  request.resource_id?.resource_name ||
                  "Emergency Resource"}
              </h3>

              <p>
                Quantity: <strong>{request.quantity}</strong>
              </p>

              <small>
                📍 {request.location}, {request.city}
              </small>

              <small>
                Requested on:{" "}
                {request.createdAt
                  ? new Date(
                      request.createdAt
                    ).toLocaleDateString()
                  : "Date unavailable"}
              </small>

              {request.admin_note && (
                <p className="resource-admin-note">
                  <strong>Admin Note:</strong>{" "}
                  {request.admin_note}
                </p>
              )}
            </div>

            <div className="resource-request-status">
              <span
                className={`resource-status-badge ${(
                  request.status || "Pending"
                ).toLowerCase()}`}
              >
                {request.status}
              </span>

              <small>
                {request.urgency} Urgency
              </small>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</section>
{/* MY SHELTER REQUESTS */}
<section className="citizen-resource-section">
  <div className="citizen-panel resource-requests-panel">
    <div className="panel-header">
      <div>
        <span>SHELTER TRACKING</span>
        <h2>My Shelter Requests</h2>
      </div>

      <Link to="/citizen/shelter-request">
        + New Request
      </Link>
    </div>

    {shelterRequestsLoading ? (
      <div className="citizen-alert-empty">
        Loading your shelter requests...
      </div>
    ) : shelterRequests.length === 0 ? (
      <div className="citizen-alert-empty">
        <div className="alert-empty-icon">🏠</div>
        <div>
          <strong>No shelter requests yet</strong>
          <small>
            Your submitted shelter requests will appear here.
          </small>
        </div>
      </div>
    ) : (
      <div className="resource-request-list">
        {shelterRequests.map((request) => (
          <div
            className="resource-request-card"
            key={request._id}
          >
            <div className="resource-request-icon">
              🏠
            </div>

            <div className="resource-request-info">
              <h3>
                {request.shelter_id?.shelter_name ||
                  "Emergency Shelter"}
              </h3>

              <p>
                People: <strong>{request.people_count}</strong>
              </p>

              <small>
                📍{" "}
                {request.shelter_id?.location ||
                  "Location unavailable"}
              </small>

              <small>
                Requested on:{" "}
                {request.createdAt
                  ? new Date(
                      request.createdAt
                    ).toLocaleDateString()
                  : "Date unavailable"}
              </small>

              {request.admin_note && (
                <p className="resource-admin-note">
                  <strong>Admin Note:</strong>{" "}
                  {request.admin_note}
                </p>
              )}
            </div>

            <div className="resource-request-status">
              <span
                className={`resource-status-badge ${(
                  request.status || "Pending"
                ).toLowerCase().replace(/\s+/g, "-")}`}
              >
                {request.status}
              </span>

              <small>
                {request.emergency_reason}
              </small>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</section>
        {/* EMERGENCY ALERTS */}
<section className="citizen-alerts-section">

  <div className="citizen-panel alerts-panel">

    <div className="panel-header">
      <div>
        <span>PUBLIC SAFETY NETWORK</span>
        <h2>Emergency Alerts</h2>
      </div>

      <div className="alerts-live-indicator">
        <span></span>
        LIVE
      </div>
    </div>

    {alertsLoading ? (
      <div className="citizen-alert-empty">
        Loading emergency alerts...
      </div>
    ) : alerts.length === 0 ? (
      <div className="citizen-alert-empty">
        <div className="alert-empty-icon">✓</div>

        <div>
          <strong>No active emergency alerts</strong>
          <small>
            There are currently no active public safety
            alerts in your area.
          </small>
        </div>
      </div>
    ) : (
      <div className="citizen-alert-list">

        {alerts.map((alert) => (

          <div
            key={alert._id}
            className={`citizen-alert-card alert-${(
              alert.severity || "medium"
            ).toLowerCase()}`}
          >

            <div className="citizen-alert-icon">
              {alert.severity === "Critical"
                ? "🚨"
                : alert.severity === "High"
                ? "⚠️"
                : "🔔"}
            </div>

            <div className="citizen-alert-content">

              <div className="citizen-alert-top">

                <div>
                  <span className="citizen-alert-type">
                    {alert.alert_type || "EMERGENCY ALERT"}
                  </span>

                  <h3>
                    {alert.title}
                  </h3>
                </div>

                <span className="citizen-alert-severity">
                  {alert.severity}
                </span>

              </div>

              <p>
                {alert.message}
              </p>

              <div className="citizen-alert-meta">

                <span>
                  📍 {alert.location}
                  {alert.city
                    ? `, ${alert.city}`
                    : ""}
                </span>

                <span>
                  {alert.issued_by ||
                    "RESQ Command Center"}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>
    )}

  </div>

</section>


        {/* SAFETY + LOCATION */}
        <section className="citizen-bottom-grid">

          <div className="citizen-panel safety-card">

            <div className="panel-header">
              <div>
                <span>SAFETY CENTER</span>
                <h2>Emergency Guidelines</h2>
              </div>

              <span className="panel-icon">🛡️</span>
            </div>

            <div className="safety-items">
              <div>
                <b>01</b>
                <span>Move to a safe location and remain calm.</span>
              </div>

              <div>
                <b>02</b>
                <span>Provide accurate location information.</span>
              </div>

              <div>
                <b>03</b>
                <span>Follow instructions from response authorities.</span>
              </div>

              <div>
                <b>04</b>
                <span>Keep your phone available for emergency updates.</span>
              </div>
            </div>

          </div>


          <div className="citizen-panel profile-card">

            <div className="panel-header">
              <div>
                <span>MY RESQ PROFILE</span>
                <h2>Account Information</h2>
              </div>
            </div>

            <div className="profile-details">

              <div>
                <span>FULL NAME</span>
                <strong>{user?.full_name || "Citizen"}</strong>
              </div>

              <div>
                <span>EMAIL</span>
                <strong>{user?.email || "Not available"}</strong>
              </div>

              <div>
                <span>LOCATION</span>
                <strong>{user?.location || "Not available"}</strong>
              </div>

              <div>
                <span>ACCOUNT STATUS</span>
                <strong className="account-active">
                  ● ACTIVE
                </strong>
              </div>

            </div>

          </div>

        </section>

      </main>


      <footer className="citizen-footer">
        <span>© 2026 RESQ • Smart Disaster Management System</span>
        <span>Emergency Response & Decision Intelligence Platform</span>
      </footer>

    </div>
  );
}

export default CitizenDashboard;