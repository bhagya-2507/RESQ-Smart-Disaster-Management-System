const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const rescueRequestRoutes = require("./routes/rescueRequestRoutes");

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const rescueTeamRoutes = require("./routes/rescueTeamRoutes");
const rescueTeamAuthRoutes = require("./routes/rescueTeamAuthRoutes");

const citizenAIRoutes = require("./routes/citizenAIRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const alertRoutes = require("./routes/alertRoutes");
const protect = require("./middleware/authMiddleware");
const resourceRequestRoutes =
  require("./routes/resourceRequestRoutes");
const shelterRequestRoutes = require("./routes/shelterRequestRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

dotenv.config();

connectDB();

const app = express();

/* =====================================================
   CORS
===================================================== */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);

/* =====================================================
   BODY PARSER
===================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   AUTH
===================================================== */

app.use("/api/auth", authRoutes);

/* =====================================================
   CITIZEN AI
===================================================== */

app.use("/api/ai", citizenAIRoutes);

/* =====================================================
   DISASTER REPORTS
===================================================== */

app.use("/api/reports", reportRoutes);

/* =====================================================
   RESCUE REQUESTS
===================================================== */

app.use(
  "/api/rescue-requests",
  rescueRequestRoutes
);

/* =====================================================
   ADMIN
===================================================== */

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

/* =====================================================
   RESCUE TEAM
===================================================== */

app.use(
  "/api/rescue-teams",
  rescueTeamRoutes
);

app.use(
  "/api/rescue-team/auth",
  rescueTeamAuthRoutes
);
app.use("/api/resources", resourceRoutes);
app.use("/api/shelters", shelterRoutes);
app.use("/api/alerts", alertRoutes);
app.use(
  "/api/resource-requests",
  resourceRequestRoutes
);
app.use(
  "/api/shelter-requests",
  shelterRequestRoutes
);
app.use("/api/feedback", feedbackRoutes);
/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "RESQ API is running",
  });
});

/* =====================================================
   CURRENT USER
===================================================== */

app.get(
  "/api/auth/me",
  protect,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

/* =====================================================
   SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RESQ server running on http://0.0.0.0:${PORT}`);
});