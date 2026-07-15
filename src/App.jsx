import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import EmployeeLayout from "./components/EmployeeLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Operations from "./pages/Operations";
import Reports from "./pages/Reports";
import IssueDetails from "./pages/IssueDetails";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import MySchedule from "./pages/MySchedule";
import CoverageRequests from "./pages/CoverageRequests";
import Availability from "./pages/Availability";
import DepartmentDetails from "./pages/DepartmentDetails";
import EmployeeDetails from "./pages/EmployeeDetails";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["coordinator"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/operations"
            element={<Operations />}
          />

          <Route
            path="/operations/:issueId"
            element={<IssueDetails />}
          />

          <Route
            path="/departments"
            element={<Departments />}
          />

          <Route
            path="/departments/:departmentCode"
            element={<DepartmentDetails />}
          />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/employees/:employeeId"
            element={<EmployeeDetails />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["employee"]}
          />
        }
      >
        <Route element={<EmployeeLayout />}>
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="/employee/schedule"
            element={<MySchedule />}
          />

          <Route
            path="/employee/offers"
            element={<CoverageRequests />}
          />

          <Route
            path="/employee/availability"
            element={<Availability />}
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}