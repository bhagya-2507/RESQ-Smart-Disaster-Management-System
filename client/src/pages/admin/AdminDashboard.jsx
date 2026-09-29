import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import AdminIncidentMap from "../../components/dashboard/AdminIncidentMap";


function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [rescueRequests, setRescueRequests] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Feedback analytics
const [feedbackAnalytics, setFeedbackAnalytics] = useState({
  totalFeedback: 0,
  averageRating: 0,
  ratingDistribution: {
    oneStar: 0,
    twoStar: 0,
    threeStar: 0,
    fourStar: 0,
    fiveStar: 0,
  },
});
const [feedbackItems, setFeedbackItems] = useState([]);
const [feedbackLoading, setFeedbackLoading] = useState(true);


const token = localStorage.getItem("resq_token");

// Fetch main dashboard data
useEffect(() => {
  const fetchDashboardData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load admin dashboard data."
        );
      }

      setReports(data.reports || []);
      setRescueRequests(data.rescueRequests || []);
      setCitizens(data.citizens || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setError("Unable to connect to RESQ server.");
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [token]);

// Fetch feedback analytics
useEffect(() => {
  const fetchFeedbackAnalytics = async () => {
    try {
      setFeedbackLoading(true);

      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/feedback/admin/all"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load feedback analytics."
        );
      }

      setFeedbackAnalytics(
        data.analytics || {
          totalFeedback: 0,
          averageRating: 0,
          ratingDistribution: {
            oneStar: 0,
            twoStar: 0,
            threeStar: 0,
            fourStar: 0,
            fiveStar: 0,
          },
        }
      );
      setFeedbackItems(data.feedback || []);
    } catch (error) {
      console.error("Feedback analytics error:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  fetchFeedbackAnalytics();
}, []);
const fetchShelterRequests = async () => {
  try {
    setShelterRequestsLoading(true);

    if (!token) {
      setShelterRequestsLoading(false);
      return;
    }

    const response = await fetch(
      "https://resq-smart-disaster-management-system.onrender.com/api/shelter-requests/admin",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load shelter requests."
      );
    }

    setShelterRequests(data.requests || []);
  } catch (error) {
    console.error("Admin shelter requests error:", error);
  } finally {
    setShelterRequestsLoading(false);
  }
};

const updateShelterRequestStatus = async (requestId, status) => {
  try {
    const response = await fetch(
      `https://resq-smart-disaster-management-system.onrender.com/api/shelter-requests/admin/${requestId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          admin_note:
            status === "Approved"
              ? "Your shelter request has been approved."
              : "Your shelter request has been rejected.",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update request status."
      );
    }

    alert(`Request ${status} successfully.`);

    fetchShelterRequests();
  } catch (error) {
    console.error("Shelter status update error:", error);
    alert(error.message);
  }
};
  const activeReports = reports.filter(
    (report) =>
      report.status === "Pending" ||
      report.status === "Under Review" ||
      report.status === "Response Dispatched"
  ).length;

  const criticalReports = reports.filter(
    (report) => report.priority_level === "CRITICAL"
  ).length;

  const pendingRequests = rescueRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const resolvedCases =
  reports.filter(
    (report) => report.status === "Resolved"
  ).length +
  rescueRequests.filter(
    (request) => request.status === "Resolved"
  ).length;
  
const notificationSource = [
  ...reports
    .filter(
      (report) =>
        report.status !== "Resolved" &&
        report.status !== "Rejected" &&
        (
          report.status === "Pending" ||
          report.priority_level === "CRITICAL"
        )
    )
    .map((report) => ({
      id: `report-${report._id}`,
      icon: "🚨",
      title:
        report.priority_level === "CRITICAL"
          ? "Critical incident detected"
          : "New disaster report pending",
      message: `${report.disaster_type || "Incident"} — ${
        report.city || report.location || "Location unavailable"
      }`,
      type: "REPORT",
      path: `/admin/reports/${report._id}`,
      priority:
        report.priority_level === "CRITICAL" ? "critical" : "high",
      disasterType: report.disaster_type || "Incident",
      city: report.city || "Unknown City",
    })),

  ...rescueRequests
    .filter((request) => request.status === "Pending")
    .map((request) => ({
      id: `request-${request._id}`,
      icon: "🆘",
      title: "New rescue request",
      message: `${request.disaster_type || "Rescue support"} — ${
        request.city || request.location || "Location unavailable"
      }`,
      type: "RESCUE",
      path: "/admin/rescue-requests",
      priority: "high",
      disasterType: request.disaster_type || "Rescue",
      city: request.city || "Unknown City",
    })),
];

// Normalize values and remove duplicate notifications
const uniqueNotifications = new Map();

notificationSource.forEach((notification) => {
  const uniqueKey =
    `${notification.type}-${notification.disasterType}-${notification.city}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  if (!uniqueNotifications.has(uniqueKey)) {
    uniqueNotifications.set(uniqueKey, notification);
  }
});

const notifications = Array.from(uniqueNotifications.values());

const notificationCount = notifications.length;
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleNotificationItemClick = (notification) => {
    setShowNotifications(false);

    if (notification?.path) {
      navigate(notification.path);
    }
  };

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-logo">R</div>

          <div>
            <strong>RESQ</strong>
            <span>COMMAND CENTER</span>
          </div>
        </div>

        <nav className="admin-nav">

          <Link
            to="/admin"
            className="admin-nav-link active"
          >
            <span>▣</span>
            Dashboard
          </Link>

          <Link
            to="/admin/reports"
            className="admin-nav-link"
          >
            <span>⚠</span>
            Disaster Reports
          </Link>

          <Link
            to="/admin/rescue-requests"
            className="admin-nav-link"
          >
            <span>🆘</span>
            Rescue Requests
          </Link>

          <Link
            to="/admin/rescue-teams"
            className="admin-nav-link"
          >
            <span>🚑</span>
            Rescue Teams
          </Link>

          <Link
            to="/admin/resources"
            className="admin-nav-link"
          >
            <span>📦</span>
            Resources
          </Link>
          <Link
  to="/admin/resource-requests"
  className="admin-nav-link"
>
  <span>📦</span>
  Resource Requests
</Link>

          <Link
            to="/admin/shelters"
            className="admin-nav-link"
          >
            <span>🏠</span>
            Shelters
          </Link>
         <Link
  to="/admin/shelter-requests"
  className="admin-nav-link"
>
  <span>🏠</span>
  Shelter Requests
</Link>
          <Link
            to="/admin/alerts"
            className="admin-nav-link"
          >
            <span>🔔</span>
            Alerts
          </Link>

          <Link
            to="/intelligence"
            className="admin-nav-link"
          >
            <span>◈</span>
            Intelligence
          </Link>

         

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="admin-user-mini">
            <div className="admin-avatar">
              {(user?.full_name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.full_name || "Administrator"}
              </strong>

              <small>
                {user?.email || "Admin Account"}
              </small>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="admin-main">

        <header className="admin-topbar">

          <div>
            <span className="admin-eyebrow">
              RESQ / COMMAND CENTER
            </span>

            <h1>Emergency Dashboard</h1>
          </div>

          <div className="admin-topbar-actions">

            <div className="admin-notification-wrapper">

              <button
                type="button"
                className="admin-notification-button"
                onClick={() =>
                  setShowNotifications((prev) => !prev)
                }
                title="Notifications"
              >
                🔔

                {notificationCount > 0 && (
                  <span className="admin-notification-badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="admin-notification-dropdown">

                  <div className="admin-notification-dropdown-header">
                    <div>
                      <span>RESQ ALERT CENTER</span>
                      <strong>Notifications</strong>
                    </div>

                    <span className="admin-notification-dropdown-count">
                      {notificationCount}
                    </span>
                  </div>

                  {notifications.length === 0 ? (

                    <div className="admin-notification-dropdown-empty">
                      <span>✓</span>
                      <div>
                        <strong>All clear</strong>
                        <p>No pending emergency notifications.</p>
                      </div>
                    </div>

                  ) : (

                    <div className="admin-notification-dropdown-list">

                      {notifications.slice(0, 6).map((notification) => (

                        <button
                          type="button"
                          className="admin-notification-dropdown-item"
                          key={notification.id}
                          onClick={() =>
                            handleNotificationItemClick(notification)
                          }
                        >

                          <div className="admin-notification-dropdown-icon">
                            {notification.icon}
                          </div>

                          <div className="admin-notification-dropdown-content">
                            <div className="admin-notification-dropdown-top">
                              <strong>
                                {notification.title}
                              </strong>

                              <span>
                                {notification.type}
                              </span>
                            </div>

                            <p>
                              {notification.message}
                            </p>

                            <small>
                              Review emergency →
                            </small>
                          </div>

                        </button>

                      ))}

                    </div>

                  )}

                </div>
              )}

            </div>

            <div className="admin-system-status">
              <span></span>
              SYSTEM OPERATIONAL
            </div>

            <button
              type="button"
              className="admin-topbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

        </header>


        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* STATS */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <span className="admin-stat-icon red">
              🚨
            </span>

            <div>
              <small>ACTIVE REPORTS</small>
              <strong>
                {String(activeReports).padStart(2, "0")}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <span className="admin-stat-icon orange">
              ⚠
            </span>

            <div>
              <small>CRITICAL INCIDENTS</small>
              <strong>
                {String(criticalReports).padStart(2, "0")}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <span className="admin-stat-icon blue">
              🆘
            </span>

            <div>
              <small>PENDING RESCUES</small>
              <strong>
                {String(pendingRequests).padStart(2, "0")}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <span className="admin-stat-icon green">
              ✓
            </span>

            <div>
              <small>RESOLVED CASES</small>
<strong>
  {String(resolvedCases).padStart(2, "0")}
</strong>
            </div>

<div className="admin-stat-card">
  <span className="admin-stat-icon blue">
    👥
  </span>

  <div>
    <small>REGISTERED CITIZENS</small>
    <strong>
      {String(citizens.length).padStart(2, "0")}
    </strong>
  </div>
</div>


      </div>

        </section>

{/* REGISTERED CITIZENS */}
<section className="admin-panel">
  <div className="admin-panel-header">
    <div>
      <span>CITIZEN MANAGEMENT</span>
      <h2>Registered Citizens</h2>
    </div>

    <span className="admin-notification-count">
      {citizens.length} Citizens
    </span>
  </div>

  <div className="admin-report-list">
    {loading ? (
      <div className="admin-empty">
        Loading registered citizens...
      </div>
    ) : citizens.length === 0 ? (
      <div className="admin-empty">
        No registered citizens found.
      </div>
    ) : (
      citizens.map((citizen) => (
        <div
          className="admin-report-row"
          key={citizen._id}
        >
          <div className="admin-report-icon">
            👤
          </div>

          <div className="admin-report-info">
            <strong>
              {citizen.full_name || "Unknown Citizen"}
            </strong>

            <span>
              ✉️ {citizen.email}
            </span>

            <span>
              📱 {citizen.mobile}
            </span>

            <span>
              📍 {citizen.city}, {citizen.state}
            </span>
          </div>

          <span className="admin-report-status">
            {citizen.status || "Active"}
          </span>
        </div>
      ))
    )}
  </div>
</section>
 {/* =========================================
    FEEDBACK ANALYTICS
========================================= */}

<section className="feedback-analytics-panel">

  {/* HEADER */}
  <div className="feedback-panel-header">

    <div className="feedback-heading">

      <div className="feedback-heading-icon">
        💬
      </div>

      <div>
        <span className="feedback-eyebrow">
          CITIZEN EXPERIENCE
        </span>

        <h2>Feedback Analytics</h2>

        <p>
          Analysis of citizen feedback on rescue operations
          and overall experience
        </p>
      </div>

    </div>

    <span className="feedback-badge">
      ⭐ Citizen Feedback
    </span>

  </div>


  {/* MAIN FEEDBACK CONTENT */}
  <div className="feedback-content-grid">

    {/* =========================================
        LEFT COLUMN
    ========================================= */}

    <div className="feedback-left-column">

      {/* SUMMARY CARDS */}
      <div className="feedback-summary-cards">

        {/* TOTAL FEEDBACK */}
        <div className="feedback-summary-card feedback-blue-card">

          <div className="feedback-card-icon">
            💬
          </div>

          <div>
            <span>TOTAL FEEDBACK</span>

            <strong>
              {feedbackAnalytics.totalFeedback}
            </strong>

            <small>
              Total citizen feedback received
            </small>
          </div>

        </div>


        {/* AVERAGE RATING */}
        <div className="feedback-summary-card feedback-green-card">

          <div className="feedback-card-icon">
            ⭐
          </div>

          <div>
            <span>AVERAGE RATING</span>

            <strong>
              {feedbackAnalytics.averageRating}/5
            </strong>

            <small>
              Overall citizen satisfaction
            </small>
          </div>

        </div>

      </div>


      {/* =========================================
          RATING DISTRIBUTION
      ========================================= */}

      <div className="feedback-distribution-card">

        <h3>Rating Distribution</h3>

        {[
          {
            label: "5 Stars",
            value:
              feedbackAnalytics.ratingDistribution.fiveStar,
          },
          {
            label: "4 Stars",
            value:
              feedbackAnalytics.ratingDistribution.fourStar,
          },
          {
            label: "3 Stars",
            value:
              feedbackAnalytics.ratingDistribution.threeStar,
          },
          {
            label: "2 Stars",
            value:
              feedbackAnalytics.ratingDistribution.twoStar,
          },
          {
            label: "1 Star",
            value:
              feedbackAnalytics.ratingDistribution.oneStar,
          },
        ].map((rating) => {

          const total =
            feedbackAnalytics.totalFeedback || 1;

          const percentage =
            (rating.value / total) * 100;

          return (
            <div
              className="rating-row"
              key={rating.label}
            >

              <span className="rating-label">
                ⭐ {rating.label}
              </span>

              <div className="rating-progress">

                <div
                  className="rating-progress-fill"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

              <span className="rating-count">
                {rating.value}
              </span>

            </div>
          );
        })}

      </div>

    </div>


    {/* =========================================
        RIGHT COLUMN - RECENT FEEDBACK
    ========================================= */}

    <div className="recent-feedback-card">

      {/* HEADER */}
      <div className="recent-feedback-header">

        <h3>
          Recent Feedback
        </h3>

        <span>
          View All
        </span>

      </div>


      {/* FEEDBACK LIST */}

      {feedbackLoading ? (

        <div className="feedback-empty-state">
          Loading feedback...
        </div>

      ) : feedbackItems.length === 0 ? (

        <div className="feedback-empty-state">
          No feedback available
        </div>

      ) : (

        feedbackItems
          .slice(0, 5)
          .map((item) => (

            <div
              className="recent-feedback-item"
              key={item._id}
            >

              {/* =================================
                  CITIZEN AVATAR
              ================================= */}

              <div className="citizen-avatar">

                {(item.citizen_id?.full_name || "C")
                  .charAt(0)
                  .toUpperCase()}

              </div>


              {/* =================================
                  FEEDBACK DETAILS
              ================================= */}

              <div className="recent-feedback-details">


                {/* CITIZEN + DATE */}

                <div className="recent-feedback-top">

                  <div className="feedback-citizen-info">

                    <strong>
                      {item.citizen_id?.full_name ||
                        "Unknown Citizen"}
                    </strong>

                    <small>
                      {item.citizen_id?.email ||
                        "Email unavailable"}
                    </small>

                  </div>


                  <small className="feedback-date">

                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleDateString()
                      : ""}

                  </small>

                </div>


                {/* =================================
                    REPORT INFORMATION
                ================================= */}

                <div className="feedback-request-info">

                  {/* REPORT ID */}

                  <span>

                    Report #

                    {item.rescue_request_id?._id
                      ? String(
                          item.rescue_request_id._id
                        )
                          .slice(-6)
                          .toUpperCase()
                      : "N/A"}

                  </span>


                  {/* DISASTER TYPE */}

                  <span>

                    {item.rescue_request_id
                      ?.disaster_type ||
                      "Rescue Request"}

                  </span>


                  {/* STATUS */}

                  <span
                    className={`feedback-status ${
                      item.rescue_request_id?.status
                        ?.toLowerCase()
                        .replace(/\s+/g, "-") || ""
                    }`}
                  >

                    {item.rescue_request_id?.status ||
                      "Unknown"}

                  </span>

                </div>


                {/* =================================
                    RATING
                ================================= */}

                <div className="feedback-rating">

                  <span>
                    {"⭐".repeat(item.rating)}
                  </span>

                  <strong>
                    {item.rating}/5
                  </strong>

                </div>


                {/* =================================
                    COMMENT
                ================================= */}

                <p className="feedback-comment">

                  {item.comment ||
                    "No comment provided."}

                </p>

              </div>

            </div>

          ))

      )}

    </div>

  </div>

</section>
                {/* LIVE NOTIFICATIONS */}

        <section className="admin-panel admin-notifications-panel">
          <div className="admin-panel-header">
            <div>
              <span>LIVE ALERT CENTER</span>
              <h2>Admin Notifications</h2>
            </div>

            <span className="admin-notification-count">
              {notificationCount} Pending
            </span>
          </div>

          {loading ? (
            <div className="admin-empty">
              Checking incoming alerts...
            </div>
          ) : notifications.length === 0 ? (
            <div className="admin-empty admin-notification-empty">
              <span>✓</span>
              <div>
                <strong>All clear</strong>
                <p>No pending emergency notifications.</p>
              </div>
            </div>
          ) : (
            <div className="admin-notification-list">
              {notifications.slice(0, 6).map((notification) => (
                <div
                  className={`admin-notification-item ${notification.priority}`}
                  key={notification.id}
                >
                  <div className="admin-notification-icon">
                    {notification.icon}
                  </div>

                  <div className="admin-notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                  </div>

                  <span className="admin-notification-type">
                    {notification.type}
                  </span>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 6 && (
            <Link
              to={notifications[0]?.path || "/admin"}
              className="admin-notification-item-link"
            >
              View notification center →
            </Link>
          )}
        </section>

        

        {/* RECENT REPORTS */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <span>INCIDENT MONITOR</span>
              <h2>Recent Disaster Reports</h2>
            </div>

            <Link to="/admin/reports">
              View All →
            </Link>

          </div>


          <div className="admin-report-list">

            {loading ? (
              <div className="admin-empty">
                Loading dashboard data...
              </div>
            ) : reports.length === 0 ? (
              <div className="admin-empty">
                No disaster reports available.
              </div>
            ) : (
              reports.slice(0, 5).map((report) => (
                <div
                  className="admin-report-row"
                  key={report._id}
                >

                  <div className="admin-report-icon">
                    🚨
                  </div>

                  <div className="admin-report-info">

                    <strong>
                      {report.disaster_type}
                    </strong>

                    <span>
                      📍 {report.location}, {report.city}
                    </span>

                  </div>

                  <span
                    className={`admin-priority ${(
                      report.priority_level ||
                      report.severity ||
                      "low"
                    ).toLowerCase()}`}
                  >
                    {report.priority_level ||
                      report.severity}
                  </span>

                  <span className="admin-report-status">
                    {report.status}
                  </span>

                </div>
              ))
            )}

          </div>

        </section>


        {/* RESCUE REQUESTS */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <span>EMERGENCY RESPONSE</span>
              <h2>Rescue Requests</h2>
            </div>

            <Link to="/admin/rescue-requests">
              Manage →
            </Link>

          </div>


          <div className="admin-report-list">

            {rescueRequests.length === 0 ? (
              <div className="admin-empty">
                No rescue requests available.
              </div>
            ) : (
              rescueRequests
                .slice(0, 5)
                .map((request) => (
                  <div
                    className="admin-report-row"
                    key={request._id}
                  >

                    <div className="admin-report-icon">
                      🆘
                    </div>

                    <div className="admin-report-info">

                      <strong>
                        {request.disaster_type}
                      </strong>

                      <span>
                        📍 {request.location},{" "}
                        {request.city}
                      </span>

                    </div>

                    <span
                      className={`admin-request-status ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>

                  </div>
                ))
            )}

          </div>

        </section>
        <AdminIncidentMap
  reports={reports}
  rescueRequests={rescueRequests}
/>

      </main>

    </div>
  );
}

export default AdminDashboard;