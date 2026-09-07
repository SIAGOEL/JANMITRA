import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Main pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CaseManagement from "./pages/CaseManagement";
import CaseDetail from "./pages/CaseDetail";
import HelpGuidelines from "./pages/HelpGuidelines";
import Settings from "./pages/Settings";
import AuditTrail from "./pages/AuditTrail";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Account Registration
import RegistrationStep1 from "./pages/RegistrationStep1";
import RegistrationStep2 from "./pages/RegistrationStep2";
import RegistrationStep3 from "./pages/RegistrationStep3";

// Case Registration
import CaseRegistrationStep1 from "./pages/CaseRegistration/Step1Incident";
import CaseRegistrationStep2 from "./pages/CaseRegistration/Step2People";
import CaseRegistrationStep4 from "./pages/CaseRegistration/Step4Documents";
import CaseRegistrationStep5 from "./pages/CaseRegistration/Step5Review";

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= LOGIN ================= */}

        <Route path="/" element={<Login />} />


        {/* ================= ACCOUNT REGISTRATION ================= */}

        <Route
          path="/register/step1"
          element={<RegistrationStep1 />}
        />

        <Route
          path="/register/step2"
          element={<RegistrationStep2 />}
        />

        <Route
          path="/register/step3"
          element={<RegistrationStep3 />}
        />


        {/* ================= DASHBOARD APPLICATION ================= */}

        <Route element={<DashboardLayout />}>

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* ================= CASE MANAGEMENT ================= */}

          <Route
            path="/cases"
            element={<CaseManagement />}
          />

          <Route
            path="/cases/:id"
            element={<CaseDetail />}
          />


          {/* ================= NEW CASE REGISTRATION ================= */}

          <Route
            path="/cases/new"
            element={
              <Navigate
                to="/cases/new/step1"
                replace
              />
            }
          />

          <Route
            path="/cases/new/step1"
            element={<CaseRegistrationStep1 />}
          />

          <Route
            path="/cases/new/step2"
            element={<CaseRegistrationStep2 />}
          />

          <Route
            path="/cases/new/step4"
            element={<CaseRegistrationStep4 />}
          />

          <Route
            path="/cases/new/step5"
            element={<CaseRegistrationStep5 />}
          />


          {/* ================= OTHER PAGES ================= */}

          <Route
            path="/audit-trail"
            element={<AuditTrail />}
          />

          <Route
            path="/help"
            element={<HelpGuidelines />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;