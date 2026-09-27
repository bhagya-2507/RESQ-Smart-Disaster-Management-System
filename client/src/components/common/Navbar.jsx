import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      if (user?.role !== "citizen") return;

      try {
        const token = localStorage.getItem("resq_token");

        if (!token) return;

        const response = await fetch(
          "http://localhost:5000/api/alerts",
          {
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

        const activeAlerts = (data.alerts || []).filter(
          (alert) => alert.status === "Active"
        );

        setAlerts(activeAlerts);
      } catch (error) {
        console.error("Navbar alerts error:", error);
      }
    };

    fetchAlerts();
  }, [user]);

  return (
    <nav className="resq-navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">R</div>

          <div>
            <div className="navbar-name">RESQ</div>
            <div className="navbar-subtitle">
              SMART DISASTER RESPONSE
            </div>
          </div>
        </Link>

        <div className="navbar-links">

          {!user && (
            <>
              <Link to="/">Home</Link>
              <Link to="/citizen-login">Citizen Login</Link>
              <Link to="/admin/login">Admin</Link>
              <Link to="/team-login">Rescue Team</Link>
            </>
          )}

          {user?.role === "citizen" && (
            <>
              <Link to="/citizen-dashboard">Dashboard</Link>
              <Link to="/report">Report Disaster</Link>
              <Link to="/rescue-request">Rescue Request</Link>

              <div className="notification-wrapper">
                <button
                  type="button"
                  className="notification-bell"
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
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

                              <span>
                                {alert.severity}
                              </span>
                            </div>

                            <p>{alert.message}</p>

                            <small>
                              📍{" "}
                              {alert.city ||
                                alert.location ||
                                "Emergency Area"}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/reports">Reports</Link>
              <Link to="/admin/rescue-teams">Teams</Link>
              <Link to="/admin/resources">Resources</Link>
              <Link to="/admin/shelters">Shelters</Link>
              <Link to="/admin/alerts">Alerts</Link>
              <Link to="/intelligence">Intelligence</Link>
            </>
          )}

          {user?.role === "rescue_team" && (
            <Link to="/team-dashboard">Dashboard</Link>
          )}

        </div>

        {user && (
          <button
            className="navbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;