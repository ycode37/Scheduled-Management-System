import request from "supertest";
import app from "../src/app.js";
import {
    uniqueEmail,
    registerUser,
    loginUser,
    registerAndLogin,
    authHeader,
} from "./helpers.js";

describe("Auth API", () => {

    // REGISTER
    describe("POST /api/auth/register", () => {

        test("registers a new user", async () => {
            // Generate a unique email so tests don't conflict in the database
            const email = uniqueEmail();

            // Helper function that sends POST /auth/register
            const { res } = await registerUser({
                username: "harrison",
                email,
                password: "Password123!",
            });

            // Some APIs return 200, others return 201 for created resources
            expect([200, 201]).toContain(res.statusCode);

            // Depending on implementation, user may be returned as res.body or res.body.user
            const returnedUser = res.body.user ?? res.body;

            // Email returned from API should match the one we registered
            expect(returnedUser.email).toBe(email);

            // Some APIs return username, some don't — so only check if present
            if (returnedUser.username) {
                expect(returnedUser.username).toBe("harrison");
            }

            // Password should NEVER be returned in API responses
            expect(returnedUser.password).toBeUndefined();
        });

        test("rejects duplicate email", async () => {
            const email = uniqueEmail();

            // First registration should succeed
            const first = await registerUser({
                username: "firstuser",
                email,
                password: "Password123!",
            });

            expect([200, 201]).toContain(first.res.statusCode);

            // Second registration with same email should fail
            const second = await registerUser({
                username: "seconduser",
                email,
                password: "Password123!",
            });

            expect([400, 409]).toContain(second.res.statusCode);
        });

        test("rejects missing email", async () => {
            // Send request without email field
            const res = await request(app).post("/api/auth/register").send({
                username: "harrison",
                password: "Password123!",
            });

            // Validation should reject it
            expect([400, 422]).toContain(res.statusCode);
        });

        test("rejects missing password", async () => {
            const res = await request(app).post("/api/auth/register").send({
                username: "harrison",
                email: uniqueEmail(),
            });

            expect([400, 422]).toContain(res.statusCode);
        });

        test("rejects missing username", async () => {
            const res = await request(app).post("/api/auth/register").send({
                email: uniqueEmail(),
                password: "Password123!",
            });

            expect([400, 422]).toContain(res.statusCode);
        });
    });


    // LOGIN
    describe("POST /api/auth/login", () => {

        test("logs in an existing user and returns a token", async () => {
            // First register a user so we can log in
            const { email, password } = await registerUser({
                username: "loginuser",
                email: uniqueEmail(),
                password: "Password123!",
            });

            // loginUser helper sends POST /auth/login
            const token = await loginUser(email, password);

            // Token should be a string (JWT)
            expect(typeof token).toBe("string");

            // Basic sanity check that it's not empty
            expect(token.length).toBeGreaterThan(10);
        });

        test("rejects wrong password", async () => {
            const { email } = await registerUser({
                username: "wrongpassuser",
                email: uniqueEmail(),
                password: "Password123!",
            });

            // Try logging in with incorrect password
            const res = await request(app).post("/api/auth/login").send({
                email,
                password: "WrongPassword123!",
            });

            expect([400, 401]).toContain(res.statusCode);
        });

        test("rejects unknown email", async () => {
            // Attempt login with an email that does not exist
            const res = await request(app).post("/api/auth/login").send({
                email: uniqueEmail(),
                password: "Password123!",
            });

            expect([400, 401]).toContain(res.statusCode);
        });

        test("rejects missing credentials", async () => {
            // Send completely empty body
            const res = await request(app).post("/api/auth/login").send({});

            expect([400, 422]).toContain(res.statusCode);
        });
    });


    // AUTHENTICATED USER CHECK
    describe("GET /api/auth/me", () => {

        test("returns the logged-in user when token is valid", async () => {
            // Helper registers + logs in a user and returns a token
            const { token, email } = await registerAndLogin();

            const res = await request(app)
                .get("/api/auth/me")
                .set(authHeader(token)); // attach Authorization header

            expect(res.statusCode).toBe(200);

            const returnedUser = res.body.user ?? res.body;

            // The returned user should match the logged-in user
            expect(returnedUser.email).toBe(email);

            // Password should never be exposed
            expect(returnedUser.password).toBeUndefined();
        });

        test("rejects request with no token", async () => {
            // Attempt access without authentication
            const res = await request(app).get("/api/auth/me");

            expect([401, 403]).toContain(res.statusCode);
        });

        test("rejects request with invalid token", async () => {
            // Send a fake token
            const res = await request(app)
                .get("/api/auth/me")
                .set(authHeader("not-a-real-token"));

            expect([401, 403]).toContain(res.statusCode);
        });
    });
});