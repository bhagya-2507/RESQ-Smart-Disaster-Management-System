import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Alerts() {
  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/alerts",
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

      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const deleteAlert = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/alerts/${id}`,
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
          data.message || "Unable to delete alert."
        );
      }

      fetchAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/alerts/${id}/status`,
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
          data.message || "Unable to update alert status."
        );
      }

      fetchAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeAlerts = alerts.filter(
    (alert) => alert.status === "Active"
  ).length;

  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const highAlerts = alerts.filter(
    (alert) => alert.severity === "High"
  ).length;

  const expiredAlerts = alerts.filter(
    (alert) => alert.status === "Expired"
  ).length;

  const getSeverityClass = (severity) => {
    return `alert-severity alert-severity-${severity.toLowerCase()}`;
  };

  return (
    <div className="admin-page-shell">

      {/* Header */}
      <div className="admin-page-header">

        <div>
          <div className="admin-eyebrow">
            EMERGENCY ALERT COMMAND CENTER
          </div>

          <h1>Alert Management</h1>

          <p>
            Issue, monitor and manage disaster alerts across affected areas.
          </p>
        </div>

        <div className="admin-page-header-actions">

          <button
            className="admin-secondary-btn"
            onClick={() => navigate("/admin")}
          >
            ← Dashboard
          </button>

          <button
            className="admin-primary-btn"
            onClick={() => navigate("/admin/alerts/add")}
          >
            + Create Alert
          </button>

        </div>
      </div>

      {/* Statistics */}
      <div className="admin-stats">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🚨</div>
          <small>TOTAL ALERTS</small>
          <strong>
            {String(alerts.length).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🔴</div>
          <small>CRITICAL ALERTS</small>
          <strong>
            {String(criticalAlerts).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🟠</div>
          <small>HIGH PRIORITY</small>
          <strong>
            {String(highAlerts).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🟢</div>
          <small>ACTIVE ALERTS</small>
          <strong>
            {String(activeAlerts).padStart(2, "0")}
          </strong>
        </div>

      </div>

      {/* Alert Table */}
      <div className="admin-table-panel">

        <div className="admin-panel-heading">

          <div>
            <div className="admin-eyebrow">
              LIVE EMERGENCY FEED
            </div>

            <h2>Disaster Alerts</h2>
          </div>

          <button
            className="admin-secondary-btn"
            onClick={fetchAlerts}
          >
            ↻ Refresh
          </button>

        </div>

        {loading && (
          <div className="admin-empty">
            Loading alerts...
          </div>
        )}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="admin-empty-large">

            <div className="admin-empty-icon">
              🚨
            </div>

            <h3>No emergency alerts</h3>

            <p>
              Create an alert to notify citizens about active disasters.
            </p>

            <button
              className="admin-primary-btn"
              onClick={() => navigate("/admin/alerts/add")}
            >
              + Create First Alert
            </button>

          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="admin-data-table-wrapper">

            <table className="admin-data-table">

              <thead>
                <tr>
                  <th>ALERT</th>
                  <th>TYPE</th>
                  <th>SEVERITY</th>
                  <th>LOCATION</th>
                  <th>ISSUED BY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {alerts.map((alert) => (
                  <tr key={alert._id}>

                    <td>
                      <div className="resource-name">

                        <strong>
                          {alert.title}
                        </strong>

                        <span>
                          {alert.message}
                        </span>

                      </div>
                    </td>

                    <td>
                      <span className="resource-type">
                        {alert.alert_type}
                      </span>
                    </td>

                    <td>
                      <span className={getSeverityClass(alert.severity)}>
                        {alert.severity}
                      </span>
                    </td>

                    <td>
                      <div className="resource-location">
                        <strong>{alert.city}</strong>
                        <span>{alert.state}</span>
                      </div>
                    </td>

                    <td>
                      <span className="alert-issued-by">
                        {alert.issued_by}
                      </span>
                    </td>

                    <td>

                      <select
                        className={`resource-status-select alert-status-${alert.status.toLowerCase()}`}
                        value={alert.status}
                        onChange={(e) =>
                          updateStatus(
                            alert._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Expired">
                          Expired
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </td>

                    <td>

                      <div className="resource-actions">

                        <button
                          className="admin-action-btn edit"
                          onClick={() =>
                            navigate(
                              `/admin/alerts/edit/${alert._id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="admin-action-btn delete"
                          onClick={() =>
                            deleteAlert(alert._id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Alerts;