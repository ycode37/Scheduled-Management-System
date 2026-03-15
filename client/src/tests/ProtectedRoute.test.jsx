import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";

// Mock AuthContext so we can control auth state in each test
vi.mock("../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

// Render helper for tests that need full routing
function renderProtectedRouteWithRoutes(authValue) {
    useAuth.mockReturnValue(authValue);

    return render(
        <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <div>Dashboard Page</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/auth" element={<div>Auth Page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

// Render helper for tests that only check what ProtectedRoute displays
function renderProtectedRoute(authValue) {
    useAuth.mockReturnValue(authValue);

    return render(
        <MemoryRouter>
            <ProtectedRoute>
                <div>Dashboard Page</div>
            </ProtectedRoute>
        </MemoryRouter>
    );
}

describe("ProtectedRoute", () => {
    // Clear mocks before each test so tests stay independent
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirects unauthenticated user to /auth", () => {
        renderProtectedRouteWithRoutes({
            user: null,
            loading: false,
        });

        expect(screen.getByText("Auth Page")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
    });

    it("renders children for authenticated user", () => {
        renderProtectedRoute({
            user: { id: 1, email: "test@test.com" },
            loading: false,
        });

        expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    it("shows loading state while auth is loading", () => {
        renderProtectedRoute({
            user: null,
            loading: true,
        });

        expect(screen.getByText("Loading...")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
    });
});