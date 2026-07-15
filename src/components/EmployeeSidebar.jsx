import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  Gauge,
  LogOut,
  ToggleLeft
} from "lucide-react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "My Dashboard",
    path: "/employee/dashboard",
    icon: Gauge
  },
  {
    label: "My Schedule",
    path: "/employee/schedule",
    icon: CalendarDays
  },
  {
    label: "Coverage Requests",
    path: "/employee/offers",
    icon: ClipboardCheck
  },
  {
    label: "Availability",
    path: "/employee/availability",
    icon: ToggleLeft
  }
];

export default function EmployeeSidebar() {
  const {
    logout
  } = useAuth();

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Activity size={22} />
        </div>

        <div>
          <h1>MediOps</h1>
          <p>Employee Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map(
          ({
            label,
            path,
            icon: Icon
          }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          )
        )}
      </nav>

      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}