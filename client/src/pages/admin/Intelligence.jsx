import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function Intelligence() {
  const [reports, setReports] = useState([]);
  const [rescueRequests, setRescueRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resq_token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reportsRes, requestsRes] = await Promise.all([
          fetch("https://resq-smart-disaster-management-system.onrender.com/api/reports/admin", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("https://resq-smart-disaster-management-system.onrender.com/api/rescue-requests/admin", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const reportsData = await reportsRes.json();
        const requestsData = await requestsRes.json();

        if (!reportsRes.ok) {
          throw new Error(
            reportsData.message || "Unable to load reports."
          );
        }

        if (!requestsRes.ok) {
          throw new Error(
            requestsData.message || "Unable to load rescue requests."
          );
        }

        setReports(reportsData.reports || []);
        setRescueRequests(requestsData.requests || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  /* =====================================================
     KPI DATA
  ===================================================== */

  const critical = reports.filter(
  (r) =>
    r.priority_level === "CRITICAL" &&
    r.status !== "Resolved" &&
    r.status !== "Rejected"
).length;

const high = reports.filter(
  (r) =>
    r.priority_level === "HIGH" &&
    r.status !== "Resolved" &&
    r.status !== "Rejected"
).length;

  const activeIncidents = reports.filter(
    (r) =>
      r.status === "Pending" ||
      r.status === "Under Review" ||
      r.status === "Response Dispatched"
  ).length;

  const affectedPeople = reports.reduce(
    (sum, r) => sum + Number(r.affected_people || 0),
    0
  );

  const resolved =
  reports.filter(
    (r) => r.status === "Resolved"
  ).length +
  rescueRequests.filter(
    (r) => r.status === "Resolved"
  ).length;

  /* =====================================================
     DISASTER TYPE CHART
  ===================================================== */

  const typeData = useMemo(() => {
    const counts = {};

    reports.forEach((report) => {
      const type = report.disaster_type || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [
  {
    data: Object.values(counts),

    backgroundColor: [
      "#ff5b61",
      "#ff9f43",
      "#6c8cff",
      "#36d6a0",
      "#b084ff",
      "#54b8ff",
    ],

    borderColor: "#101a2a",
    borderWidth: 3,

    hoverOffset: 8,
  },
],
      
    };
  }, [reports]);

  /* =====================================================
     STATUS CHART
  ===================================================== */

  const statusData = useMemo(() => {
    const statuses = [
      "Pending",
      "Under Review",
      "Response Dispatched",
      "Resolved",
      "Rejected",
    ];

    const counts = statuses.map(
      (status) =>
        reports.filter((r) => r.status === status).length
    );

    return {
      labels: statuses,
      datasets: [
  {
    data: counts,

    backgroundColor: [
      "#ff9f43",
      "#6c8cff",
      "#54b8ff",
      "#36d6a0",
      "#ff5b61",
    ],

    borderColor: "#101a2a",
    borderWidth: 3,

    hoverOffset: 8,
  },
],
    };
  }, [reports]);

  /* =====================================================
     PRIORITY DATA
  ===================================================== */

  const priorityData = {
  labels: ["Critical", "High", "Medium", "Low"],
  datasets: [
    {
      label: "Incidents",
      data: [
        reports.filter(
          (r) =>
            r.priority_level === "CRITICAL" &&
            r.status !== "Resolved" &&
            r.status !== "Rejected"
        ).length,

        reports.filter(
          (r) =>
            r.priority_level === "HIGH" &&
            r.status !== "Resolved" &&
            r.status !== "Rejected"
        ).length,

        reports.filter(
          (r) =>
            r.priority_level === "MEDIUM" &&
            r.status !== "Resolved" &&
            r.status !== "Rejected"
        ).length,

        reports.filter(
          (r) =>
            r.priority_level === "LOW" &&
            r.status !== "Resolved" &&
            r.status !== "Rejected"
        ).length,
      ],

      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.12)",

      pointBackgroundColor: "#ef4444",
      pointBorderColor: "#ffffff",
      pointRadius: 4,

      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
  ],
};
  /* =====================================================
     TOP AFFECTED AREAS
  ===================================================== */

  const affectedAreas = useMemo(() => {
    const areas = {};

    reports.forEach((report) => {
      const city = report.city || "Unknown";

      areas[city] =
        (areas[city] || 0) +
        Number(report.affected_people || 0);
    });

    return Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [reports]);

  /* =====================================================
     AI RECOMMENDATIONS
  ===================================================== */

  const recommendations = useMemo(() => {
    const result = [];

    const criticalReports = reports.filter(
      (r) => r.priority_level === "CRITICAL"
    );

    const highReports = reports.filter(
      (r) => r.priority_level === "HIGH"
    );

    if (criticalReports.length > 0) {
      result.push({
        icon: "🚨",
        title: "Immediate Response Required",
        text: `${criticalReports.length} critical incident(s) require immediate emergency response.`,
        type: "critical",
      });
    }

    if (highReports.length > 0) {
      result.push({
        icon: "⚠️",
        title: "High Priority Operations",
        text: `${highReports.length} high-priority incident(s) should remain under active rescue coordination.`,
        type: "high",
      });
    }

    if (affectedPeople > 0) {
      result.push({
        icon: "👥",
        title: "Human Impact Monitoring",
        text: `${affectedPeople} people are currently recorded as affected across reported incidents.`,
        type: "people",
      });
    }

    if (rescueRequests.length > 0) {
      const pendingRequests =
        rescueRequests.filter(
          (r) => r.status === "Pending"
        ).length;

      if (pendingRequests > 0) {
        result.push({
          icon: "🚑",
          title: "Pending Rescue Requests",
          text: `${pendingRequests} citizen rescue request(s) are awaiting response.`,
          type: "request",
        });
      }
    }

    if (result.length === 0) {
      result.push({
        icon: "🧠",
        title: "System Monitoring",
        text: "No immediate high-risk pattern detected from the available incident data.",
        type: "normal",
      });
    }

    return result;
  }, [reports, rescueRequests, affectedPeople]);

  /* =====================================================
     CHART OPTIONS
  ===================================================== */

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#aebed1",
          padding: 16,
          usePointStyle: true,
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#aebed1",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#71839b",
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#71839b",
          precision: 0,
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="intelligence-page">
        <div className="intelligence-loading">
          Loading AI Intelligence Center...
        </div>
      </div>
    );
  }

  return (
    <div className="intelligence-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="intelligence-header">

        <div className="intelligence-title-area">

          <div className="intelligence-icon">
            🧠
          </div>

          <div>
            <div className="intelligence-eyebrow">
              RESQ INTELLIGENCE CENTER
            </div>

            <h1>AI Decision Intelligence</h1>

            <p>
              Real-time insights. Smarter decisions. Safer communities.
            </p>
          </div>

        </div>

        <div className="intelligence-header-actions">

          <div className="system-online">
            <span></span>
            System Online
          </div>

          <Link
            to="/admin"
            className="intelligence-back-btn"
          >
            ← Dashboard
          </Link>

        </div>

      </header>

      {error && (
        <div className="intelligence-error">
          {error}
        </div>
      )}

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="intelligence-kpis">

        <div className="intelligence-kpi critical">
          <div className="kpi-icon">🚨</div>
          <div>
            <span>CRITICAL</span>
            <strong>{critical}</strong>
            <small>Immediate response</small>
          </div>
        </div>

        <div className="intelligence-kpi high">
          <div className="kpi-icon">⚠️</div>
          <div>
            <span>HIGH PRIORITY</span>
            <strong>{high}</strong>
            <small>Needs attention</small>
          </div>
        </div>

        <div className="intelligence-kpi active">
          <div className="kpi-icon">📡</div>
          <div>
            <span>ACTIVE INCIDENTS</span>
            <strong>{activeIncidents}</strong>
            <small>Under response</small>
          </div>
        </div>

        <div className="intelligence-kpi people">
          <div className="kpi-icon">👥</div>
          <div>
            <span>PEOPLE AFFECTED</span>
            <strong>{affectedPeople}</strong>
            <small>Across all reports</small>
          </div>
        </div>

        <div className="intelligence-kpi teams">
          <div className="kpi-icon">🚑</div>
          <div>
            <span>RESOLVED</span>
            <strong>{resolved}</strong>
            <small>Cases completed</small>
          </div>
        </div>

      </section>

      {/* =================================================
          CHART ROW
      ================================================= */}

      <section className="intelligence-chart-grid">

        {/* INCIDENT TREND */}

        <div className="intelligence-panel chart-large">

          <div className="panel-heading">
            <div>
              <span>INCIDENT ANALYTICS</span>
              <h2>Priority Distribution</h2>
            </div>

            <div className="live-badge">
              LIVE DATA
            </div>
          </div>

          <div className="chart-box">
            <Line
              data={priorityData}
              options={lineOptions}
            />
          </div>

        </div>

        {/* DISASTER TYPE */}

        <div className="intelligence-panel">

          <div className="panel-heading">
            <div>
              <span>CLASSIFICATION</span>
              <h2>Disaster Type Distribution</h2>
            </div>
          </div>

          <div className="chart-box doughnut">
            {reports.length > 0 ? (
              <Doughnut
                data={typeData}
                options={doughnutOptions}
              />
            ) : (
              <div className="chart-empty">
                No incident data
              </div>
            )}
          </div>

        </div>

        {/* STATUS */}

        <div className="intelligence-panel">

          <div className="panel-heading">
            <div>
              <span>OPERATIONS</span>
              <h2>Incident Status</h2>
            </div>
          </div>

          <div className="chart-box doughnut">
            {reports.length > 0 ? (
              <Doughnut
                data={statusData}
                options={doughnutOptions}
              />
            ) : (
              <div className="chart-empty">
                No incident data
              </div>
            )}
          </div>

        </div>

      </section>

      {/* =================================================
          LOWER ANALYTICS
      ================================================= */}

      <section className="intelligence-lower-grid">

        {/* AFFECTED AREAS */}

        <div className="intelligence-panel">

          <div className="panel-heading">
            <div>
              <span>GEOGRAPHIC ANALYSIS</span>
              <h2>Top Affected Areas</h2>
            </div>

            <span className="analysis-label">
              BY PEOPLE
            </span>
          </div>

          <div className="area-list">

            {affectedAreas.length === 0 ? (
              <div className="chart-empty">
                No area data available.
              </div>
            ) : (
              affectedAreas.map(
                ([city, count], index) => {

                  const max =
                    affectedAreas[0][1] || 1;

                  const width =
                    (count / max) * 100;

                  return (
                    <div
                      className="area-row"
                      key={city}
                    >
                      <div className="area-info">
                        <span>{city}</span>
                        <strong>{count}</strong>
                      </div>

                      <div className="area-track">
                        <div
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

        {/* AI RISK */}

        <div className="intelligence-panel risk-panel">

          <div className="panel-heading">
            <div>
              <span>AI RISK ANALYSIS</span>
              <h2>Current Risk Assessment</h2>
            </div>

            <span className="ai-badge">
              AI ACTIVE
            </span>
          </div>

          <div className="risk-content">

            <div className="risk-score">
              <div>
                <span>ACTIVE RISK LEVEL</span>
                <strong>
                  {critical > 0
                    ? "CRITICAL"
                    : high > 0
                    ? "HIGH"
                    : activeIncidents > 0
                    ? "MEDIUM"
                    : "LOW"}
                </strong>
              </div>

              <div className="risk-circle">
                {Math.min(
                  100,
                  critical * 25 +
                    high * 12 +
                    activeIncidents * 5
                )}
                <small>/100</small>
              </div>

            </div>

            <p>
              Risk assessment is calculated from incident
              priority, active operations and reported human
              impact.
            </p>

            <div className="risk-note">
              🧠 Decision-support recommendation updates as
              new incidents are reported.
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          AI RECOMMENDATIONS
      ================================================= */}

      <section className="intelligence-panel recommendations-panel">

        <div className="panel-heading">

          <div>
            <span>DECISION SUPPORT</span>
            <h2>AI Recommendations</h2>
          </div>

          <div className="ai-status">
            <span></span>
            Rule-Based AI Active
          </div>

        </div>

        <div className="recommendation-list">

          {recommendations.map(
            (recommendation, index) => (
              <div
                className={`recommendation-card ${recommendation.type}`}
                key={index}
              >

                <div className="recommendation-icon">
                  {recommendation.icon}
                </div>

                <div>
                  <h3>
                    {recommendation.title}
                  </h3>

                  <p>
                    {recommendation.text}
                  </p>
                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* =================================================
          RECENT HIGH PRIORITY
      ================================================= */}

      <section className="intelligence-panel">

        <div className="panel-heading">

          <div>
            <span>FIELD OPERATIONS</span>
            <h2>Recent High-Priority Incidents</h2>
          </div>

          <Link
            to="/admin/reports"
            className="view-all"
          >
            View All →
          </Link>

        </div>

        <div className="intelligence-table-wrapper">

          {reports.filter(
            (r) =>
              r.priority_level === "CRITICAL" ||
              r.priority_level === "HIGH"
          ).length === 0 ? (
            <div className="chart-empty">
              No high-priority incidents.
            </div>
          ) : (
            <table className="intelligence-table">

              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>LOCATION</th>
                  <th>PEOPLE</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>

                {reports
                  .filter(
                    (r) =>
                      r.priority_level === "CRITICAL" ||
                      r.priority_level === "HIGH"
                  )
                  .slice(0, 6)
                  .map((report) => (
                    <tr key={report._id}>

                      <td>
                        <strong>
                          {report.disaster_type}
                        </strong>
                      </td>

                      <td>
                        {report.city},{" "}
                        {report.state}
                      </td>

                      <td>
                        {report.affected_people || 0}
                      </td>

                      <td>
                        <span
                          className={`priority-pill ${String(
                            report.priority_level
                          ).toLowerCase()}`}
                        >
                          {report.priority_level}
                        </span>
                      </td>

                      <td>
                        <span className="status-pill">
                          {report.status}
                        </span>
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>
          )}

        </div>

      </section>

    </div>
  );
}

export default Intelligence;