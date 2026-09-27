import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resq_token");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/resource-requests/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load resource requests."
        );
      }

      setRequests(data.requests || []);
    } catch (err) {
      console.error(
        "Resource requests error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to RESQ server."
      );
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
        `https://resq-smart-disaster-management-system.onrender.com/api/resource-requests/admin/${id}/status`,
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
          data.message || "Unable to update request."
        );
      }

      setRequests((current) =>
        current.map((request) =>
          request._id === id
            ? {
                ...request,
                status: data.request.status,
              }
            : request
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const allocateResource = async (id) => {
    const confirmed = window.confirm(
      "Allocate this resource to the citizen request?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://resq-smart-disaster-management-system.onrender.com/api/resource-requests/admin/${id}/allocate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to allocate resource."
        );
      }

      alert(
        "Resource allocated successfully."
      );

      await loadRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const allocatedCount = requests.filter(
    (request) =>
      request.status === "Allocated"
  ).length;

  return (
    <div className="admin-page-shell">

      {/* HEADER */}
      <div className="admin-page-header">

        <div>
          <span className="admin-eyebrow">
            RESOURCE OPERATIONS
          </span>

          <h1>Resource Requests</h1>

          <p>
            Review citizen resource requests and
            coordinate emergency allocations.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-page-back"
        >
          ← Dashboard
        </Link>

      </div>

      {/* STATS */}
      <div className="admin-stats">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            📦
          </div>

          <small>PENDING REQUESTS</small>

          <strong>
            {String(pendingCount).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            ✓
          </div>

          <small>APPROVED</small>

          <strong>
            {String(approvedCount).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            🚚
          </div>

          <small>ALLOCATED</small>

          <strong>
            {String(allocatedCount).padStart(2, "0")}
          </strong>
        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <section className="admin-table-panel">

        <div className="admin-panel-heading">

          <div>
            <span className="admin-eyebrow">
              INCOMING REQUESTS
            </span>

            <h2>Citizen Resource Requests</h2>
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
            Loading resource requests...
          </div>

        ) : requests.length === 0 ? (

          <div className="admin-empty-large">
            <div className="admin-empty-icon">
              📦
            </div>

            <h3>
              No resource requests
            </h3>

            <p>
              New citizen resource requests
              will appear here.
            </p>
          </div>

        ) : (

          <div className="resource-request-admin-list">

            {requests.map((request) => {

              const available =
                request.resource_id
                  ?.available_quantity ?? 0;

              const isPending =
                request.status === "Pending";

              const isApproved =
                request.status === "Approved";

              const isAllocated =
                request.status === "Allocated";

              const canAllocate =
                (isPending || isApproved) &&
                available >= request.quantity;

              return (
                <article
                  key={request._id}
                  className="resource-request-admin-card"
                >

                  {/* TOP */}
                  <div className="resource-request-admin-top">

                    <div>
                      <span className="resource-request-label">
                        RESOURCE REQUEST
                      </span>

                      <h3>
                        {request.resource_name}
                      </h3>

                      <p>
                        {request.resource_type}
                      </p>
                    </div>

                    <span
                      className={`resource-request-status ${String(
                        request.status
                      ).toLowerCase()}`}
                    >
                      {request.status}
                    </span>

                  </div>

                  {/* DETAILS */}
                  <div className="resource-request-admin-grid">

                    <div>
                      <span>
                        REQUESTER
                      </span>

                      <strong>
                        {request.citizen_id?.full_name ||
                          "Citizen"}
                      </strong>

                      <small>
                        {request.citizen_id?.mobile ||
                          request.citizen_id?.email ||
                          "Contact unavailable"}
                      </small>
                    </div>

                    <div>
                      <span>
                        QUANTITY
                      </span>

                      <strong>
                        {request.quantity}
                      </strong>

                      <small>
                        {request.resource_id?.unit ||
                          "Units"}
                      </small>
                    </div>

                    <div>
                      <span>
                        AVAILABLE
                      </span>

                      <strong className={
                        available >= request.quantity
                          ? "resource-available-ok"
                          : "resource-available-low"
                      }>
                        {available}
                      </strong>

                      <small>
                        Current inventory
                      </small>
                    </div>

                    <div>
                      <span>
                        URGENCY
                      </span>

                      <strong>
                        {request.urgency}
                      </strong>

                      <small>
                        {request.city},{" "}
                        {request.state}
                      </small>
                    </div>

                  </div>

                  {/* LOCATION */}
                  <div className="resource-request-admin-location">

                    <span>
                      DELIVERY LOCATION
                    </span>

                    <strong>
                      📍 {request.location}
                    </strong>

                  </div>

                  {/* DESCRIPTION */}
                  {request.description && (
                    <div className="resource-request-admin-description">

                      <span>
                        REQUEST DETAILS
                      </span>

                      <p>
                        {request.description}
                      </p>

                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="resource-request-admin-actions">

                    <select
                      className="resource-request-status-select"
                      value={request.status}
                      disabled={
                        isAllocated ||
                        request.status === "Rejected"
                      }
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

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                      <option value="Fulfilled">
                        Fulfilled
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>

                    <button
                      type="button"
                      className="resource-request-allocate-btn"
                      disabled={
                        isAllocated ||
                        !canAllocate
                      }
                      onClick={() =>
                        allocateResource(
                          request._id
                        )
                      }
                    >
                      {isAllocated
                        ? "✓ Allocated"
                        : canAllocate
                        ? "📦 Allocate Resource"
                        : "Insufficient Stock"}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default ResourceRequests;