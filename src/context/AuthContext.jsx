import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext(null);

const demoUsers = [
  {
    id: "USER-COORD-1",
    name: "Farida Belal",
    email: "coordinator@mediops.demo",
    password: "coordinator123",
    role: "coordinator",
    employeeId: null
  },
  {
    id: "USER-MAYA",
    name: "Maya Chen",
    email: "maya@mediops.demo",
    password: "maya123",
    role: "employee",
    employeeId: "EMP-201"
  },
  {
    id: "USER-EMILY",
    name: "Emily Carter",
    email: "emily@mediops.demo",
    password: "emily123",
    role: "employee",
    employeeId: "EMP-202"
  },
  {
    id: "USER-JORDAN",
    name: "Jordan Lee",
    email: "jordan@mediops.demo",
    password: "jordan123",
    role: "employee",
    employeeId: "EMP-203"
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("pulseops-user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  function login(email, password) {
    const matchedUser = demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message: "Invalid email or password."
      };
    }

    const safeUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      employeeId: matchedUser.employeeId
    };

    setUser(safeUser);
    sessionStorage.setItem(
      "pulseops-user",
      JSON.stringify(safeUser)
    );

    return {
      success: true,
      user: safeUser
    };
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("pulseops-user");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        demoUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}