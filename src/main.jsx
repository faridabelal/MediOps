import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { WorkforceProvider } from "./context/WorkforceContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkforceProvider>
          <App />
        </WorkforceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);