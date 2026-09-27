
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ShelterRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("resq_token");

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/shelter-requests/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests");
      }

      setRequests(data.requests || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/shelter-requests/admin/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            admin_note: `Request ${status.toLowerCase()} by admin.`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status");
      }

      setRequests((current) =>
        current.map((request) =>
          request._id === id
            ? { ...request, status }
            : request
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="admin-page-shell">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            SHELTER OPERATIONS
          </span>
          <h1>Shelter Requests</h1>
          <p>
            Review and manage citizen accommodation requests.
          </p>
        </div>

        <Link to="/admin" className="admin-page-back">
          ← Dashboard
        </Link>
      </div>

      <section className="admin-table-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">
              INCOMING REQUESTS
            </span>
            <h2>Citizen Shelter Requests</h2>
          </div>

          <button
            className="admin-secondary-btn"
            onClick={loadRequests}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-empty">
            Loading shelter requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="admin-empty-large">
            <h3>No shelter requests</h3>
            <p>New requests will appear here.</p>
          </div>
        ) : (
          <div className="resource-request-admin-list">
            {requests.map((request) => (
              <article
                key={request._id}
                className="resource-request-admin-card"
              >
                <div className="resource-request-admin-top">
                  <div>
                    <span className="resource-request-label">
                      SHELTER REQUEST
                    </span>

                    <h3>
                      {request.shelter_id?.shelter_name ||
                        "Emergency Shelter"}
                    </h3>

                    <p>
                      {request.shelter_id?.location ||
                        "Location unavailable"}
                    </p>
                  </div>

                  <span className="resource-request-status">
                    {request.status}
                  </span>
                </div>

                <div className="resource-request-admin-grid">
                  <div>
                    <span>REQUESTER</span>
                    <strong>
                      {request.requester_name || "Citizen"}
                    </strong>
                    <small>
                      {request.contact || "Contact unavailable"}
                    </small>
                  </div>

                  <div>
                    <span>PEOPLE COUNT</span>
                    <strong>{request.people_count}</strong>
                    <small>People</small>
                  </div>

                  <div>
                    <span>SHELTER</span>
                    <strong>
                      {request.shelter_id?.shelter_type ||
                        "Emergency Shelter"}
                    </strong>
                    <small>Accommodation</small>
                  </div>

                  <div>
                    <span>DATE</span>
                    <strong>
                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString()
                        : "Unavailable"}
                    </strong>
                    <small>Requested on</small>
                  </div>
                </div>

                <div className="resource-request-admin-description">
                  <span>EMERGENCY REASON</span>
                  <p>{request.emergency_reason}</p>
                </div>

                <div className="resource-request-admin-actions">
                  <select
                    className="resource-request-status-select"
                    value={request.status}
                    disabled={[
                      "Rejected",
                      "Completed",
                      "Cancelled",
                    ].includes(request.status)}
                    onChange={(event) =>
                      updateStatus(
                        request._id,
                        event.target.value
                      )
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ShelterRequests;