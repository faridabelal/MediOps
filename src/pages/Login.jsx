import {
  useState
} from "react";
import {
  Navigate,
  useNavigate
} from "react-router-dom";
import {
  Activity,
  ArrowRight,
  LockKeyhole,
  Mail
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const {
    user,
    login
  } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState(
    "coordinator@mediops.demo"
  );

  const [password, setPassword] = useState(
    "coordinator123"
  );

  const [error, setError] = useState("");

  if (user) {
    return (
      <Navigate
        to={
          user.role === "coordinator"
            ? "/dashboard"
            : "/employee/dashboard"
        }
        replace
      />
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(
      result.user.role === "coordinator"
        ? "/dashboard"
        : "/employee/dashboard"
    );
  }

  function useDemoAccount(type) {
    if (type === "coordinator") {
      setEmail("coordinator@mediops.demo");
      setPassword("coordinator123");
    }

    if (type === "maya") {
      setEmail("maya@mediops.demo");
      setPassword("maya123");
    }

    if (type === "emily") {
      setEmail("emily@mediops.demo");
      setPassword("emily123");
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>

          <div>
            <h1>MediOps</h1>
            <p>Hospital Workforce Operations</p>
          </div>
        </div>

        <div className="login-brand-copy">
          <p className="eyebrow">
            Workforce coordination
          </p>

          <h2>
            Keep every hospital unit covered.
          </h2>

          <p>
            Coordinate schedules, respond to staffing
            shortages, and manage coverage offers from one
            operational workspace.
          </p>
        </div>
      </section>

      <section className="login-form-panel">
        <form
          className="login-card"
          onSubmit={handleSubmit}
        >
          <div>
            <p className="eyebrow">
              Secure portal
            </p>

            <h2>Sign in to MediOps</h2>

            <p className="login-subtitle">
              Demo accounts represent different hospital
              roles and permissions.
            </p>
          </div>

          <label className="login-field">
            <span>Email</span>

            <div>
              <Mail size={17} />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>
          </label>

          <label className="login-field">
            <span>Password</span>

            <div>
              <LockKeyhole size={17} />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>
          </label>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            className="primary-button login-submit"
            type="submit"
          >
            Sign in
            <ArrowRight size={17} />
          </button>

          <div className="demo-account-section">
            <span>Use a demo account</span>

            <div>
              <button
                type="button"
                onClick={() =>
                  useDemoAccount("coordinator")
                }
              >
                Staffing Coordinator
              </button>

              <button
                type="button"
                onClick={() =>
                  useDemoAccount("maya")
                }
              >
                Maya — Day/Float RN
              </button>

              <button
                type="button"
                onClick={() =>
                  useDemoAccount("emily")
                }
              >
                Emily — Night RN
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}