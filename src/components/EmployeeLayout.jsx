import {
  Outlet
} from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar.jsx";
import { useAuth } from "../context/AuthContext";

export default function EmployeeLayout() {
  const { user } = useAuth();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="app-shell">
      <EmployeeSidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="topbar-label">
              Employee Workforce Portal
            </p>

            <h2>Northstar Medical Center</h2>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {initials}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>Hospital Employee</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}