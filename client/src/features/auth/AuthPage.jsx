import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";

import "./authPage.css";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("login");

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={mode === "login" ? "active" : ""}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setMode("register")}
            className={mode === "register" ? "active" : ""}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm />
        ) : (
          <RegisterForm onSuccess={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}