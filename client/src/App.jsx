import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Pages
import { Login } from "./pages/Auth/Login";
import { Signup } from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import { Departments } from "./pages/Departments/Departments";
import { Categories } from "./pages/Categories/Categories";
import { Employees } from "./pages/Employees/Employees";
import { Assets } from "./pages/Assets/Assets";
import { Allocations } from "./pages/Allocation/Allocations";
import { Bookings } from "./pages/Booking/Bookings";
import { Maintenance } from "./pages/Maintenance/Maintenance";
import { Auditing } from "./pages/Audit/Auditing";
import { Reports } from "./pages/Reports/Reports";
import { Logs } from "./pages/Logs/Logs";
import { Settings } from "./pages/Settings/Settings";

// Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080b11] text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
        <span>Verifying active session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <Departments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <Categories />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <Employees />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Assets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Allocations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Bookings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Maintenance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/audits"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Asset Manager"]}>
                <DashboardLayout>
                  <Auditing />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Asset Manager"]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <Logs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
