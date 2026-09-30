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

  useEffect(() => {
    const loadPlanningData = async () => {
      try {
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

    loadPlanningData();
  }, []);
  const handleUseCurrentLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("This browser does not support GPS location.");
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
        setLocationMessage("GPS captured. Looking up the address…");

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error("Address lookup unavailable.");

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
              ? "Location filled from GPS. Please verify the address before saving."
              : "GPS coordinates captured. Enter the address, city and state manually."
          );
        } catch {
          setLocationMessage(
            "GPS coordinates captured, but address lookup failed. Please enter address, city and state manually."
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Allow location access in your browser and try again."
            : error.code === error.POSITION_UNAVAILABLE
            ? "Current location is unavailable. Check your device location settings."
            : "Location request timed out. Please try again.";

        setLocationMessage(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleAddHabitation = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    const token = localStorage.getItem("resq_token");

    const response = await fetch(
      HABITATIONS_URL,
      {
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
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not add habitation.");
    }

    alert("Habitation added successfully!");
    window.location.reload();
  } catch (err) {
    alert(err.message || "Something went wrong.");
  } finally {
    setSaving(false);
  }
};

const updateForm = (e) => {
  const { name, value, type, checked } = e.target;

  setForm((previous) => ({
    ...previous,
    [name]: type === "checkbox" ? checked : value,
  }));
};

  if (loading) {
    return <main className="p-6">Loading hazard planning data...</main>;
  }

  if (error) {
    return (
      <main className="p-6">
        <h2>Hazard Planning</h2>
        <p role="alert">{error}</p>
        <p>Confirm that the backend deployment contains the new API.</p>
        <Link to="/admin">Back to Admin Dashboard</Link>
      </main>
    );
  }

  const summary = data?.summary || {};

  const cards = [
    ["Habitations Assessed", summary.total_habitations ?? 0],
    ["Population", summary.total_population ?? 0],
    ["Vulnerable People", summary.vulnerable_people ?? 0],
    ["Active Incidents", summary.active_disaster_reports ?? 0],
    ["Red Zones", summary.red_zone_count ?? 0],
    ["Relocation Required", summary.relocation_required_count ?? 0],
    ["Available Shelter Capacity", summary.available_shelter_capacity ?? 0],
    ["Estimated Capacity Gap", summary.estimated_capacity_gap ?? 0],
  ];

  return (
    <main className="hazard-planning-page">
      <div className="hazard-page-header">
        <Link to="/admin" className="hazard-back-link">
  ← Admin Dashboard
</Link>
<h1 className="text-3xl font-bold mt-3">
          Hazard & Relocation Planning
        </h1>
        <p className="mt-2">
          Review reported incidents, vulnerable habitations and shelter
          capacity to support emergency relocation decisions.
        </p>
      </div>
      
<section className="hazard-panel">
  <h2 className="text-xl font-bold">Add Vulnerable Habitation</h2>

  <div className="hazard-location-tools">
    <button
      type="button"
      className="hazard-location-button"
      onClick={handleUseCurrentLocation}
      disabled={locating}
    >
      {locating ? "Detecting Location…" : "◎ Use My Current GPS Location"}
    </button>
    {locationMessage && (
      <p className="hazard-location-message" role="status">
        {locationMessage}
      </p>
    )}
  </div>

  <form
    onSubmit={handleAddHabitation}
    className="hazard-form"
  >
    <input name="habitation_name" placeholder="Habitation name" value={form.habitation_name} onChange={updateForm} required className="border rounded-lg p-3" />
    <input name="location" placeholder="Full location / address" value={form.location} onChange={updateForm} required className="border rounded-lg p-3" />
    <input name="city" placeholder="City" value={form.city} onChange={updateForm} required className="border rounded-lg p-3" />
    <input name="state" placeholder="State" value={form.state} onChange={updateForm} required className="border rounded-lg p-3" />

    <input name="latitude" type="number" step="any" min="-90" max="90" placeholder="Latitude" value={form.latitude} onChange={updateForm} required className="border rounded-lg p-3" />
    <input name="longitude" type="number" step="any" min="-180" max="180" placeholder="Longitude" value={form.longitude} onChange={updateForm} required className="border rounded-lg p-3" />

    <input name="total_population" type="number" min="0" step="1" placeholder="Total population" value={form.total_population} onChange={updateForm} required className="border rounded-lg p-3" />
    <input name="vulnerable_people" type="number" min="0" step="1" placeholder="Vulnerable people" value={form.vulnerable_people} onChange={updateForm} required className="border rounded-lg p-3" />

    <select name="hazard_type" value={form.hazard_type} onChange={updateForm} className="border rounded-lg p-3">
      {["Flood", "Earthquake", "Landslide", "Cyclone", "Fire", "Other"].map((hazard) => (
        <option key={hazard} value={hazard}>{hazard}</option>
      ))}
    </select>

    <select name="risk_level" value={form.risk_level} onChange={updateForm} className="border rounded-lg p-3">
      {["Red", "Orange", "Yellow", "Green"].map((risk) => (
        <option key={risk} value={risk}>{risk} Risk</option>
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
      className="border rounded-lg p-3"
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

      <section className="hazard-panel">
        <h2 className="text-xl font-bold mb-4">
          Vulnerable Habitations & Risk Zones
        </h2>

        {data.habitations?.length ? (
          
          <div className="hazard-table-wrap">
            <table className="hazard-table">
              <thead>
                <tr>
                  <th className="p-2">Habitation</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Hazard</th>
                  <th className="p-2">Population</th>
                  <th className="p-2">Vulnerable</th>
                  <th className="p-2">Risk</th>
                  <th className="p-2">Relocation</th>
                </tr>
              </thead>
              <tbody>
                {data.habitations.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-2">{item.habitation_name}</td>
                    <td className="p-2">
                      {[item.location, item.city, item.state]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="p-2">{item.hazard_type}</td>
                    <td className="p-2">{item.total_population}</td>
                    <td className="p-2">{item.vulnerable_people}</td>
                    <td className="p-2">
                      <span
                        className={
                          item.risk_level === "Red"
                            ? "text-red-700 font-bold"
                            : item.risk_level === "Orange"
                            ? "text-orange-600 font-bold"
                            : item.risk_level === "Yellow"
                            ? "text-yellow-700 font-bold"
                            : "text-green-700 font-bold"
                        }
                      >
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="p-2">
                      {item.immediate_relocation_required ? "Required" : "Review"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="hazard-empty">
            No habitation records yet. Add verified habitation data to begin
            assessing relocation needs.
          </p>
        )}
      </section>

      <section className="hazard-panel">
        <h2 className="text-xl font-bold mb-4">
          Active Disaster Reports
        </h2>

        {data.active_reports?.length ? (
          data.active_reports.map((report) => (
            <article key={report._id} className="hazard-record">
              <p className="font-semibold">
                {report.disaster_type} — {report.priority_level}
              </p>
              <p>
                {[report.location, report.city, report.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                Severity: {report.severity} | Status: {report.status}
              </p>
            </article>
          ))
        ) : (
          <p className="hazard-empty">No active disaster reports found.</p>
        )}
      </section>

      <section className="hazard-panel">
        <h2 className="text-xl font-bold mb-4">Available Shelters</h2>

        {data.available_shelters?.length ? (
          data.available_shelters.map((shelter, index) => (
            <article
              key={`${shelter.shelter_name}-${index}`}
              className="hazard-record"
            >
              <p className="font-semibold">{shelter.shelter_name}</p>
              <p>
                {[shelter.location, shelter.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                Available: {shelter.available_capacity} / {shelter.capacity}
              </p>
            </article>
          ))
        ) : (
          <p className="hazard-empty">No open shelters with capacity are currently listed.</p>
        )}
      </section>
    </main>
  );
}

export default HazardPlanning;