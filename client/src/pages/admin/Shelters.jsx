import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Shelters() {
  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/shelters",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load shelters."
        );
      }

      setShelters(data.shelters || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const deleteShelter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shelter?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/shelters/${id}`,
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
          data.message || "Unable to delete shelter."
        );
      }

      fetchShelters();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/shelters/${id}/status`,
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
          data.message || "Unable to update shelter status."
        );
      }

      fetchShelters();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalCapacity = shelters.reduce(
    (sum, shelter) => sum + Number(shelter.capacity || 0),
    0
  );

  const occupiedPeople = shelters.reduce(
    (sum, shelter) => sum + Number(shelter.occupied || 0),
    0
  );

  const availableCapacity = shelters.reduce(
    (sum, shelter) =>
      sum + Number(shelter.available_capacity || 0),
    0
  );

  const openShelters = shelters.filter(
    (shelter) => shelter.status === "Open"
  ).length;

  return (
    <div className="admin-page-shell">

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            SHELTER COMMAND CENTER
          </div>

          <h1>Shelter Management</h1>

          <p>
            Monitor emergency shelters, occupancy and available capacity.
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
            onClick={() => navigate("/admin/shelters/add")}
          >
            + Add Shelter
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-stats">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏠</div>
          <small>TOTAL SHELTERS</small>
          <strong>
            {String(shelters.length).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🟢</div>
          <small>OPEN SHELTERS</small>
          <strong>
            {String(openShelters).padStart(2, "0")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <small>OCCUPIED PEOPLE</small>
          <strong>{occupiedPeople}</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🛏️</div>
          <small>AVAILABLE CAPACITY</small>
          <strong>{availableCapacity}</strong>
        </div>

      </div>

      {/* Shelter Table */}
      <div className="admin-table-panel">

        <div className="admin-panel-heading">
          <div>
            <div className="admin-eyebrow">
              LIVE SHELTER INVENTORY
            </div>

            <h2>Emergency Shelters</h2>
          </div>

          <button
            className="admin-secondary-btn"
            onClick={fetchShelters}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="admin-empty">
            Loading shelters...
          </div>
        )}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {!loading && !error && shelters.length === 0 && (
          <div className="admin-empty-large">
            <div className="admin-empty-icon">🏠</div>

            <h3>No shelters available</h3>

            <p>
              Add emergency shelters to start managing evacuation capacity.
            </p>

            <button
              className="admin-primary-btn"
              onClick={() => navigate("/admin/shelters/add")}
            >
              + Add First Shelter
            </button>
          </div>
        )}

        {!loading && shelters.length > 0 && (
          <div className="admin-data-table-wrapper">
            <table className="admin-data-table">

              <thead>
                <tr>
                  <th>SHELTER</th>
                  <th>TYPE</th>
                  <th>CAPACITY</th>
                  <th>OCCUPIED</th>
                  <th>AVAILABLE</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {shelters.map((shelter) => (
                  <tr key={shelter._id}>

                    <td>
                      <div className="resource-name">
                        <strong>{shelter.shelter_name}</strong>

                        <span>
                          {shelter.contact}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="resource-type">
                        {shelter.shelter_type}
                      </span>
                    </td>

                    <td>
                      <strong>{shelter.capacity}</strong>
                    </td>

                    <td>
                      <strong>{shelter.occupied}</strong>
                    </td>

                    <td>
                      <strong className="resource-available">
                        {shelter.available_capacity}
                      </strong>
                    </td>

                    <td>
                      <div className="resource-location">
                        <strong>{shelter.city}</strong>
                        <span>{shelter.state}</span>
                      </div>
                    </td>

                    <td>
                      <select
                        className={`resource-status-select shelter-status-${shelter.status.toLowerCase()}`}
                        value={shelter.status}
                        onChange={(e) =>
                          updateStatus(
                            shelter._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Open">Open</option>
                        <option value="Full">Full</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td>
                      <div className="resource-actions">

                        <button
                          className="admin-action-btn edit"
                          onClick={() =>
                            navigate(
                              `/admin/shelters/edit/${shelter._id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="admin-action-btn delete"
                          onClick={() =>
                            deleteShelter(shelter._id)
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

export default Shelters;