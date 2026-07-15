import {
  Outlet
} from "react-router-dom";

import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="topbar-label">
              Hospital Workforce Operations
            </p>

            <h2>Northstar Medical Center</h2>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {initials}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>Staffing Coordinator</span>
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