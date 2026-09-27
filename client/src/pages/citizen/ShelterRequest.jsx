import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ShelterRequest() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    shelter_id: "",
    people_count: "1",
    emergency_reason: "",
  });

  const token = localStorage.getItem("resq_token");

  useEffect(() => {
    const loadShelters = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://resq-smart-disaster-management-system.onrender.com/api/shelters/available",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load available shelters."
          );
        }

        setShelters(data.shelters || []);
      } catch (err) {
        console.error("Shelter loading error:", err);
        setError(err.message || "Unable to load shelters.");
      } finally {
        setLoading(false);
      }
    };

    loadShelters();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const selectedShelter = shelters.find(
    (shelter) => shelter._id === form.shelter_id
  );

  const submitRequest = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const peopleCount = Number(form.people_count);

    if (!form.shelter_id) {
      setError("Please select a shelter.");
      return;
    }

    if (
      !Number.isInteger(peopleCount) ||
      peopleCount < 1 ||
      peopleCount > 100
    ) {
      setError("People count must be between 1 and 100.");
      return;
    }

    if (!form.emergency_reason.trim()) {
      setError("Please explain your emergency situation.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "https://resq-smart-disaster-management-system.onrender.com/api/shelter-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shelter_id: form.shelter_id,
            people_count: peopleCount,
            emergency_reason: form.emergency_reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit shelter request."
        );
      }

      setSuccess(
        "Shelter request submitted successfully. Admin approval is pending."
      );

      setForm({
        shelter_id: "",
        people_count: "1",
        emergency_reason: "",
      });
    } catch (err) {
      console.error("Shelter request error:", err);
      setError(err.message || "Unable to submit shelter request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="resource-request-page">
      <header className="request-header">
        <Link to="/citizen-dashboard" className="request-brand">
          <div className="request-logo">R</div>

          <div>
            <strong>RESQ</strong>
            <span>CITIZEN SHELTER CENTER</span>
          </div>
        </Link>

        <Link to="/citizen-dashboard" className="request-back">
          ← Dashboard
        </Link>
      </header>

      <main className="resource-request-container">
        <div className="resource-request-heading">
          <span>EMERGENCY SHELTER ASSISTANCE</span>

          <h1>Request Emergency Shelter</h1>

          <p>
            Request temporary shelter support from the RESQ emergency
            response network.
          </p>
        </div>

        {error && (
          <div className="resource-request-alert error">
            ⚠ {error}
          </div>
        )}

        {success && (
          <div className="resource-request-alert success">
            ✓ {success}
          </div>
        )}

        <form
          className="resource-request-card"
          onSubmit={submitRequest}
        >
          {/* SECTION 01: SELECT SHELTER */}
          <section className="resource-request-section">
            <div className="resource-request-section-title">
              <span>01</span>

              <div>
                <h2>Select Shelter</h2>
                <p>
                  Choose an available emergency shelter.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="resource-request-loading">
                Loading available shelters...
              </div>
            ) : shelters.length === 0 ? (
              <div className="resource-request-empty">
                <span>🏠</span>

                <div>
                  <strong>No shelters currently available</strong>
                  <p>
                    Please try again later or contact emergency support.
                  </p>
                </div>
              </div>
            ) : (
              <div className="resource-request-grid">
                <div className="resource-request-field full">
                  <label>Emergency Shelter *</label>

                  <select
                    name="shelter_id"
                    value={form.shelter_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select an available shelter
                    </option>

                    {shelters.map((shelter) => (
                      <option
                        key={shelter._id}
                        value={shelter._id}
                      >
                        {shelter.shelter_name} —{" "}
                        {shelter.available_capacity ?? 0} spaces available
                      </option>
                    ))}
                  </select>
                </div>

                {selectedShelter && (
                  <div className="resource-selected-info">
                    <div>
                      <span>SHELTER TYPE</span>
                      <strong>
                        {selectedShelter.shelter_type}
                      </strong>
                    </div>

                    <div>
                      <span>AVAILABLE</span>
                      <strong>
                        {selectedShelter.available_capacity ?? 0} spaces
                      </strong>
                    </div>

                    <div>
                      <span>LOCATION</span>
                      <strong>
                        {selectedShelter.city},{" "}
                        {selectedShelter.state}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION 02: GROUP DETAILS */}
          <section className="resource-request-section">
            <div className="resource-request-section-title">
              <span>02</span>

              <div>
                <h2>Group Details</h2>

                <p>
                  Your name and contact details will be taken
                  automatically from your profile.
                </p>
              </div>
            </div>

            <div className="resource-request-grid">
              <div className="resource-request-field full">
                <label>Number of People *</label>

                <input
                  type="number"
                  name="people_count"
                  min="1"
                  max="100"
                  value={form.people_count}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* SECTION 03: EMERGENCY DETAILS */}
          <section className="resource-request-section">
            <div className="resource-request-section-title">
              <span>03</span>

              <div>
                <h2>Emergency Details</h2>

                <p>
                  Explain why shelter assistance is required.
                </p>
              </div>
            </div>

            <div className="resource-request-field">
              <label>Emergency Reason *</label>

              <textarea
                name="emergency_reason"
                rows="5"
                placeholder="Explain your emergency situation, affected family members, medical needs, or other important details."
                value={form.emergency_reason}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div className="resource-request-actions">
            <Link
              to="/citizen-dashboard"
              className="resource-request-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="resource-request-submit"
              disabled={
                submitting ||
                loading ||
                shelters.length === 0
              }
            >
              {submitting
                ? "Submitting Request..."
                : "🏠 Submit Shelter Request"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ShelterRequest;