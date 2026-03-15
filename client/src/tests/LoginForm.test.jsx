import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../components/auth/LoginForm";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/*
Mock functions that allow us to track behaviour.

mockNavigate - lets us verify the component tries to redirect
mockLoginWithToken - lets us verify authentication logic is triggered
*/
const mockNavigate = vi.fn();
const mockLoginWithToken = vi.fn();

/*
Partially mock react-router-dom.

We keep the real router functionality (MemoryRouter etc.)
but override useNavigate so we can track redirects in tests.
*/
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

/*
Mock the AuthContext hook.

Instead of using the real authentication logic,
we return a fake loginWithToken function that we can monitor.
*/
vi.mock("../auth/AuthContext", () => ({
    useAuth: () => ({
        loginWithToken: mockLoginWithToken,
    }),
}));

/*
Mock the API helper used by the login form.

This prevents a real network request and instead simulates
a successful login response containing a fake JWT token.
*/
vi.mock("../api/client", () => ({
    apiFetch: vi.fn(() => Promise.resolve({ token: "fake-jwt-token" })),
}));

/*
Custom render helper.

LoginForm uses useNavigate(), so it must be wrapped in a Router.
MemoryRouter provides the routing context needed for tests.
*/
function renderLoginForm() {
    return render(
        <MemoryRouter>
            <LoginForm />
        </MemoryRouter>
    );
}

describe("LoginForm", () => {

    /*
    Reset mock call history before each test
    to ensure tests do not affect one another.
    */
    beforeEach(() => {
        mockNavigate.mockClear();
        mockLoginWithToken.mockClear();
    });

    it("allows user to type email and password", async () => {
        renderLoginForm();

        // Find inputs by their accessible labels
        const email = screen.getByLabelText(/email/i);
        const password = screen.getByLabelText(/password/i);

        // Simulate a real user typing into the inputs
        await userEvent.type(email, "test@test.com");
        await userEvent.type(password, "Password123");

        // Verify the input values updated correctly
        expect(email).toHaveValue("test@test.com");
        expect(password).toHaveValue("Password123");
    });

    it("shows validation error if fields are empty", async () => {
        renderLoginForm();

        // Attempt to submit the form with empty fields
        const button = screen.getByRole("button", { name: /login/i });
        await userEvent.click(button);

        // Verify the validation error message appears
        expect(
            screen.getByText("Please enter your email and password.")
        ).toBeInTheDocument();
    });

    it("logs in user and redirects to dashboard", async () => {
        renderLoginForm();

        const email = screen.getByLabelText(/email/i);
        const password = screen.getByLabelText(/password/i);
        const button = screen.getByRole("button", { name: /login/i });

        // Fill out the form
        await userEvent.type(email, "test@test.com");
        await userEvent.type(password, "Password123");

        // Submit the form
        await userEvent.click(button);

        // Verify authentication was triggered with the returned token
        expect(mockLoginWithToken).toHaveBeenCalledWith("fake-jwt-token");

        // Verify the user is redirected after successful login
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

});