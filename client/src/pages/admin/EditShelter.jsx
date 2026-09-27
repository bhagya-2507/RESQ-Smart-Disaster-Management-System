import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditShelter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("resq_token");

  const [form, setForm] = useState({
    shelter_name: "",
    shelter_type: "Relief Camp",
    capacity: "",
    occupied: "",
    location: "",
    city: "",
    state: "",
    contact: "",
    facilities: "",
    status: "Open",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadShelter = async () => {
      try {
        const response = await fetch(
          "https://resq-smart-disaster-management-system.onrender.com/api/shelters",
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

        const shelter = (data.shelters || []).find(
          (item) => item._id === id
        );

        if (!shelter) {
          throw new Error("Shelter not found.");
        }

        setForm({
          shelter_name: shelter.shelter_name || "",
          shelter_type:
            shelter.shelter_type || "Relief Camp",
          capacity: shelter.capacity ?? "",
          occupied: shelter.occupied ?? 0,
          location: shelter.location || "",
          city: shelter.city || "",
          state: shelter.state || "",
          contact: shelter.contact || "",
          facilities: shelter.facilities || "",
          status: shelter.status || "Open",
          latitude: shelter.latitude ?? "",
          longitude: shelter.longitude ?? "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadShelter();
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
      setError(
        "Contact number must contain exactly 10 digits."
      );
      return;
    }

    if (capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    if (occupied < 0 || occupied > capacity) {
      setError(
        "Occupied people cannot exceed shelter capacity."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `https://resq-smart-disaster-management-system.onrender.com/api/shelters/${id}`,
        {
          method: "PATCH",
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
            status: form.status,
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
          data.message || "Unable to update shelter."
        );
      }

      navigate("/admin/shelters");
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
          Loading shelter...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">

      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            SHELTER COMMAND CENTER
          </div>

          <h1>Edit Shelter</h1>

          <p>
            Update shelter capacity, occupancy and operational status.
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
              SHELTER UPDATE
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
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>OCCUPIED PEOPLE *</label>
              <input
                type="number"
                min="0"
                max={form.capacity || undefined}
                name="occupied"
                value={form.occupied}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>CONTACT NUMBER *</label>
              <input
                type="tel"
                maxLength="10"
                name="contact"
                value={form.contact}
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
                <option value="Open">Open</option>
                <option value="Full">Full</option>
                <option value="Closed">Closed</option>
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
              onClick={() => navigate("/admin/shelters")}
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

export default EditShelter;