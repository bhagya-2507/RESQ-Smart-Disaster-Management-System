import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddShelter() {
  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const [form, setForm] = useState({
    shelter_name: "",
    shelter_type: "Relief Camp",
    capacity: "",
    occupied: "0",
    location: "",
    city: "",
    state: "",
    contact: "",
    facilities: "",
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

    const capacity = Number(form.capacity);
    const occupied = Number(form.occupied);

    if (
      !form.shelter_name ||
      !form.capacity ||
      !form.location ||
      !form.city ||
      !form.state ||
      !form.contact
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.contact)) {
      setError("Contact number must contain exactly 10 digits.");
      return;
    }

    if (capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    if (occupied < 0 || occupied > capacity) {
      setError("Occupied people cannot exceed capacity.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/shelters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shelter_name: form.shelter_name,
            shelter_type: form.shelter_type,
            capacity,
            occupied,
            location: form.location,
            city: form.city,
            state: form.state,
            contact: form.contact,
            facilities: form.facilities,
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
          data.message || "Unable to add shelter."
        );
      }

      navigate("/admin/shelters");
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
            SHELTER COMMAND CENTER
          </div>

          <h1>Add Shelter</h1>

          <p>
            Register an emergency shelter and its evacuation capacity.
          </p>
        </div>

        <button
          className="admin-secondary-btn"
          onClick={() => navigate("/admin/shelters")}
        >
          ← Shelters
        </button>
      </div>

      <div className="admin-form-panel resource-form-panel">

        <div className="admin-panel-heading">
          <div>
            <div className="admin-eyebrow">
              SHELTER REGISTRATION
            </div>

            <h2>Shelter Details</h2>
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
              <label>SHELTER NAME *</label>
              <input
                name="shelter_name"
                value={form.shelter_name}
                onChange={handleChange}
                placeholder="e.g. City Relief Camp"
              />
            </div>

            <div className="admin-form-group">
              <label>SHELTER TYPE *</label>
              <select
                name="shelter_type"
                value={form.shelter_type}
                onChange={handleChange}
              >
                <option value="Relief Camp">
                  Relief Camp
                </option>

                <option value="Emergency Shelter">
                  Emergency Shelter
                </option>

                <option value="Temporary Shelter">
                  Temporary Shelter
                </option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>TOTAL CAPACITY *</label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                placeholder="e.g. 500"
              />
            </div>

            <div className="admin-form-group">
              <label>OCCUPIED PEOPLE</label>
              <input
                type="number"
                name="occupied"
                min="0"
                max={form.capacity || undefined}
                value={form.occupied}
                onChange={handleChange}
                placeholder="e.g. 120"
              />
            </div>

            <div className="admin-form-group admin-form-full">
              <label>LOCATION *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Full shelter address / location"
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
              <label>CONTACT NUMBER *</label>
              <input
                type="tel"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                maxLength="10"
                placeholder="10-digit contact"
              />
            </div>

            <div className="admin-form-group">
              <label>FACILITIES</label>
              <input
                name="facilities"
                value={form.facilities}
                onChange={handleChange}
                placeholder="Food, water, medical, toilets..."
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
              onClick={() => navigate("/admin/shelters")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-btn"
              disabled={loading}
            >
              {loading ? "Adding..." : "+ Add Shelter"}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}

export default AddShelter;