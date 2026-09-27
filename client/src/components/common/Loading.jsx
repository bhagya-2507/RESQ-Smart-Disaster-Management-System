import { useEffect, useState } from "react";

function Loading({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    ["INITIALIZING SYSTEM", "Loading core modules..."],
    ["CONNECTING NETWORK", "Establishing secure connection..."],
    ["SCANNING LOCATIONS", "Detecting emergency zones..."],
    ["SYNCING RESOURCES", "Linking response teams..."],
    ["ALMOST READY", "Finalizing system..."],
  ];

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }

        return prev + 1;
      });
    }, 55);

    const stepTimer = setInterval(() => {
      setStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepTimer);
          return 4;
        }

        return prev + 1;
      });
    }, 1100);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const finishTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);

      return () => clearTimeout(finishTimer);
    }
  }, [progress, onComplete]);

  return (
    <div className="resq-loading">

      <div className="resq-bg-glow"></div>
      <div className="resq-bg-grid"></div>
      <div className="resq-scan-line"></div>

      {/* TOP */}
      <div className="resq-loading-top">
        <div className="resq-live-status">
          <span></span>
          LIVE EMERGENCY NETWORK
        </div>

        <div className="resq-coordinates">
          RESQ COMMAND CENTER
        </div>
      </div>

      {/* LEFT STEPS */}
      <div className="resq-loading-steps">
        {steps.map(([title, description], index) => (
          <div
            key={title}
            className={`resq-step ${
              index <= step ? "active" : ""
            }`}
          >
            <div className="resq-step-dot">
              {index < step ? "✓" : ""}
            </div>

            <div>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="resq-loading-right">

        <div className="resq-side-status">
          <span className="side-icon">⌁</span>
          <strong>EMERGENCY<br />TEAMS</strong>
          <small>ONLINE</small>
        </div>

        <div className="resq-side-status">
          <span className="side-icon">◇</span>
          <strong>SYSTEM</strong>
          <small>SECURE</small>
        </div>

        <div className="resq-side-status">
          <span className="side-icon">⌁</span>
          <strong>SATELLITE<br />LINK</strong>
          <small>ACTIVE</small>
        </div>

      </div>

      {/* RADAR */}
      <div className="resq-radar">

        <div className="radar-circle radar-outer"></div>
        <div className="radar-circle radar-middle"></div>
        <div className="radar-circle radar-inner"></div>

        <div className="radar-ticks"></div>

        <div className="radar-cross horizontal"></div>
        <div className="radar-cross vertical"></div>

        <div className="radar-sweep"></div>

        {/* LOCATION BEACONS */}
        <div className="location-beacon beacon-1">
          <span></span>
        </div>

        <div className="location-beacon beacon-2">
          <span></span>
        </div>

        <div className="location-beacon beacon-3">
          <span></span>
        </div>

        <div className="location-beacon beacon-4">
          <span></span>
        </div>

        <div className="location-beacon beacon-5">
          <span></span>
        </div>

        {/* CENTER */}
        <div className="resq-center">

          <div className="resq-logo-symbol">
            <div className="resq-logo-triangle">
              <span>+</span>
            </div>
          </div>

          <div className="resq-logo-text">
            RES<span>Q</span>
          </div>

          <div className="resq-logo-subtitle">
            SMART DISASTER MANAGEMENT SYSTEM
          </div>

          <div className="resq-tagline">
            SAFER PEOPLE <i>•</i> STRONGER COMMUNITIES
          </div>

        </div>

      </div>

      {/* BOTTOM */}
      <div className="resq-loading-bottom">

        <div className="resq-loading-message">
          <span className="message-dot"></span>
          {progress < 100
            ? "SCANNING EMERGENCY NETWORK..."
            : "SYSTEM READY"}
        </div>

        <div className="resq-progress-row">

          <div className="resq-progress-track">
            <div
              className="resq-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <strong>{progress}%</strong>

        </div>

        <div className="resq-loading-info">
          INTEGRATING DATA&nbsp; • &nbsp;ANALYZING RISKS
          &nbsp; • &nbsp;PREPARING RESPONSE
        </div>

      </div>

      {/* CORNERS */}
      <div className="resq-corner-message">
        <span></span>
        <strong>A SAFER INDIA</strong>
        <strong>A STRONGER TOMORROW</strong>
      </div>

      <div className="resq-corner-right">
        <span>RESPOND</span>
        <span>RESCUE</span>
        <span>REBUILD</span>
      </div>

    </div>
  );
}

export default Loading;