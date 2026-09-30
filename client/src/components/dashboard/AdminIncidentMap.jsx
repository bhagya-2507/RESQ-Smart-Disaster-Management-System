import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://resq-smart-disaster-management-system.onrender.com/api";

function AdminIncidentMap({
  reports = [],
  rescueRequests = [],
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);

  const [mappedCount, setMappedCount] = useState(0);
  const [habitations, setHabitations] = useState([]);

  // Load verified habitation risk records without interrupting the incident map.
  useEffect(() => {
    let cancelled = false;

    const loadHabitations = async () => {
      try {
        const token = localStorage.getItem("resq_token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/hazard-planning/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const result = await response.json();
        if (!cancelled) {
          setHabitations(Array.isArray(result.habitations) ? result.habitations : []);
        }
      } catch (error) {
        // Keep existing incident/rescue markers usable if the optional endpoint fails.
        console.warn("RESQ map: habitation risk data unavailable.", error);
      }
    };

    loadHabitations();
    return () => { cancelled = true; };
  }, []);

  // =====================================================
  // CITY FALLBACK COORDINATES
  // =====================================================

  const getCityCoordinates = (city = "") => {
    const name = city.toLowerCase().trim();

    const cities = {
      ghaziabad: [28.6692, 77.4538],
      delhi: [28.6139, 77.209],
      "new delhi": [28.6139, 77.209],
      noida: [28.5355, 77.391],
      gurgaon: [28.4595, 77.0266],
      gurugram: [28.4595, 77.0266],
      faridabad: [28.4089, 77.3178],
      meerut: [28.9845, 77.7064],
    };

    return cities[name] || [28.6692, 77.4538];
  };

  // =====================================================
  // INITIALIZE MAP
  // =====================================================

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      [28.6692, 77.4538],
      10
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }
    ).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markerLayerRef.current = markerLayer;

    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // =====================================================
  // CREATE INCIDENT MARKERS
  // =====================================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) return;

    let cancelled = false;

    const createMarkers = async () => {
      markerLayer.clearLayers();

      const incidents = [
        ...reports.map((report) => ({
          id: `report-${report._id}`,
          type: "Disaster Report",
          title: report.disaster_type,
          location: report.location,
          city: report.city,
          state: report.state,
          severity:
            report.priority_level ||
            report.severity ||
            "Medium",
          status: report.status,
          latitude: report.latitude,
          longitude: report.longitude,
        })),

        ...rescueRequests.map((request) => ({
          id: `request-${request._id}`,
          type: "Rescue Request",
          title: request.disaster_type,
          location: request.location,
          city: request.city,
          state: request.state,
          severity:
            request.severity || "High",
          status: request.status,
          latitude: request.latitude,
          longitude: request.longitude,
        })),
      ];

      // Same-location counter
      const coordinateCounts = {};

      let count = 0;

      for (const incident of incidents) {
        if (cancelled) return;

        let latitude = null;
        let longitude = null;
        let locationSource = "GPS";

        // =================================================
        // 1. USE SAVED GPS IF ACTUALLY PRESENT
        // =================================================

        const hasCoordinates =
          incident.latitude !== null &&
          incident.latitude !== undefined &&
          incident.latitude !== "" &&
          incident.longitude !== null &&
          incident.longitude !== undefined &&
          incident.longitude !== "";

        if (hasCoordinates) {
          const lat = Number(incident.latitude);
          const lng = Number(incident.longitude);

          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat !== 0 &&
            lng !== 0
          ) {
            latitude = lat;
            longitude = lng;
          }
        }

        // =================================================
        // 2. ADDRESS GEOCODING
        // =================================================

        if (
          latitude === null ||
          longitude === null
        ) {
          try {
            const addressText = [
              incident.location,
              incident.city,
              incident.state,
              "India",
            ]
              .filter(Boolean)
              .join(", ");

            const url =
              "https://nominatim.openstreetmap.org/search" +
              `?format=jsonv2&limit=1&q=${encodeURIComponent(
                addressText
              )}`;

            const response = await fetch(url);

            if (response.ok) {
              const data = await response.json();

              if (data.length > 0) {
                const lat = Number(data[0].lat);
                const lng = Number(data[0].lon);

                if (
                  Number.isFinite(lat) &&
                  Number.isFinite(lng)
                ) {
                  latitude = lat;
                  longitude = lng;
                  locationSource = "Address";
                }
              }
            }
          } catch (error) {
            console.warn(
              "Address geocoding failed:",
              incident.location
            );
          }
        }

        // =================================================
        // 3. CITY FALLBACK
        // =================================================

        if (
          latitude === null ||
          longitude === null
        ) {
          const cityCoordinates =
            getCityCoordinates(incident.city);

          latitude = cityCoordinates[0];
          longitude = cityCoordinates[1];

          locationSource = "City";
        }

        // =================================================
        // 4. SEPARATE OVERLAPPING MARKERS
        // =================================================

        const key =
          `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

        const index =
          coordinateCounts[key] || 0;

        coordinateCounts[key] = index + 1;

        if (index > 0) {
          const angle =
            (index * 72) *
            (Math.PI / 180);

          const offset = 0.00045;

          latitude +=
            Math.sin(angle) * offset;

          longitude +=
            Math.cos(angle) * offset;
        }

        // =================================================
        // 5. SEVERITY COLOR
        // =================================================

        const severity =
          String(
            incident.severity || "MEDIUM"
          ).toUpperCase();

        let markerColor = "#f5c542";

        if (severity === "CRITICAL") {
          markerColor = "#ff334f";
        } else if (severity === "HIGH") {
          markerColor = "#ff8a3d";
        } else if (severity === "MEDIUM") {
          markerColor = "#f5c542";
        } else if (severity === "LOW") {
          markerColor = "#45d483";
        }

        // =================================================
        // 6. CREATE MARKER
        // =================================================

        const marker = L.circleMarker(
          [latitude, longitude],
          {
            radius: 10,
            color: "#ffffff",
            weight: 2,
            fillColor: markerColor,
            fillOpacity: 0.95,
          }
        );

        // =================================================
        // 7. POPUP
        // =================================================

        marker.bindPopup(`
          <div style="
            min-width:230px;
            font-family:Arial,sans-serif;
            line-height:1.6;
          ">

            <strong style="
              font-size:16px;
            ">
              ${incident.title || "Incident"}
            </strong>

            <br/><br/>

            <strong>Type:</strong>
            ${incident.type}

            <br/>

            <strong>Severity:</strong>
            ${incident.severity || "N/A"}

            <br/>

            <strong>Status:</strong>
            ${incident.status || "N/A"}

            <br/>

            <strong>Location:</strong>
            ${incident.location || "N/A"}

            <br/>

            <strong>City:</strong>
            ${incident.city || "N/A"}

            <br/><br/>

            <strong>Coordinates:</strong>
            ${latitude.toFixed(6)},
            ${longitude.toFixed(6)}

            <br/>

            <strong>Location Source:</strong>
            ${locationSource}

          </div>
        `);

        marker.addTo(markerLayer);

        count++;
      }

      // =================================================
      // 8. VULNERABLE HABITATION / HAZARD ZONE OVERLAYS
      // Use saved coordinates only; never invent a habitation location.
      // =================================================
      let habitationCount = 0;

      for (const habitation of habitations) {
        if (cancelled) return;

        const latitude = Number(habitation.latitude);
        const longitude = Number(habitation.longitude);
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 || latitude > 90 ||
          longitude < -180 || longitude > 180
        ) continue;

        const risk = String(habitation.risk_level || "Orange").toLowerCase();
        const zoneColor = risk === "red" ? "#ff334f"
          : risk === "orange" ? "#ff8a3d"
          : risk === "yellow" ? "#f5c542" : "#45d483";
        const population = Number(habitation.total_population || 0);
        const zone = L.circle([latitude, longitude], {
          radius: 300 + Math.min(900, Math.max(0, population)),
          color: zoneColor,
          fillColor: zoneColor,
          fillOpacity: 0.22,
          weight: 2,
        });

        const safe = (value) => String(value ?? "N/A").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        }[char]));

        zone.bindPopup(`
          <div style="min-width:230px;font-family:Arial,sans-serif;line-height:1.6">
            <strong style="font-size:16px">${safe(habitation.habitation_name || "Vulnerable Habitation")}</strong><br/><br/>
            <strong>Map layer:</strong> Hazard / Vulnerable Habitation<br/>
            <strong>Risk level:</strong> ${safe(habitation.risk_level || "Orange")}<br/>
            <strong>Hazard:</strong> ${safe(habitation.hazard_type)}<br/>
            <strong>Population:</strong> ${safe(habitation.total_population)}<br/>
            <strong>Vulnerable people:</strong> ${safe(habitation.vulnerable_people)}<br/>
            <strong>Relocation:</strong> ${habitation.immediate_relocation_required ? "Required" : "Review required"}<br/>
            <strong>Location:</strong> ${safe([habitation.location, habitation.city, habitation.state].filter(Boolean).join(", "))}
          </div>
        `);
        zone.addTo(markerLayer);
        habitationCount++;
      }

      if (cancelled) return;

      setMappedCount(count + habitationCount);

      // Keep the original dashboard view stable.
      map.invalidateSize();

      console.log(
        "RESQ MAP — INCIDENTS:",
        incidents.length
      );

      console.log(
        "RESQ MAP — MARKERS:",
        count
      );
    };

    createMarkers();

    return () => {
      cancelled = true;
    };
  }, [reports, rescueRequests, habitations]);

  // =====================================================
  // FIT ALL INCIDENTS
  // =====================================================

  const fitAllIncidents = () => {
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) return;

    const layers = markerLayer.getLayers();

    if (!layers.length) return;

    const group = L.featureGroup(layers);

    map.fitBounds(group.getBounds(), {
      padding: [60, 60],
      maxZoom: 13,
    });
  };

  return (
    <section className="admin-panel admin-map-panel">

      {/* HEADER */}
      <div className="admin-map-header">

        <div>
          <span className="admin-eyebrow">
            LIVE SITUATIONAL AWARENESS
          </span>

          <h2>Incident Map</h2>

          <p>
            Geographic view of active incidents, rescue requests and vulnerable habitation risk zones.
          </p>
        </div>

        <div className="admin-map-count">
          {mappedCount} MAPPED
        </div>

      </div>

      {/* MAP */}
      <div className="admin-map-container">

        <div
          ref={mapRef}
          className="admin-incident-map"
        />

        {/* FIT BUTTON */}
        <button
          type="button"
          className="admin-map-fit-btn"
          onClick={fitAllIncidents}
        >
          ⛶ Fit All Incidents
        </button>

        {/* LEGEND */}
        <div className="admin-map-legend">

          <strong>SEVERITY</strong>

          <div>
            <span
              className="legend-dot critical"
            ></span>
            Critical
          </div>

          <div>
            <span
              className="legend-dot high"
            ></span>
            High
          </div>

          <div>
            <span
              className="legend-dot medium"
            ></span>
            Medium
          </div>

          <div>
            <span
              className="legend-dot low"
            ></span>
            Low
          </div>

          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #334155" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #ff334f", background: "rgba(255,51,79,.25)", marginRight: 5 }}></span>
            Red hazard zone
          </div>
          <div>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #ff8a3d", background: "rgba(255,138,61,.25)", marginRight: 5 }}></span>
            Orange hazard zone
          </div>
          <div>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #f5c542", background: "rgba(245,197,66,.25)", marginRight: 5 }}></span>
            Yellow hazard zone
          </div>

        </div>

      </div>
    </section>
  );
}

export default AdminIncidentMap;