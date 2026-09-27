import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditAlert() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const [form, setForm] = useState({
    title: "",
    alert_type: "",
    severity: "High",
    message: "",
    location: "",
    city: "",
    state: "",
    issued_by: "RESQ Command Center",
    status: "Active",
    expires_at: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAlert = async () => {
      try {
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

        const alert = (data.alerts || []).find(
          (item) => item._id === id
        );

        if (!alert) {
          throw new Error("Alert not found.");
        }

        setForm({
          title: alert.title || "",
          alert_type: alert.alert_type || "",
          severity: alert.severity || "High",
          message: alert.message || "",
          location: alert.location || "",
          city: alert.city || "",
          state: alert.state || "",
          issued_by:
            alert.issued_by || "RESQ Command Center",
          status: alert.status || "Active",
          expires_at: alert.expires_at
            ? new Date(alert.expires_at)
                .toISOString()
                .slice(0, 16)
            : "",
          latitude: alert.latitude ?? "",
          longitude: alert.longitude ?? "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlert();
  }, [id, token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.alert_type ||
      !form.message ||
      !form.location ||
      !form.city ||
      !form.state
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/alerts/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title,
            alert_type: form.alert_type,
            severity: form.severity,
            message: form.message,
            location: form.location,
            city: form.city,
            state: form.state,
            issued_by: form.issued_by,
            status: form.status,
            expires_at: form.expires_at || "",
            latitude:
              form.latitude === ""
                ? ""
                : Number(form.latitude),
            longitude:
              form.longitude === ""
                ? ""
                : Number(form.longitude),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update alert."
        );
      }

      navigate("/admin/alerts");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-shell">
        <div className="admin-empty">
          Loading alert...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            EMERGENCY ALERT COMMAND CENTER
          </div>

          <h1>Edit Alert</h1>

          <p>
            Update emergency notification details and operational status.
          </p>
        </div>

        <button
          className="admin-secondary-btn"
          onClick={() => navigate("/admin/alerts")}
        >
          ← Alerts
        </button>
      </div>

      <div className="admin-form-panel resource-form-panel">

        <div className="admin-panel-heading">
          <div>
            <div className="admin-eyebrow">
              ALERT UPDATE
            </div>

            <h2>Alert Details</h2>
          </div>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="admin-form-grid">

            <div className="admin-form-group admin-form-full">
              <label>ALERT TITLE *</label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>ALERT TYPE *</label>

              <select
                name="alert_type"
                value={form.alert_type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Landslide">Landslide</option>
                <option value="Heatwave">Heatwave</option>
                <option value="Storm">Storm</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>SEVERITY *</label>

              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="admin-form-group admin-form-full">
              <label>EMERGENCY MESSAGE *</label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
              />
            </div>

            <div className="admin-form-group admin-form-full">
              <label>AFFECTED LOCATION *</label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>CITY *</label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>STATE *</label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>ISSUED BY</label>

              <input
                name="issued_by"
                value={form.issued_by}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>STATUS *</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>EXPIRES AT</label>

              <input
                type="datetime-local"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>LATITUDE</label>

              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>LONGITUDE</label>

              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="admin-form-actions">

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => navigate("/admin/alerts")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "✓ Save Changes"}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}

export default EditAlert;