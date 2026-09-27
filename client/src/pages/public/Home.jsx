import { Link } from "react-router-dom";

function Home() {
  const features = [
    ["📱", "Citizen Reporting", "Submit disaster information including type, severity, location and affected people."],
    ["🧠", "Disaster Intelligence", "AI-assisted analysis helps authorities understand severity, priority and response requirements."],
    ["🚑", "Rescue Coordination", "Manage rescue teams and coordinate emergency operations from one command environment."],
    ["📦", "Resource Management", "Monitor available resources and their operational allocation during emergency response."],
    ["🏠", "Shelter Management", "Manage shelters, capacity and availability for affected communities."],
    ["📢", "Emergency Alerts", "Create and manage disaster alerts for faster public communication."]
  ];

  const workflow = [
    ["01", "📱", "CITIZEN REPORT", "Emergency submitted"],
    ["02", "🗄️", "DATABASE", "Incident recorded"],
    ["03", "🧠", "AI ANALYSIS", "Priority evaluated"],
    ["04", "📊", "INTELLIGENCE", "Decision support"],
    ["05", "🚑", "RESCUE", "Teams coordinated"],
    ["06", "🛡️", "RESPONSE", "Situation monitored"]
  ];

  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="home-navbar">
        <Link to="/" className="home-brand">
          <div className="home-logo">🚨</div>
          <div>
            <strong>RESQ</strong>
            <span>SMART DISASTER MANAGEMENT</span>
          </div>
        </Link>

        <div className="home-nav-links">
          <a href="#intelligence">Intelligence</a>
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#access">Access</a>

          <Link to="/citizen-login">👤 Citizen</Link>
          <Link to="/team-login">🚑 Rescue Team</Link>
          <Link to="/admin/login" className="home-admin-link">
            🛡️ Admin
          </Link>
          <Link to="/citizen-register">Register</Link>
        </div>
      </nav>

      {/* HERO */}
      <main>

        <section className="home-hero">
          <div className="home-hero-content">

            <div className="home-status">
              <span></span>
              RESQ SYSTEM OPERATIONAL
            </div>

            <h1>
              Smart Disaster
              <br />
              <span>Management.</span>
            </h1>

            <h2>
              Emergency Response & Decision Support Platform
            </h2>

            <p>
              <b>One Platform. Faster Response. Safer Communities.</b>{" "}
              RESQ connects citizen reporting, emergency alerts,
              AI-assisted intelligence, rescue coordination,
              shelters and resources into one centralized
              disaster-management ecosystem.
            </p>

            <div className="home-actions">
              <Link to="/citizen-login" className="home-btn home-btn-primary">
                👤 Citizen Login
              </Link>

              <Link to="/team-login" className="home-btn home-btn-secondary">
                🚑 Rescue Team
              </Link>

              <Link to="/admin/login" className="home-btn home-btn-secondary">
                🛡️ Admin Login
              </Link>
            </div>

            <div className="home-stats">
              <div>
                <strong>24/7</strong>
                <span>MONITORING</span>
              </div>
              <div>
                <strong>AI</strong>
                <span>INTELLIGENCE</span>
              </div>
              <div>
                <strong>LIVE</strong>
                <span>RESPONSE</span>
              </div>
            </div>
          </div>

          {/* COMMAND CENTER PREVIEW */}
          <div className="home-command-card">

            <div className="command-top">
              <div className="command-dots">
                <i></i><i></i><i></i>
              </div>
              <span>RESQ COMMAND CENTER</span>
              <b>● LIVE</b>
            </div>

            <div className="command-screen">
              <div className="command-title">
                <strong>Emergency Situation Monitor</strong>
                <small>REAL-TIME</small>
              </div>

              <div className="command-map">
                <div className="map-grid"></div>
                <div className="map-line line-1"></div>
                <div className="map-line line-2"></div>
                <div className="map-line line-3"></div>

                <span className="map-point point-1"></span>
                <span className="map-point point-2"></span>
                <span className="map-point point-3"></span>

                <div className="map-center">
                  <span>●</span>
                  <small>LIVE INCIDENT</small>
                </div>
              </div>
            </div>

            <div className="command-metrics">
              <div>
                <span>ACTIVE INCIDENTS</span>
                <strong>03</strong>
              </div>
              <div>
                <span>RESCUE TEAMS</span>
                <strong>04</strong>
              </div>
              <div>
                <span>RESOURCES</span>
                <strong>08+</strong>
              </div>
            </div>
          </div>
        </section>

        {/* EMERGENCY STRIP */}
        <section className="home-emergency">
          <div>
            <div className="emergency-icon">🚨</div>
            <div>
              <strong>Emergency situation?</strong>
              <span>
                Submit a disaster report directly to the RESQ response system.
              </span>
            </div>
          </div>

          <Link to="/report" className="home-emergency-btn">
            Submit Emergency Report →
          </Link>
        </section>

        {/* FEATURES */}
        <section className="home-section" id="features">
          <span className="home-label">RESQ ECOSYSTEM</span>

          <h2 className="home-section-title">
            One platform for the complete disaster response cycle.
          </h2>

          <p className="home-section-description">
            From citizen reporting to authority response and resource
            coordination, RESQ keeps the complete operational picture connected.
          </p>

          <div className="home-feature-grid">
            {features.map(([icon, title, text]) => (
              <div className="home-feature-card" key={title}>
                <div className="home-feature-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI INTELLIGENCE */}
        <section className="home-section home-intelligence" id="intelligence">
          <span className="home-label">AI-POWERED INTELLIGENCE</span>

          <h2 className="home-section-title">
            Turn disaster data into actionable decisions.
          </h2>

          <p className="home-section-description">
            RESQ's intelligence layer helps authorities prioritize incidents
            and understand the situation before taking action.
          </p>

          <div className="home-intel-grid">

            <div className="home-intel-card">
              <div className="home-feature-icon">🧠</div>
              <h3>Explainable AI Priority</h3>
              <p>
                Incidents are evaluated using severity, affected population,
                injuries and missing-person information to support emergency
                prioritization.
              </p>

              <div className="ai-score-preview">
                <div>
                  <span>AI PRIORITY SCORE</span>
                  <strong>92<span>/100</span></strong>
                </div>
                <div className="ai-level">CRITICAL</div>
              </div>

              <Link to="/intelligence" className="home-intel-link">
                Open Intelligence Command Center →
              </Link>
            </div>

            <div className="home-intel-card">
              <div className="home-feature-icon">📊</div>
              <h3>Situation Overview</h3>
              <p>
                Authorities can monitor incidents, emergency trends,
                response operations, alerts and available resources
                through the intelligence dashboard.
              </p>

              <div className="ai-mini-list">
                <div><span>●</span> Human Impact Analysis</div>
                <div><span>●</span> Severity Assessment</div>
                <div><span>●</span> Response Recommendation</div>
              </div>

              <Link to="/admin/login" className="home-intel-link">
                Admin Command Center →
              </Link>
            </div>

          </div>
        </section>

        {/* WORKFLOW */}
        <section className="home-section" id="workflow">
          <span className="home-label">RESPONSE PIPELINE</span>

          <h2 className="home-section-title">
            From emergency report to coordinated response.
          </h2>

          <p className="home-section-description">
            A connected operational journey from incident reporting to
            emergency response.
          </p>

          <div className="home-workflow">
            {workflow.map(([number, icon, title, text]) => (
              <div className="home-step" key={number}>
                <span className="step-number">{number}</span>
                <div className="step-icon">{icon}</div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            ))}
          </div>
        </section>

        {/* ACCESS */}
        <section className="home-section" id="access">
          <span className="home-label">ACCESS RESQ</span>

          <h2 className="home-section-title">
            Built for citizens and emergency authorities.
          </h2>

          <p className="home-section-description">
            Different responsibilities. One connected disaster-management platform.
          </p>

          <div className="home-access-grid">

            <div className="home-access-card citizen-card">
              <div className="access-icon">👤</div>
              <h3>Citizen Access</h3>
              <p>
                Report disasters, request emergency assistance and access
                available safety resources.
              </p>

              <div className="access-buttons">
                <Link to="/citizen-login">Citizen Login →</Link>
                <Link to="/citizen-register">Create Account</Link>
                <Link to="/rescue-request">Request Rescue</Link>
              </div>
            </div>

            <div className="home-access-card admin-card">
              <div className="access-icon">🛡️</div>
              <h3>Admin / Authority</h3>
              <p>
                Monitor incidents, coordinate rescue teams, manage resources,
                shelters and operate the command center.
              </p>

              <Link to="/admin/login" className="access-main-link">
                Admin Login →
              </Link>
            </div>

            <div className="home-access-card rescue-card">
              <div className="access-icon">🚑</div>
              <h3>Rescue Team</h3>
              <p>
                Monitor assigned incidents and SOS requests, update response
                status and resolve completed rescue operations.
              </p>

              <Link to="/team-login" className="access-main-link">
                Rescue Team Login →
              </Link>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="home-final-cta">
          <div>
            <span className="home-label">READY TO RESPOND?</span>
            <h2>Every second matters during an emergency.</h2>
            <p>
              Report emergencies, request assistance and connect with
              coordinated disaster response through RESQ.
            </p>
          </div>

          <div className="home-cta-buttons">
            <Link to="/report" className="home-btn home-btn-primary">
              🚨 Report Disaster
            </Link>

            <Link to="/rescue-request" className="home-btn home-btn-secondary">
              🚑 Request Rescue
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div>
          <strong>RESQ</strong>
          <span>Smart Disaster Management System</span>
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#intelligence">Intelligence</a>
          <a href="#workflow">Workflow</a>
          <Link to="/admin/login">Admin</Link>
          <Link to="/team-login">Rescue Team</Link>
        </div>

        <div className="footer-status">
          ● System Operational
        </div>

        <div className="footer-bottom">
          © 2026 RESQ • SIH 2026 • Emergency Technology Platform
        </div>
      </footer>

    </div>
  );
}

export default Home;