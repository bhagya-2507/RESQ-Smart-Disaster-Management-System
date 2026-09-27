import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditResource() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("resq_token");

  const [form, setForm] = useState({
    resource_name: "",
    resource_type: "",
    quantity: "",
    available_quantity: "",
    unit: "",
    location: "",
    city: "",
    state: "",
    status: "Available",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResource = async () => {
      try {
        const response = await fetch(
          "http://https://resq-smart-disaster-management-system.onrender.com/api/resources",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load resources."
          );
        }

        const resource = (data.resources || []).find(
          (item) => item._id === id
        );

        if (!resource) {
          throw new Error("Resource not found.");
        }

        setForm({
          resource_name: resource.resource_name || "",
          resource_type: resource.resource_type || "",
          quantity: resource.quantity ?? "",
          available_quantity: resource.available_quantity ?? "",
          unit: resource.unit || "",
          location: resource.location || "",
          city: resource.city || "",
          state: resource.state || "",
          status: resource.status || "Available",
          description: resource.description || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResource();
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

    const total = Number(form.quantity);
    const available = Number(form.available_quantity);

    if (
      !form.resource_name ||
      !form.resource_type ||
      form.quantity === "" ||
      form.available_quantity === "" ||
      !form.unit ||
      !form.location ||
      !form.city ||
      !form.state
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (total < 0 || available < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    if (available > total) {
      setError(
        "Available quantity cannot exceed total quantity."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://https://resq-smart-disaster-management-system.onrender.com/api/resources/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resource_name: form.resource_name,
            resource_type: form.resource_type,
            quantity: total,
            available_quantity: available,
            unit: form.unit,
            location: form.location,
            city: form.city,
            state: form.state,
            status: form.status,
            description: form.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update resource."
        );
      }

      navigate("/admin/resources");
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
          Loading resource...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            RESOURCE COMMAND CENTER
          </div>

          <h1>Edit Resource</h1>

          <p>
            Update inventory quantity, location and deployment status.
          </p>
        </div>

        <button
          className="admin-secondary-btn"
          onClick={() => navigate("/admin/resources")}
        >
          ← Resources
        </button>
      </div>

      <div className="admin-form-panel resource-form-panel">

        <div className="admin-panel-heading">
          <div>
            <div className="admin-eyebrow">
              INVENTORY UPDATE
            </div>

            <h2>Resource Details</h2>
          </div>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>RESOURCE NAME *</label>
              <input
                name="resource_name"
                value={form.resource_name}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>RESOURCE TYPE *</label>
              <select
                name="resource_type"
                value={form.resource_type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                <option value="Medical">Medical</option>
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Rescue Equipment">
                  Rescue Equipment
                </option>
                <option value="Shelter">Shelter</option>
                <option value="Transportation">
                  Transportation
                </option>
                <option value="Communication">
                  Communication
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>TOTAL QUANTITY *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>AVAILABLE QUANTITY *</label>
              <input
                type="number"
                name="available_quantity"
                min="0"
                max={form.quantity}
                value={form.available_quantity}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>UNIT *</label>
              <input
                name="unit"
                value={form.unit}
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
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Depleted">Depleted</option>
              </select>
            </div>

            <div className="admin-form-group admin-form-full">
              <label>LOCATION *</label>
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

            <div className="admin-form-group admin-form-full">
              <label>DESCRIPTION</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

          </div>

          <div className="admin-form-actions">

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => navigate("/admin/resources")}
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

export default EditResource;