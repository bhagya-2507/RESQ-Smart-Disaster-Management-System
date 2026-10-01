
import { Link } from "react-router-dom";

function Home() {
  const capabilities = [
    {
      icon: "🗺️",
      title: "Hazard-Based Red Zones",
      tag: "01 · IDENTIFY",
      description:
        "Review habitation locations, recorded hazard types, risk classifications and vulnerable communities on a geographic risk map.",
    },
    {
      icon: "👥",
      title: "Carrying Capacity Assessment",
      tag: "02 · ASSESS",
      description:
        "Compare estimated relocation demand with available shelter capacity and highlight potential capacity gaps.",
    },
    {
      icon: "🚨",
      title: "Immediate Relocation Needs",
      tag: "03 · PRIORITIZE",
      description:
        "Organize assessed habitations by risk score and relocation priority to support authority-led planning.",
    },
    {
      icon: "🏠",
      title: "Shelter Management",
      tag: "04 · PLAN",
      description:
        "Maintain shelter records, capacity and occupancy information for relocation planning.",
    },
    {
      icon: "🚑",
      title: "Rescue Coordination",
      tag: "05 · RESPOND",
      description:
        "Coordinate rescue teams, incident assignments, requests and response status through existing RESQ modules.",
    },
    {
      icon: "📊",
      title: "Disaster Intelligence",
      tag: "06 · REVIEW",
      description:
        "Review available incident information, risk assessments and operational summaries for informed decision support.",
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "Report & Record",
      description:
        "Capture disaster reports and habitation information.",
    },
    {
      number: "02",
      title: "Assess Hazard & Risk",
      description:
        "Review hazard type, location, population and vulnerability.",
    },
    {
      number: "03",
      title: "Identify Risk Zones",
      description:
        "Display recorded risk classifications on the map.",
    },
    {
      number: "04",
      title: "Assess Capacity",
      description:
        "Compare relocation demand with available shelter capacity.",
    },
    {
      number: "05",
      title: "Prioritize Relocation",
      description:
        "Organize immediate and short-term planning priorities.",
    },
    {
      number: "06",
      title: "Coordinate Response",
      description:
        "Connect planning with rescue teams, resources and status updates.",
    },
  ];

  return (
    <div className="home-page">
      {/* NAVIGATION */}
      <nav className="home-navbar">
        <Link to="/" className="home-brand">
          <div className="home-brand-icon">🛡️</div>
          <div>
            <div className="home-brand-name">RESQ</div>
            <div className="home-brand-subtitle">
              DISASTER RISK & RELOCATION PLANNING
            </div>
          </div>
        </Link>

        <div className="home-nav-links">
          <a href="#problem-statement">Problem Statement</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#workflow">Workflow</a>
          <a href="#access">Access</a>
          <Link to="/citizen-login">Citizen Login</Link>
<Link to="/citizen-register">Citizen Register</Link>
          <Link to="/team-login">Rescue Team</Link>
          <Link to="/admin/login" className="home-admin-link">
            Authority Login
          </Link>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="home-hero">
          <div className="home-hero-content">
            <div className="home-status">
              <span></span>
              PROBLEM STATEMENT
            </div>

            <h1>
              Plan Safer
              <br />
              <span>Communities.</span>
            </h1>

            <h2>
              Hazard-Based Red Zones, Carrying Capacity Assessment
              and Immediate Relocation Needs for Vulnerable Habitations
            </h2>

            <p>
              RESQ is a disaster-management decision-support prototype
              designed to connect habitation risk assessment, vulnerable
              population information, shelter capacity and relocation
              priorities with existing emergency-response operations.
            </p>

            <div className="home-actions">
              <Link
                to="/admin/login"
                className="home-btn home-btn-primary"
              >
                Authority Dashboard →
              </Link>

              <a
                href="#problem-statement"
                className="home-btn home-btn-secondary"
              >
                Explore the Solution
              </a>
            </div>

            <div className="home-stats">
              <div>
                <strong>01</strong>
                <span>HAZARD & RISK</span>
              </div>
              <div>
                <strong>02</strong>
                <span>CAPACITY</span>
              </div>
              <div>
                <strong>03</strong>
                <span>RELOCATION</span>
              </div>
            </div>
          </div>

          {/* ILLUSTRATIVE COMMAND-CENTRE VISUAL */}
          <div className="home-command-card">
            <div className="command-top">
              <div className="command-dots">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <span>RESQ · PLANNING OVERVIEW</span>
              <b>PROTOTYPE</b>
            </div>

            <div className="command-screen">
              <div className="command-title">
                <strong>Habitation Risk Assessment</strong>
                <small>ILLUSTRATIVE VIEW</small>
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
                  <small>RISK REVIEW</small>
                </div>
              </div>
            </div>

            <div className="command-metrics">
              <div>
                <span>RISK ZONES</span>
                <strong>Review</strong>
              </div>
              <div>
                <span>CAPACITY</span>
                <strong>Assess</strong>
              </div>
              <div>
                <span>RELOCATION</span>
                <strong>Prioritize</strong>
              </div>
            </div>
          </div>
        </section>

        {/* EMERGENCY REPORTING */}
        <section className="home-emergency">
          <div>
            <div className="emergency-icon">🚨</div>
            <div>
              <strong>Report a disaster or emergency</strong>
              <span>
                Citizens can access the reporting and assistance
                features available in RESQ.
              </span>
            </div>
          </div>

          <Link to="/citizen-login" className="home-emergency-btn">
            Citizen Login →
          </Link>
        </section>

        {/* CORE PROBLEM STATEMENT */}
        <section
          className="home-section home-relocation"
          id="problem-statement"
        >
          <span className="home-label">
            CORE OBJECTIVES
          </span>

          <h2 className="home-section-title">
            Three connected decisions for vulnerable habitations.
          </h2>

          <p className="home-section-description">
            The proposed workflow links risk identification,
            relocation-demand assessment and shelter-capacity
            planning. Results depend on the quality of recorded
            inputs and require validation by authorized personnel.
          </p>

          <div className="home-relocation-grid">
            <article className="home-relocation-card relocation-red">
              <span className="relocation-index">
                01 / IDENTIFY
              </span>
              <div className="relocation-icon">🗺️</div>
              <h3>Hazard-Based Red Zones</h3>
              <p>
                Review hazard type, habitation location, risk
                classification and vulnerable population. Verified
                geographic hazard boundaries require authoritative
                hazard data.
              </p>
            </article>

            <article className="home-relocation-card relocation-amber">
              <span className="relocation-index">
                02 / ASSESS
              </span>
              <div className="relocation-icon">🏠</div>
              <h3>Carrying Capacity</h3>
              <p>
                Estimate relocation demand and compare it with
                recorded available shelter capacity to identify a
                potential accommodation gap.
              </p>
            </article>

            <article className="home-relocation-card relocation-blue">
              <span className="relocation-index">
                03 / PRIORITIZE
              </span>
              <div className="relocation-icon">🚨</div>
              <h3>Immediate Relocation Needs</h3>
              <p>
                Review habitation risk scores, vulnerable residents
                and relocation priorities to support planned,
                authority-led relocation decisions.
              </p>
            </article>
          </div>

          <div className="home-relocation-note">
            <strong>Important</strong>
            <span>
              Risk scores are prototype assessments, not validated
              official hazard predictions. Capacity gaps are estimates,
              not confirmation of completed evacuation or shelter
              assignment.
            </span>
            <Link to="/admin/login">Authority access →</Link>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="home-section" id="capabilities">
          <span className="home-label">
            CONNECTED RESQ MODULES
          </span>

          <h2 className="home-section-title">
            One workflow. Connected response operations.
          </h2>

          <p className="home-section-description">
            The existing reporting, assessment, shelter and rescue
            modules support different stages of disaster planning
            and response.
          </p>

          <div className="home-feature-grid">
            {capabilities.map((item) => (
              <article
                className="home-feature-card"
                key={item.title}
              >
                <div className="home-feature-icon">
                  {item.icon}
                </div>
                <small className="home-label">{item.tag}</small>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* DECISION SUPPORT */}
        <section className="home-section home-intelligence">
          <span className="home-label">
            RISK & RELOCATION DECISION SUPPORT
          </span>

          <h2 className="home-section-title">
            Turn recorded information into a planning overview.
          </h2>

          <p className="home-section-description">
            RESQ brings habitation assessments and operational
            information together to help authorized users review
            risk, population impact and relocation requirements.
          </p>

          <div className="home-intel-grid">
            <article className="home-intel-card">
              <div className="home-feature-icon">📍</div>
              <h3>Habitation Assessment</h3>
              <p>
                Record habitation details, coordinates, hazard type,
                population and vulnerability information. Review
                the resulting risk classification and priority.
              </p>
              <Link
                to="/admin/login"
                className="home-intel-link"
              >
                Open Authority Dashboard →
              </Link>
            </article>

            <article className="home-intel-card">
              <div className="home-feature-icon">📊</div>
              <h3>Capacity & Relocation Review</h3>
              <p>
                Review available shelter capacity, estimated
                relocation demand and operational information
                before making relocation decisions.
              </p>
              <Link
                to="/admin/login"
                className="home-intel-link"
              >
                Authority Login →
              </Link>
            </article>
          </div>
        </section>

        {/* END-TO-END WORKFLOW */}
        <section className="home-section" id="workflow">
          <span className="home-label">
            END-TO-END WORKFLOW
          </span>

          <h2 className="home-section-title">
            From habitation assessment to coordinated response.
          </h2>

          <p className="home-section-description">
            This is the intended connected planning flow. Actual
            actions and status updates depend on the available
            modules, recorded data and authorized users.
          </p>

          <div className="home-workflow">
            {workflow.map((step) => (
              <article className="home-step" key={step.number}>
                <span className="step-number">
                  {step.number}
                </span>
                <div className="step-icon">
                  {["📋", "🗺️", "🔴", "🏠", "🚨", "🚑"][
                    Number(step.number) - 1
                  ]}
                </div>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </article>
            ))}
          </div>
        </section>

        {/* ROLE-BASED ACCESS */}
        <section className="home-section" id="access">
          <span className="home-label">
            ROLE-BASED ACCESS
          </span>

          <h2 className="home-section-title">
            Designed around the people involved in response.
          </h2>

          <p className="home-section-description">
            Citizens submit information and requests, authorities
            manage assessments and resources, and rescue teams
            coordinate assigned operations.
          </p>

          <div className="home-access-grid">
            <article className="home-access-card citizen-card">
              <div className="access-icon">👤</div>
              <h3>Citizen</h3>
              <p>
                Access disaster reporting, emergency assistance
                requests and the citizen features available in RESQ.
              </p>

              <div className="access-buttons">
                <Link to="/citizen-login">Citizen Login →</Link>
                <Link to="/citizen-register">Create Account</Link>
              </div>
            </article>

            <article className="home-access-card admin-card">
              <div className="access-icon">🛡️</div>
              <h3>Admin / Authority</h3>
              <p>
                Review reports, assess habitation risk, manage
                shelters and resources, and coordinate response.
              </p>

              <Link
                to="/admin/login"
                className="access-main-link"
              >
                Authority Login →
              </Link>
            </article>

            <article className="home-access-card rescue-card">
              <div className="access-icon">🚑</div>
              <h3>Rescue Team</h3>
              <p>
                Access assigned operations and update response
                information through the available team workflow.
              </p>

              <Link
                to="/team-login"
                className="access-main-link"
              >
                Rescue Team Login →
              </Link>
            </article>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="home-final-cta">
          <div>
            <span className="home-label">
              RESQ 
            </span>
            <h2>
              Better risk assessment. Informed relocation planning.
            </h2>
            <p>
              Connect hazard information, vulnerable habitation
              assessments and shelter capacity with coordinated
              disaster-response operations.
            </p>
          </div>

          <div className="home-cta-buttons">
            <Link
              to="/admin/login"
              className="home-btn home-btn-primary"
            >
              Authority Login →
            </Link>
            <Link
              to="/citizen-login"
              className="home-btn home-btn-secondary"
            >
              Citizen Access
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div>
          <strong>RESQ</strong>
          <span>
            Smart Disaster Management & Relocation Planning
          </span>
        </div>

        <div className="footer-links">
          <a href="#problem-statement">Problem Statement</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#workflow">Workflow</a>
          <a href="#access">Access</a>
          <Link to="/admin/login">Authority</Link>
        </div>

        <div className="footer-status">
         Decision-Support Prototype
        </div>

        <div className="footer-bottom">
          © 2026 RESQ · Hazard Assessment & Relocation Planning
        </div>
      </footer>
    </div>
  );
}

export default Home;