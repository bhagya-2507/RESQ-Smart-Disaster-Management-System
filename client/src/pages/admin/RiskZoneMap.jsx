
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const riskColors = {
  Red: "#ef4444",
  Orange: "#f97316",
  Yellow: "#eab308",
  Green: "#22c55e",
};

function RiskZoneMap({ habitations = [] }) {
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;

    const map = L.map(mapElement.current).setView(
      [20.5937, 78.9629],
      5
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markersLayer.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const layer = markersLayer.current;

    if (!map || !layer) return;

    layer.clearLayers();

    const validHabitations = habitations.filter((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180 &&
        !(lat === 0 && lng === 0)
      );
    });

    validHabitations.forEach((item) => {
      const risk = ["Red", "Orange", "Yellow", "Green"].includes(
        item.risk_level
      )
        ? item.risk_level
        : "Orange";

      const color = riskColors[risk];
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 2,
      });

      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.habitation_name || "Unnamed habitation";
      popup.appendChild(title);

      [
        `Risk: ${risk}`,
        `Hazard: ${item.hazard_type || "Not specified"}`,
        `Population: ${Number(item.total_population) || 0}`,
        `Vulnerable people: ${Number(item.vulnerable_people) || 0}`,
        `Risk score: ${Number(item.risk_score) || 0}/100`,
        `Location: ${[item.city, item.state].filter(Boolean).join(", ") || "Not specified"}`,
      ].forEach((line) => {
        const row = document.createElement("div");
        row.textContent = line;
        popup.appendChild(row);
      });

      marker.bindPopup(popup);
      marker.addTo(layer);
    });

    if (validHabitations.length > 0) {
      const bounds = L.latLngBounds(
        validHabitations.map((item) => [
          Number(item.latitude),
          Number(item.longitude),
        ])
      );

      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    } else {
      map.setView([20.5937, 78.9629], 5);
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [habitations]);

  return (
    <section className="hazard-panel">
      <h2 className="text-xl font-bold mb-2">Hazard Risk Zone Map</h2>

      <p className="mb-4">
        Select a marker to view the habitation's risk and population details.
        Only records with valid coordinates appear on the map.
      </p>

      <div className="risk-map-legend">
        {Object.entries(riskColors).map(([risk, color]) => (
          <span key={risk} className="risk-map-legend-item">
            <span
              className="risk-map-dot"
              style={{ backgroundColor: color }}
            />
            {risk} Risk
          </span>
        ))}
      </div>

      <div
  ref={mapElement}
  className="risk-zone-map"
  role="application"
  aria-label="Map of assessed habitation risk zones"
  style={{
    width: "100%",
    height: "420px",
    minHeight: "320px",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    zIndex: 0,
  }}
/>

      <p className="mt-2">
        <small>
          Map markers display recorded assessment data. They are not
          independently verified hazard boundaries.
        </small>
      </p>
    </section>
  );
}

export default RiskZoneMap;