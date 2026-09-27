import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Resources() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resq_token");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/resources",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load resources.");
      }

      setResources(data.resources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const deleteResource = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/resources/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete resource.");
      }

      fetchResources();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/resources/${id}/status`,
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

      fetchResources();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalResources = resources.length;

  const totalQuantity = resources.reduce(
    (sum, resource) => sum + Number(resource.quantity || 0),
    0
  );

  const availableQuantity = resources.reduce(
    (sum, resource) => sum + Number(resource.available_quantity || 0),
    0
  );

  const allocatedResources = resources.filter(
    (resource) => resource.status === "Allocated"
  ).length;

  return (
    <div className="admin-page-shell">

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            RESOURCE COMMAND CENTER
          </div>

          <h1>Resource Management</h1>

          <p>
            Monitor emergency resources, availability and allocation status.
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
            onClick={() => navigate("/admin/resources/add")}
          >
            + Add Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <small>TOTAL RESOURCES</small>
          <strong>{String(totalResources).padStart(2, "0")}</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📊</div>
          <small>TOTAL QUANTITY</small>
          <strong>{totalQuantity}</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <small>AVAILABLE UNITS</small>
          <strong>{availableQuantity}</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🚑</div>
          <small>ALLOCATED RESOURCES</small>
          <strong>{String(allocatedResources).padStart(2, "0")}</strong>
        </div>

      </div>

      {/* Resource Table */}
      <div className="admin-table-panel">

        <div className="admin-panel-heading">
          <div>
            <div className="admin-eyebrow">
              LIVE INVENTORY
            </div>

            <h2>Emergency Resources</h2>
          </div>

          <button
            className="admin-secondary-btn"
            onClick={fetchResources}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="admin-empty">
            Loading resources...
          </div>
        )}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="admin-empty-large">
            <div className="admin-empty-icon">📦</div>
            <h3>No resources available</h3>
            <p>
              Add emergency resources to start managing inventory.
            </p>

            <button
              className="admin-primary-btn"
              onClick={() => navigate("/admin/resources/add")}
            >
              + Add First Resource
            </button>
          </div>
        )}

        {!loading && resources.length > 0 && (
          <div className="admin-data-table-wrapper">
            <table className="admin-data-table">

              <thead>
                <tr>
                  <th>RESOURCE</th>
                  <th>TYPE</th>
                  <th>QUANTITY</th>
                  <th>AVAILABLE</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {resources.map((resource) => (
                  <tr key={resource._id}>

                    <td>
                      <div className="resource-name">
  <strong>{resource.resource_name}</strong>

  <span className="resource-description">
    {resource.description || "Emergency resource"}
  </span>
</div>
                    </td>

                    <td>
                      <span className="resource-type">
                        {resource.resource_type}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {resource.quantity} {resource.unit}
                      </strong>
                    </td>

                    <td>
                      <strong className="resource-available">
                        {resource.available_quantity} {resource.unit}
                      </strong>
                    </td>

                    <td>
                      <div className="resource-location">
                        <strong>{resource.city}</strong>
                        <span>{resource.state}</span>
                      </div>
                    </td>

                    <td>
                      <select
                        className={`resource-status-select status-${resource.status.toLowerCase()}`}
                        value={resource.status}
                        onChange={(e) =>
                          updateStatus(
                            resource._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Available">
                          Available
                        </option>

                        <option value="Allocated">
                          Allocated
                        </option>

                        <option value="Depleted">
                          Depleted
                        </option>
                      </select>
                    </td>

                    <td>
                      <div className="resource-actions">

                        <button
                          className="admin-action-btn edit"
                          onClick={() =>
                            navigate(
                              `/admin/resources/edit/${resource._id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="admin-action-btn delete"
                          onClick={() =>
                            deleteResource(resource._id)
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

export default Resources;