import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // While AuthProvider is calling /auth/me on app load
    if (loading) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    // Not logged in - go to auth page
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Logged in - allow access
    return children;
}