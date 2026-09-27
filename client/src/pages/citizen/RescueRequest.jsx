import { useState } from "react";
import { Link } from "react-router-dom";

function RescueRequest() {
  const [form, setForm] = useState({
    emergency_type: "",
    location: "",
    city: "",
    state: "",
    people_count: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // GPS
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If user manually changes location,
    // old GPS coordinates should no longer be treated as exact.
    if (name === "location") {
      setLatitude(null);
      setLongitude(null);
    }

    setError("");
    setSuccess("");
  };

  // =====================================================
  // GET CURRENT GPS LOCATION
  // =====================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("GPS is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setError("");
    setSuccess("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Save coordinates
        setLatitude(lat);
        setLongitude(lon);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error("Unable to find address.");
          }

          const data = await response.json();

          const address = data.address || {};

          const detectedCity =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "";

          const detectedState = address.state || "";

          let detectedLocation =
            data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

          // Backend location field maxLength = 250
          detectedLocation = detectedLocation.slice(0, 250);

          setForm((prev) => ({
            ...prev,
            location: detectedLocation,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
          }));
        } catch (error) {
          console.error("Reverse geocoding error:", error);

          // GPS is still valid even if address lookup fails.
          setForm((prev) => ({
            ...prev,
            location: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          }));

          setError(
            "GPS captured, but exact address could not be detected. Please enter the address manually."
          );
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
        } else if (error.code === 3) {
          setError("GPS request timed out. Please try again.");
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

  // =====================================================
  // SUBMIT RESCUE REQUEST
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.emergency_type ||
      !form.location ||
      !form.city ||
      !form.state ||
      !form.people_count ||
      !form.description
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.location.trim().length < 5) {
      setError("Please provide a more specific emergency location.");
      return;
    }

    const peopleCount = Number(form.people_count);

    if (!Number.isInteger(peopleCount) || peopleCount <= 0) {
      setError("People count must be a whole number greater than 0.");
      return;
    }

    if (peopleCount > 100000) {
      setError("Please enter a valid people count.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError("Description must contain at least 10 characters.");
      return;
    }

    if (form.description.trim().length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    const token = localStorage.getItem("resq_token");

    if (!token) {
      setError("Please login again before submitting a rescue request.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://https://resq-smart-disaster-management-system.onrender.com/api/rescue-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            emergency_type: form.emergency_type,
            location: form.location.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            people_count: peopleCount,
            description: form.description.trim(),

            // GPS coordinates
            latitude: latitude,
            longitude: longitude,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to submit rescue request."
        );
        return;
      }

      setSuccess(
        "Emergency rescue request submitted successfully. Response coordination can now begin."
      );

      // Reset form
      setForm({
        emergency_type: "",
        location: "",
        city: "",
        state: "",
        people_count: "",
        description: "",
      });

      // Reset GPS
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      console.error("Rescue request error:", error);

      setError(
        "Unable to connect to RESQ server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="request-page">

      {/* HEADER */}
      <header className="request-header">
        <Link
          to="/citizen-dashboard"
          className="request-brand"
        >
          <div className="request-logo">R</div>

          <div>
            <strong>RESQ</strong>
            <span>CITIZEN RESPONSE PORTAL</span>
          </div>
        </Link>

        <Link
          to="/citizen-dashboard"
          className="request-back"
        >
          ← Dashboard
        </Link>
      </header>

      {/* MAIN */}
      <main className="request-container">

        {/* HEADING */}
        <div className="request-heading">
          <span>EMERGENCY ASSISTANCE</span>

          <h1>Request Rescue</h1>

          <p>
            Submit an emergency rescue request with accurate
            information so response teams can coordinate
            assistance quickly.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="request-message error">
            ⚠ {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="request-message success">
            ✓ {success}
          </div>
        )}

        {/* EMERGENCY WARNING */}
        <div className="request-warning">
          <div className="warning-icon">⚠</div>

          <div>
            <strong>
              Use this form only for genuine emergencies.
            </strong>

            <p>
              Provide correct information about your location
              and the number of people requiring assistance.
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          className="request-form"
          onSubmit={handleSubmit}
        >

          {/* SECTION 01 */}
          <section className="request-card">

            <div className="request-card-title">
              <span>01</span>

              <div>
                <h2>Emergency Information</h2>

                <p>
                  Tell us what kind of assistance is required.
                </p>
              </div>
            </div>

            <div className="request-form-grid">

              {/* EMERGENCY TYPE */}
              <div className="request-field">
                <label>
                  Emergency Type <b>*</b>
                </label>

                <select
                  name="emergency_type"
                  value={form.emergency_type}
                  onChange={handleChange}
                >
                  <option value="">
                    Select emergency type
                  </option>

                  <option value="Medical Emergency">
                    Medical Emergency
                  </option>

                  <option value="Rescue Needed">
                    Rescue Needed
                  </option>

                  <option value="Trapped Person">
                    Trapped Person
                  </option>

                  <option value="Building Collapse">
                    Building Collapse
                  </option>

                  <option value="Flood Rescue">
                    Flood Rescue
                  </option>

                  <option value="Fire Rescue">
                    Fire Rescue
                  </option>

                  <option value="Accident">
                    Accident
                  </option>

                  <option value="Other">
                    Other Emergency
                  </option>
                </select>
              </div>

              {/* PEOPLE COUNT */}
              <div className="request-field">
                <label>
                  People Requiring Help <b>*</b>
                </label>

                <input
                  type="number"
                  name="people_count"
                  min="1"
                  max="100000"
                  step="1"
                  placeholder="Enter number of people"
                  value={form.people_count}
                  onChange={handleChange}
                />
              </div>

              {/* LOCATION */}
              <div className="request-field full">
                <label>
                  Exact Emergency Location <b>*</b>
                </label>

                <input
                  type="text"
                  name="location"
                  maxLength="250"
                  placeholder="House/building, street, landmark..."
                  value={form.location}
                  onChange={handleChange}
                />

                <small>
                  Provide a location that rescue teams can easily
                  identify.
                </small>

                {/* ONLY ONE GPS BUTTON */}
                <button
                  type="button"
                  className="request-location-btn"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? "📍 Detecting Location..."
                    : "📍 Use My Current Location"}
                </button>

                {/* GPS INFORMATION */}
                {latitude !== null &&
                  longitude !== null && (
                    <div className="request-gps-info">

                      <div className="request-gps-success">
                        ✓ GPS location captured successfully
                      </div>

                      <div className="request-gps-coordinates">

                        <div>
                          <span>LATITUDE</span>
                          <strong>
                            {latitude.toFixed(6)}
                          </strong>
                        </div>

                        <div>
                          <span>LONGITUDE</span>
                          <strong>
                            {longitude.toFixed(6)}
                          </strong>
                        </div>

                      </div>
                    </div>
                  )}
              </div>

              {/* CITY */}
              <div className="request-field">
                <label>
                  City <b>*</b>
                </label>

                <input
                  type="text"
                  name="city"
                  maxLength="100"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              {/* STATE */}
              <div className="request-field">
                <label>
                  State <b>*</b>
                </label>

                <input
                  type="text"
                  name="state"
                  maxLength="100"
                  placeholder="Enter state"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* SECTION 02 */}
          <section className="request-card">

            <div className="request-card-title">
              <span>02</span>

              <div>
                <h2>Emergency Details</h2>

                <p>
                  Give responders important information about
                  the situation.
                </p>
              </div>
            </div>

            <div className="request-field">

              <label>
                Description <b>*</b>
              </label>

              <textarea
                name="description"
                rows="7"
                maxLength="1000"
                placeholder="Describe what happened, immediate danger, trapped people, injuries, nearby landmarks, etc."
                value={form.description}
                onChange={handleChange}
              />

              <small>
                {form.description.length}/1000 characters
              </small>

            </div>
          </section>

          {/* SUBMIT */}
          <div className="request-submit-area">

            <Link
              to="/citizen-dashboard"
              className="request-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="request-submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting Request..."
                : "🚑 Submit Rescue Request"}
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}

export default RescueRequest;