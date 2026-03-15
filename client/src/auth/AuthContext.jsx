import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

// Context holds auth data/functions that any component can access
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // user = logged-in user object (or null if logged out)
    const [user, setUser] = useState(null);

    // loading = true while we are checking if the user is already logged in
    const [loading, setLoading] = useState(true);

    // Runs once when the app starts:
    // If a token exists in localStorage, validate it by calling /auth/me.
    useEffect(() => {
        const initAuth = async () => {
            // Read token saved from a previous login (if any)
            const token = localStorage.getItem("token");

            // No token = definitely not logged in
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                // If token is valid, API returns the current user
                // (apiFetch should include the token in request headers)
                const data = await apiFetch("/api/auth/me"); // expects { user: {...} }
                setUser(data.user);
            } catch (err) {
                // Token is invalid/expired/etc, so clear it out and reset auth state
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                // Either way, we’re done checking auth
                setLoading(false);
            }
        };

        initAuth();
    }, []); // empty dependency array = run once on mount

    // Call this after a successful POST /auth/login
    // It stores the token, then fetches /auth/me to populate the user object.
    const loginWithToken = async (token) => {
        // Persist token so refresh/page reload keeps the login
        localStorage.setItem("token", token);

        // Fetch current user details now that we have a token
        const data = await apiFetch("/api/auth/me");
        setUser(data.user);

        // Return user so callers can use it immediately if needed
        return data.user;
    };

    // Log out = remove token and clear user state
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    // Memoize the context value so consumers don't re-render unnecessarily
    // (only changes when user/loading changes)
    const value = useMemo(
        () => ({
            user,
            loading,

            // Simple boolean flag for protected routes / UI checks
            isAuthenticated: !!user,

            // Expose setUser in case you want to update user after profile edits, etc.
            setUser,

            // Helper used by login page after receiving token from backend
            loginWithToken,

            // Helper for logout buttons
            logout,
        }),
        [user, loading]
    );

    // Provide auth state + helpers to all children components
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components can do: const { user, logout } = useAuth();
export function useAuth() {
    const ctx = useContext(AuthContext);

    // Safety check: makes sure hook is used inside <AuthProvider>
    if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");

    return ctx;
}