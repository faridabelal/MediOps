import {
  Activity,
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users
} from "lucide-react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Operations Queue",
    path: "/operations",
    icon: ClipboardList
  },
  {
    label: "Departments",
    path: "/departments",
    icon: Building2
  },
  {
    label: "Employees",
    path: "/employees",
    icon: Users
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3
  }
];

export default function Sidebar() {
  const { logout } = useAuth();
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
          <p>Workforce Command</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}