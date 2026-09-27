import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddAlert() {
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
    expires_at: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/alerts",
        {
          method: "POST",
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
          data.message || "Unable to create alert."
        );
      }

      navigate("/admin/alerts");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            EMERGENCY ALERT COMMAND CENTER
          </div>

          <h1>Create Alert</h1>

          <p>
            Publish an emergency notification for affected areas.
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
              EMERGENCY NOTIFICATION
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
                placeholder="e.g. Flash Flood Warning"
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
                placeholder="Provide clear instructions and safety information..."
              />
            </div>

            <div className="admin-form-group admin-form-full">
              <label>AFFECTED LOCATION *</label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Near Hindon River"
              />
            </div>

            <div className="admin-form-group">
              <label>CITY *</label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Ghaziabad"
              />
            </div>

            <div className="admin-form-group">
              <label>STATE *</label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Uttar Pradesh"
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
                placeholder="e.g. 28.6692"
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
                placeholder="e.g. 77.4538"
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
              disabled={loading}
            >
              {loading ? "Publishing..." : "🚨 Publish Alert"}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}

export default AddAlert;