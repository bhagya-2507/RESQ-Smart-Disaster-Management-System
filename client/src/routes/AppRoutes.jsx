import { Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import CitizenLogin from "../pages/public/CitizenLogin";
import CitizenRegister from "../pages/public/CitizenRegister";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import TeamLogin from "../pages/public/TeamLogin";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";

import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import ReportDisaster from "../pages/citizen/ReportDisaster";
import RescueRequest from "../pages/citizen/RescueRequest";

import ProtectedRoute from "../components/common/ProtectedRoute";
import Reports from "../pages/admin/Reports";
import ReportDetails from "../pages/admin/ReportDetails";
import RescueRequests from "../pages/admin/RescueRequests";
import RescueTeams from "../pages/admin/RescueTeams";
import AddTeam from "../pages/admin/AddTeam";
import EditTeam from "../pages/admin/EditTeam";
import TeamDashboard from "../pages/rescueTeam/TeamDashboard";
import Intelligence from "../pages/admin/Intelligence";
import Resources from "../pages/admin/Resources";
import AddResource from "../pages/admin/AddResource";
import EditResource from "../pages/admin/EditResource";
import Shelters from "../pages/admin/Shelters";
import AddShelter from "../pages/admin/AddShelter";
import EditShelter from "../pages/admin/EditShelter";
import Alerts from "../pages/admin/Alerts";
import AddAlert from "../pages/admin/AddAlert";
import EditAlert from "../pages/admin/EditAlert";
import ResourceRequest from "../pages/citizen/ResourceRequest";
import ResourceRequests from "../pages/admin/ResourceRequests";
import ShelterRequest from "../pages/citizen/ShelterRequest";
import ShelterRequests from "../pages/admin/ShelterRequests";
function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Home />} />

      <Route
        path="/citizen-login"
        element={<CitizenLogin />}
      />
      <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

      <Route
        path="/citizen-register"
        element={<CitizenRegister />}
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/team-login"
        element={<TeamLogin />}
      />


      {/* ================= CITIZEN ================= */}

      <Route
        path="/citizen-dashboard"
        element={
          <ProtectedRoute allowedRole="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRole="citizen">
            <ReportDisaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rescue-request"
        element={
          <ProtectedRoute allowedRole="citizen">
            <RescueRequest />
          </ProtectedRoute>
        }
      />
      <Route
  path="/resource-request"
  element={
    <ProtectedRoute allowedRole="citizen">
      <ResourceRequest />
    </ProtectedRoute>
  }
/>
<Route
  path="/citizen/shelter-request"
  element={
    <ProtectedRoute allowedRoles={["citizen"]}>
      <ShelterRequest />
    </ProtectedRoute>
  }
/>


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Temporary placeholders — actual pages will be connected next */}
<Route
  path="/admin/reports"
  element={
    <ProtectedRoute allowedRole="admin">
      <Reports />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/reports/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <ReportDetails />
    </ProtectedRoute>
  }
/>
      <Route
  path="/admin/rescue-requests"
  element={
    <ProtectedRoute allowedRole="admin">
      <RescueRequests />
    </ProtectedRoute>
  }
/>

      <Route
  path="/admin/rescue-teams"
  element={
    <ProtectedRoute allowedRole="admin">
      <RescueTeams />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/rescue-teams/add"
  element={
    <ProtectedRoute allowedRole="admin">
      <AddTeam />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/rescue-teams/edit/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <EditTeam />
    </ProtectedRoute>
  }
/>

      <Route
  path="/admin/resources"
  element={
    <ProtectedRoute allowedRole="admin">
      <Resources />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/resources/add"
  element={
    <ProtectedRoute allowedRole="admin">
      <AddResource />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/resources/edit/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <EditResource />
    </ProtectedRoute>
  }
/>

      <Route
  path="/admin/shelters"
  element={
    <ProtectedRoute allowedRole="admin">
      <Shelters />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/shelters/add"
  element={
    <ProtectedRoute allowedRole="admin">
      <AddShelter />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/shelters/edit/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <EditShelter />
    </ProtectedRoute>
  }
/>

      <Route
  path="/admin/alerts"
  element={
    <ProtectedRoute allowedRole="admin">
      <Alerts />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/alerts/add"
  element={
    <ProtectedRoute allowedRole="admin">
      <AddAlert />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/alerts/edit/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <EditAlert />
    </ProtectedRoute>
  }
/>

      <Route
  path="/intelligence"
  element={
    <ProtectedRoute allowedRole="admin">
      <Intelligence />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/resource-requests"
  element={
    <ProtectedRoute allowedRole="admin">
      <ResourceRequests />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/shelter-requests"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <ShelterRequests />
    </ProtectedRoute>
  }
/>


      {/* ================= RESCUE TEAM ================= */}

      <Route
  path="/team-dashboard"
  element={
    <ProtectedRoute allowedRole="rescue_team">
      <TeamDashboard />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
}

export default AppRoutes;