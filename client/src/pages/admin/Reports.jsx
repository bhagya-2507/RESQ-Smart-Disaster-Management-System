import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resq_token");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/reports/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load reports."
        );
      }

      setReports(data.reports || []);
    } catch (err) {
      console.error("Reports error:", err);
      setError(
        err.message || "Unable to connect to RESQ server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/reports/admin/${id}/status`,
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
          data.message || "Unable to update status."
        );
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report._id === id
            ? {
                ...report,
                status: data.report.status,
              }
            : report
        )
      );
    } catch (err) {
      alert(
        err.message || "Unable to update report status."
      );
    }
  };

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">

        <div>
          <span className="admin-eyebrow">
            INCIDENT MANAGEMENT
          </span>

          <h1>Disaster Reports</h1>

          <p>
            Review, monitor and update citizen disaster reports.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-page-back"
        >
          ← Dashboard
        </Link>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <section className="admin-panel admin-table-panel">

        <div className="admin-panel-header">

          <div>
            <span>ALL INCIDENTS</span>

            <h2>
              {reports.length} Report
              {reports.length === 1 ? "" : "s"}
            </h2>
          </div>

        </div>

        {loading ? (

          <div className="admin-empty">
            Loading reports...
          </div>

        ) : reports.length === 0 ? (

          <div className="admin-empty">
            No disaster reports available.
          </div>

        ) : (

          <div className="admin-table-wrap">

            <table className="admin-data-table">

              <thead>
                <tr>
                  <th>INCIDENT</th>
                  <th>LOCATION</th>
                  <th>PRIORITY</th>
                  <th>AFFECTED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {reports.map((report) => (

                  <tr key={report._id}>

                    <td>
                      <strong>
                        {report.disaster_type}
                      </strong>

                      <small>
                        {report.citizen_id?.full_name ||
                          "Citizen"}
                        {" · "}
                        {report.severity}
                      </small>
                    </td>

                    <td>
                      {report.location}

                      <small>
                        {report.city}, {report.state}
                      </small>
                    </td>

                    <td>
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
                    </td>

                    <td>
                      <strong>
                        {report.affected_people || 0}
                      </strong>

                      <small>
                        People
                      </small>
                    </td>

                    <td>
                      <select
                        className="admin-status-select"
                        value={report.status}
                        onChange={(e) =>
                          updateStatus(
                            report._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Under Review">
                          Under Review
                        </option>

                        <option value="Response Dispatched">
                          Response Dispatched
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>

                        <option value="Rejected">
                          Rejected
                        </option>
                      </select>
                    </td>

                    <td>
                      <Link
                        className="admin-action-btn"
                        to={`/admin/reports/${report._id}`}
                      >
                        Details →
                      </Link>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default Reports;