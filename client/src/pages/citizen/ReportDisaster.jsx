import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ReportDisaster() {
  const [form, setForm] = useState({
    disaster_type: "",
    severity: "",
    location: "",
    city: "",
    state: "",
    affected: "",
    injured: "",
    missing: "",
    description: "",
  });
  

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [image, setImage] = useState(null);
const [imagePreview, setImagePreview] = useState("");
const [submitting, setSubmitting] = useState(false);
const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);
const [locationLoading, setLocationLoading] = useState(false);
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    setError("GPS is not supported by your browser.");
    return;
  }

  setLocationLoading(true);
  setError("");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setLatitude(lat);
      setLongitude(lon);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );

        const data = await response.json();

        if (data.display_name) {
          setForm((prev) => ({
            ...prev,
            location: data.display_name,
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              prev.city,
            state:
              data.address?.state ||
              prev.state,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            location: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          }));
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);

        // GPS still works even if address lookup fails
        setForm((prev) => ({
          ...prev,
          location: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        }));
      }

      setLocationLoading(false);
    },

    (error) => {
      console.error("GPS error:", error);

      setLocationLoading(false);

      if (error.code === 1) {
        setError(
          "Location permission denied. Please allow location access."
        );
      } else if (error.code === 2) {
        setError("Unable to detect your current location.");
      } else {
        setError("Unable to get GPS location. Please try again.");
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  // Required fields
  if (
    !form.disaster_type ||
    !form.severity ||
    !form.location ||
    !form.city ||
    !form.state ||
    form.affected === "" ||
    form.injured === "" ||
    form.missing === "" ||
    !form.description
  ) {
    setError("Please fill all required fields.");
    return;
  }

  // Location validation
  if (form.location.trim().length < 5) {
    setError("Please provide a more specific incident location.");
    return;
  }

  // Description validation
  if (form.description.trim().length < 10) {
    setError("Description must contain at least 10 characters.");
    return;
  }

  if (form.description.trim().length > 2000) {
    setError("Description cannot exceed 2000 characters.");
    return;
  }

  // Number validation
  const affected = Number(form.affected);
  const injured = Number(form.injured);
  const missing = Number(form.missing);

  if (
    !Number.isInteger(affected) ||
    !Number.isInteger(injured) ||
    !Number.isInteger(missing) ||
    affected < 0 ||
    injured < 0 ||
    missing < 0
  ) {
    setError("People counts must be valid non-negative whole numbers.");
    return;
  }

  if (injured > affected) {
    setError("Injured people cannot be greater than affected people.");
    return;
  }

  if (missing > affected) {
    setError("Missing people cannot be greater than affected people.");
    return;
  }

  // Image validation
  if (image) {
    const allowedTypes = ["image/png", "image/jpeg"];

    if (!allowedTypes.includes(image.type)) {
      setError("Only PNG, JPG and JPEG images are allowed.");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }
  }

  const token = localStorage.getItem("resq_token");

  if (!token) {
    setError("Please login again before submitting a report.");
    return;
  }

  setSubmitting(true);

  try {
    const formData = new FormData();

    formData.append("disaster_type", form.disaster_type);
    formData.append("severity", form.severity);
    formData.append("location", form.location.trim());
    formData.append("city", form.city.trim());
    formData.append("state", form.state.trim());
    formData.append("affected_people", affected);
    formData.append("injured_people", injured);
    formData.append("missing_people", missing);
    formData.append("description", form.description.trim());
    if (latitude !== null && longitude !== null) {
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
}

    if (image) {
      formData.append("report_image", image);
    }

    const response = await fetch(
      "http://localhost:5000/api/reports",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to submit disaster report.");
      return;
    }

    setSuccess(
      `Disaster report submitted successfully. Report ID: ${
        data.report?._id || "Generated"
      }`
    );

    setForm({
      disaster_type: "",
      severity: "",
      location: "",
      city: "",
      state: "",
      affected: "",
      injured: "",
      missing: "",
      description: "",
    });

    setImage(null);
    setImagePreview("");

    const fileInput = document.querySelector(
      'input[type="file"]'
    );

    if (fileInput) {
      fileInput.value = "";
    }
  } catch (error) {
    console.error("Report submission error:", error);

    setError(
      "Unable to connect to RESQ server. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};
  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    setImage(null);
    setImagePreview("");
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg"];

  if (!allowedTypes.includes(file.type)) {
    setError("Only PNG, JPG and JPEG images are allowed.");
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Image size must be less than 5 MB.");
    e.target.value = "";
    return;
  }

  setImage(file);
  setImagePreview(URL.createObjectURL(file));
  setError("");
};

  return (
    <div className="report-page">

      <header className="report-header">
        <Link to="/citizen-dashboard" className="report-brand">
          <div className="report-logo">R</div>
          <div>
            <strong>RESQ</strong>
            <span>CITIZEN RESPONSE PORTAL</span>
          </div>
        </Link>

        <Link to="/citizen-dashboard" className="report-back">
          ← Dashboard
        </Link>
      </header>

      <main className="report-container">

        <div className="report-heading">
          <span>EMERGENCY REPORTING</span>
          <h1>Report a Disaster</h1>
          <p>
            Provide accurate incident information so emergency authorities can
            assess and coordinate the response.
          </p>
        </div>

        {error && <div className="report-message error">{error}</div>}

        {success && (
          <div className="report-message success">{success}</div>
        )}

        <form className="report-form" onSubmit={handleSubmit}>

          <section className="report-card">
            <div className="report-card-title">
              <span>01</span>
              <div>
                <h2>Incident Information</h2>
                <p>Tell us what is happening.</p>
              </div>
            </div>

            <div className="report-form-grid">

              <div className="report-field">
                <label>Disaster Type *</label>
                <select
                  name="disaster_type"
                  value={form.disaster_type}
                  onChange={handleChange}
                >
                  <option value="">Select disaster type</option>
                  <option value="Flood">Flood</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="report-field">
                <label>Severity *</label>
                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                >
                  <option value="">Select severity</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="report-field full">
                <label>Exact Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter incident location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
              <div className="report-field full">
  <button
    type="button"
    className="report-location-btn"
    onClick={getCurrentLocation}
    disabled={locationLoading}
  >
    {locationLoading
      ? "📍 Detecting Location..."
      : "📍 Use My Current Location"}
  </button>

  {latitude !== null && longitude !== null && (
  <div className="report-gps-info">
    <div className="report-gps-success">
      ✓ GPS location captured successfully
    </div>

    <div className="report-gps-coordinates">
      <div>
        <span>LATITUDE</span>
        <strong>{latitude.toFixed(6)}</strong>
      </div>

      <div>
        <span>LONGITUDE</span>
        <strong>{longitude.toFixed(6)}</strong>
      </div>
    </div>
  </div>
)}
</div>

              <div className="report-field">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              <div className="report-field">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>


          <section className="report-card">
            <div className="report-card-title">
              <span>02</span>
              <div>
                <h2>Human Impact</h2>
                <p>Help authorities understand the scale of the emergency.</p>
              </div>
            </div>

            <div className="report-form-grid three">

              <div className="report-field">
                <label>Affected People *</label>
                <input
                  type="number"
                  min="0"
                  name="affected"
                  placeholder="0"
                  value={form.affected}
                  onChange={handleChange}
                />
              </div>

              <div className="report-field">
                <label>Injured People</label>
                <input
                  type="number"
                  min="0"
                  name="injured"
                  placeholder="0"
                  value={form.injured}
                  onChange={handleChange}
                />
              </div>

              <div className="report-field">
                <label>Missing People</label>
                <input
                  type="number"
                  min="0"
                  name="missing"
                  placeholder="0"
                  value={form.missing}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>


          <section className="report-card">
            <div className="report-card-title">
              <span>03</span>
              <div>
                <h2>Incident Description</h2>
                <p>Provide any important information for responders.</p>
              </div>
            </div>

            <div className="report-field">
              <label>Description *</label>
              <textarea
                name="description"
                rows="6"
                placeholder="Describe the emergency situation, immediate risks, trapped people, nearby landmarks, etc."
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </section>
<div className="report-field full">
  <label>Incident Image</label>

  <input
    type="file"
    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
    onChange={handleImageChange}
  />

  <small className="upload-hint">
    Upload a clear photo of the disaster situation. PNG, JPG or JPEG only. Max 5 MB.
  </small>

  {imagePreview && (
    <div className="image-preview">
      <img src={imagePreview} alt="Disaster preview" />
      <span>{image.name}</span>
    </div>
  )}
</div>

          <div className="report-submit-area">
            <Link to="/citizen-dashboard" className="report-cancel">
              Cancel
            </Link>

            <button type="submit" className="report-submit">
              🚨 Submit Emergency Report
            </button>
          </div>

        </form>
      </main>

    </div>
  );
}

export default ReportDisaster;