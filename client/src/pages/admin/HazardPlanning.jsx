
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://resq-smart-disaster-management-system.onrender.com/api";

const API_URL = `${API_BASE_URL}/hazard-planning/overview`;
const HABITATIONS_URL = `${API_BASE_URL}/hazard-planning/habitations`;

function HazardPlanning() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [form, setForm] = useState({
    habitation_name: "",
    location: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    total_population: "",
    vulnerable_people: "",
    hazard_type: "Flood",
    risk_level: "Orange",
    immediate_relocation_required: false,
    notes: "",
  });

  const loadPlanningData = async () => {
    try {
      setError("");

      const token = localStorage.getItem("resq_token");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load hazard planning data."
        );
      }

      setData(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanningData();
  }, []);

  const handleUseCurrentLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "This browser does not support GPS location."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((previous) => ({
          ...previous,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));

        setLocationMessage(
          "GPS captured. Looking up the address..."
        );

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Address lookup unavailable.");
          }

          const result = await response.json();
          const address = result.address || {};

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "";

          setForm((previous) => ({
            ...previous,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            location: result.display_name || previous.location,
            city: city || previous.city,
            state: address.state || previous.state,
          }));

          setLocationMessage(
            result.display_name
              ? "GPS location captured. Verify the address before saving."
              : "GPS captured. Enter the address, city and state manually."
          );
        } catch {
          setLocationMessage(
            "GPS captured, but address lookup failed. Enter the address manually."
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow browser location access."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Current location is unavailable."
            : "Location request timed out. Please try again.";

        setLocationMessage(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddHabitation = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("resq_token");

      const response = await fetch(HABITATIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          total_population: Number(form.total_population),
          vulnerable_people: Number(form.vulnerable_people),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not add habitation."
        );
      }

      setForm({
        habitation_name: "",
        location: "",
        city: "",
        state: "",
        latitude: "",
        longitude: "",
        total_population: "",
        vulnerable_people: "",
        hazard_type: "Flood",
        risk_level: "Orange",
        immediate_relocation_required: false,
        notes: "",
      });

      setLocationMessage("");
      await loadPlanningData();

      window.alert("Habitation added successfully!");
    } catch (err) {
      window.alert(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const getPriority = (item) => {
    if (
      item.immediate_relocation_required === true ||
      item.relocation_priority === "Immediate"
    ) {
      return "Immediate";
    }

    return item.relocation_priority || "Monitor";
  };

  const priorityRank = {
    Immediate: 4,
    "Short-term": 3,
    "Medium-term": 2,
    Monitor: 1,
  };

  const priorityColor = (priority) => {
    if (priority === "Immediate") return "#ef4444";
    if (priority === "Short-term") return "#f97316";
    if (priority === "Medium-term") return "#eab308";
    return "#22c55e";
  };

  if (loading) {
    return (
      <main className="hazard-planning-page">
        <p>Loading hazard planning data...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="hazard-planning-page">
        <h2>Hazard Planning</h2>
        <p role="alert">{error}</p>
        <button
          type="button"
          className="hazard-primary-button"
          onClick={() => {
            setLoading(true);
            loadPlanningData();
          }}
        >
          Retry
        </button>
        <p>
          <Link to="/admin">Back to Admin Dashboard</Link>
        </p>
      </main>
    );
  }

  const summary = data?.summary || {};

  const cards = [
    ["Habitations Assessed", summary.total_habitations ?? 0],
    ["Total Population", summary.total_population ?? 0],
    ["Vulnerable People", summary.vulnerable_people ?? 0],
    ["Active Incidents", summary.active_disaster_reports ?? 0],
    ["Red Zones", summary.red_zone_count ?? 0],
    ["Immediate Relocation", summary.relocation_required_count ?? 0],
    ["Available Shelter Capacity", summary.available_shelter_capacity ?? 0],
    ["Estimated Capacity Gap", summary.estimated_capacity_gap ?? 0],
  ];

  const habitations = Array.isArray(data?.habitations)
    ? data.habitations
    : [];

  const priorityQueue = [...habitations].sort((a, b) => {
    const priorityDifference =
      (priorityRank[getPriority(b)] || 0) -
      (priorityRank[getPriority(a)] || 0);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return (
      (Number(b.risk_score) || 0) -
      (Number(a.risk_score) || 0)
    );
  });

  const activeReports = Array.isArray(data?.active_reports)
    ? data.active_reports
    : [];

  const shelters = Array.isArray(data?.available_shelters)
    ? data.available_shelters
    : [];

  return (
    <main className="hazard-planning-page">
      <header className="hazard-page-header">
        <Link to="/admin" className="hazard-back-link">
          ← Admin Dashboard
        </Link>

        <h1 className="text-3xl font-bold mt-3">
          Hazard & Relocation Planning
        </h1>

        <p className="mt-2">
          Assess vulnerable habitations, prioritize relocation needs,
          review active disaster reports and compare available shelter capacity.
        </p>

        <button
          type="button"
          className="hazard-location-button"
          onClick={() => {
            setLoading(true);
            loadPlanningData();
          }}
        >
          Refresh Planning Data
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <section className="hazard-stats">
        {cards.map(([label, value]) => (
          <article key={label} className="hazard-stat-card">
            <p className="text-sm">{label}</p>
            <p className="text-2xl font-bold mt-2">
              {Number(value).toLocaleString("en-IN")}
            </p>
          </article>
        ))}
      </section>

      {/* ADD HABITATION */}
      <section className="hazard-panel">
        <h2 className="text-xl font-bold">
          Add Vulnerable Habitation
        </h2>

        <div className="hazard-location-tools">
          <button
            type="button"
            className="hazard-location-button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
          >
            {locating
              ? "Detecting Location..."
              : "◎ Use My Current GPS Location"}
          </button>

          {locationMessage && (
            <p className="hazard-location-message" role="status">
              {locationMessage}
            </p>
          )}
        </div>

        <form onSubmit={handleAddHabitation} className="hazard-form">
          <input
            name="habitation_name"
            placeholder="Habitation name"
            value={form.habitation_name}
            onChange={updateForm}
            required
          />

          <input
            name="location"
            placeholder="Full location / address"
            value={form.location}
            onChange={updateForm}
            required
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={updateForm}
            required
          />

          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={updateForm}
            required
          />

          <input
            name="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="Latitude"
            value={form.latitude}
            onChange={updateForm}
            required
          />

          <input
            name="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="Longitude"
            value={form.longitude}
            onChange={updateForm}
            required
          />

          <input
            name="total_population"
            type="number"
            min="0"
            step="1"
            placeholder="Total population"
            value={form.total_population}
            onChange={updateForm}
            required
          />

          <input
            name="vulnerable_people"
            type="number"
            min="0"
            step="1"
            placeholder="Vulnerable people"
            value={form.vulnerable_people}
            onChange={updateForm}
            required
          />

          <select
            name="hazard_type"
            value={form.hazard_type}
            onChange={updateForm}
          >
            {[
              "Flood",
              "Earthquake",
              "Landslide",
              "Cyclone",
              "Fire",
              "Other",
            ].map((hazard) => (
              <option key={hazard} value={hazard}>
                {hazard}
              </option>
            ))}
          </select>

          <select
            name="risk_level"
            value={form.risk_level}
            onChange={updateForm}
          >
            {["Red", "Orange", "Yellow", "Green"].map((risk) => (
              <option key={risk} value={risk}>
                {risk} Risk
              </option>
            ))}
          </select>

          <label className="hazard-checkbox">
            <input
              type="checkbox"
              name="immediate_relocation_required"
              checked={form.immediate_relocation_required}
              onChange={updateForm}
            />
            Immediate relocation required
          </label>

          <textarea
            name="notes"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={updateForm}
          />

          <button
            type="submit"
            disabled={saving}
            className="hazard-primary-button"
          >
            {saving ? "Saving..." : "Add Habitation"}
          </button>
        </form>
      </section>

      {/* PRIORITY QUEUE */}
      <section className="hazard-panel">
        <h2 className="text-xl font-bold mb-4">
          Priority Relocation Queue
        </h2>

        <p className="mb-4">
          Records are ordered by relocation priority and then by risk score.
          Verify assessments with authorized disaster-response personnel.
        </p>

        {priorityQueue.length > 0 ? (
          <div className="hazard-table-wrap">
            <table className="hazard-table">
              <thead>
                <tr>
                  <th>Habitation</th>
                  <th>Location</th>
                  <th>Hazard</th>
                  <th>Risk Score</th>
                  <th>Priority</th>
                  <th>Vulnerable People</th>
                  <th>Recommendation</th>
                </tr>
              </thead>

              <tbody>
                {priorityQueue.map((item) => {
                  const priority = getPriority(item);

                  return (
                    <tr key={item._id || item.habitation_name}>
                      <td>{item.habitation_name}</td>

                      <td>
                        {[item.location, item.city, item.state]
                          .filter(Boolean)
                          .join(", ")}
                      </td>

                      <td>{item.hazard_type}</td>

                      <td>
                        <strong>
                          {Number(item.risk_score) || 0}/100
                        </strong>
                      </td>

                      <td>
                        <span
                          style={{
                            color: priorityColor(priority),
                            fontWeight: 700,
                          }}
                        >
                          {priority}
                        </span>
                      </td>

                      <td>
                        {Number(item.vulnerable_people) || 0}
                      </td>

                      <td>
                        {item.relocation_recommendation ||
                          "Field assessment recommended."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="hazard-empty">
            No habitation assessments are available yet.
          </p>
        )}
      </section>

      {/* ACTIVE DISASTER REPORTS */}
      <section className="hazard-panel">
        <h2 className="text-xl font-bold mb-4">
          Active Disaster Reports
        </h2>

        {activeReports.length > 0 ? (
          activeReports.map((report) => (
            <article
              key={report._id}
              className="hazard-record"
            >
              <p className="font-semibold">
                {report.disaster_type || "Disaster"} —{" "}
                {report.priority_level || "Priority pending"}
              </p>

              <p>
                {[report.location, report.city, report.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p>
                Severity: {report.severity || "Not specified"} |
                {" "}Status: {report.status || "Unknown"}
              </p>
            </article>
          ))
        ) : (
          <p className="hazard-empty">
            No active disaster reports found.
          </p>
        )}
      </section>

      {/* SHELTER CAPACITY */}
      <section className="hazard-panel">
        <h2 className="text-xl font-bold mb-2">
          Shelter Capacity & Availability
        </h2>

        <p className="mb-4">
          Total currently available capacity:{" "}
          <strong>
            {Number(
              summary.available_shelter_capacity || 0
            ).toLocaleString("en-IN")}
          </strong>
        </p>

        <p className="mb-4">
          Estimated capacity gap:{" "}
          <strong>
            {Number(
              summary.estimated_capacity_gap || 0
            ).toLocaleString("en-IN")}
          </strong>
        </p>

        {shelters.length > 0 ? (
          shelters.map((shelter, index) => (
            <article
              key={`${shelter.shelter_name}-${index}`}
              className="hazard-record"
            >
              <p className="font-semibold">
                {shelter.shelter_name || "Unnamed Shelter"}
              </p>

              <p>
                {[shelter.location, shelter.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p>
                Available capacity:{" "}
                {Number(shelter.available_capacity) || 0}
                {" / "}
                {Number(shelter.capacity) || 0}
              </p>
            </article>
          ))
        ) : (
          <p className="hazard-empty">
            No open shelters are currently listed.
          </p>
        )}

        <p className="mt-4">
          <small>
            Capacity gap is an estimate based on the current backend
            calculation. It does not confirm shelter assignment or evacuation.
          </small>
        </p>
      </section>
    </main>
  );
}

export default HazardPlanning;