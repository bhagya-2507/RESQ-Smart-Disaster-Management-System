import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./styles/global.css";
import "./styles/pages/public.css";
import "./styles/pages/admin.css";
import "./styles/pages/intelligence.css";
import "./styles/pages/home.css";
import "./styles/pages/citizen.css";
import "leaflet/dist/leaflet.css";
import "./styles/pages/rescueTeam.css";
import "./styles/components.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);