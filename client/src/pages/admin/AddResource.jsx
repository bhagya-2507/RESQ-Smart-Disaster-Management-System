import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddResource() {
  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const [form, setForm] = useState({
    resource_name: "",
    resource_type: "",
    quantity: "",
    unit: "",
    location: "",
    city: "",
    state: "",
    description: "",
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
      !form.resource_name ||
      !form.resource_type ||
      !form.quantity ||
      !form.unit ||
      !form.location ||
      !form.city ||
      !form.state
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(form.quantity) < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/resources",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add resource.");
      }

      navigate("/admin/resources");
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
            RESOURCE COMMAND CENTER
          </div>

          <h1>Add Resource</h1>

          <p>
            Register a new emergency resource into the RESQ inventory.
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
              INVENTORY ENTRY
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
                placeholder="e.g. Drinking Water"
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
                placeholder="e.g. 500"
              />
            </div>

            <div className="admin-form-group">
              <label>UNIT *</label>
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="e.g. Bottles / Kits / Units"
              />
            </div>

            <div className="admin-form-group admin-form-full">
              <label>LOCATION *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Resource storage / deployment location"
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

            <div className="admin-form-group admin-form-full">
              <label>DESCRIPTION</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add additional information about this resource..."
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
              disabled={loading}
            >
              {loading ? "Adding..." : "+ Add Resource"}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}

export default AddResource;