import request from "supertest";
import app from "../src/app.js";
import { registerAndLogin, authHeader } from "./helpers.js";

describe("Projects API", () => {

    // CREATE PROJECT
    describe("POST /api/projects", () => {

        test("creates a project for the logged-in user", async () => {
            // Register a user and get a valid auth token
            const { token } = await registerAndLogin();

            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token)) // attach Authorization header
                .send({
                    name: "Website Redesign",
                    scheduled_completion: "2026-04-01",
                    status: "In Progress",
                });

            // Project should be created successfully
            expect(res.statusCode).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.name).toBe("Website Redesign");
            expect(res.body.status).toBe("In Progress");
        });

        test("uses default status of Not Started when not provided", async () => {
            const { token } = await registerAndLogin();

            // Create project without providing status
            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "Default Status Project",
                    scheduled_completion: "2026-04-05",
                });

            // Backend should default status to "Not Started"
            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe("Default Status Project");
            expect(res.body.status).toBe("Not Started");
        });

        test("converts empty scheduled_completion to null", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "Null Date Project",
                    scheduled_completion: "",
                    status: "Not Started",
                });

            // Empty string should be stored as null in database
            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe("Null Date Project");
            expect(res.body.scheduled_completion).toBeNull();
        });

        test("rejects unauthenticated project creation", async () => {
            // No token sent
            const res = await request(app).post("/api/projects").send({
                name: "Blocked Project",
                scheduled_completion: "2026-04-06",
                status: "In Progress",
            });

            // Middleware should block this
            expect([401, 403]).toContain(res.statusCode);
        });

        test("rejects missing project name", async () => {
            const { token } = await registerAndLogin();

            // Name is required
            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    scheduled_completion: "2026-04-06",
                    status: "In Progress",
                });

            expect(res.statusCode).toBe(400);
        });

        test("rejects empty project name", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "",
                    scheduled_completion: "2026-04-06",
                    status: "In Progress",
                });

            expect(res.statusCode).toBe(400);
        });

        test("rejects invalid scheduled_completion date", async () => {
            const { token } = await registerAndLogin();

            // Invalid date string
            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "Bad Date Project",
                    scheduled_completion: "not-a-date",
                    status: "In Progress",
                });

            expect(res.statusCode).toBe(400);
        });

        test("rejects invalid status", async () => {
            const { token } = await registerAndLogin();

            // Status must match allowed values
            const res = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "Bad Status Project",
                    scheduled_completion: "2026-04-06",
                    status: "Done",
                });

            expect(res.statusCode).toBe(400);
        });
    });


    // LIST PROJECTS
    describe("GET /api/projects", () => {

        test("returns only the logged-in user's projects", async () => {
            // Create two users
            const userA = await registerAndLogin();
            const userB = await registerAndLogin();

            // Create projects for User A
            await request(app)
                .post("/api/projects")
                .set(authHeader(userA.token))
                .send({
                    name: "User A Project 1",
                    scheduled_completion: "2026-04-01",
                    status: "In Progress",
                });

            await request(app)
                .post("/api/projects")
                .set(authHeader(userA.token))
                .send({
                    name: "User A Project 2",
                    scheduled_completion: "2026-04-02",
                    status: "Not Started",
                });

            // Create project for User B
            await request(app)
                .post("/api/projects")
                .set(authHeader(userB.token))
                .send({
                    name: "User B Project",
                    scheduled_completion: "2026-04-03",
                    status: "Complete",
                });

            // Fetch projects as User A
            const res = await request(app)
                .get("/api/projects")
                .set(authHeader(userA.token));

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            // User A should only see their projects
            const names = res.body.map((project) => project.name);
            expect(names).toContain("User A Project 1");
            expect(names).toContain("User A Project 2");
            expect(names).not.toContain("User B Project");
        });

        test("returns an empty array when user has no projects", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .get("/api/projects")
                .set(authHeader(token));

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        test("includes task_count for each project", async () => {
            const { token } = await registerAndLogin();

            const createProjectRes = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "Count Tasks Project",
                    scheduled_completion: "2026-04-10",
                    status: "In Progress",
                });

            expect(createProjectRes.statusCode).toBe(201);

            const projectId = Number(createProjectRes.body.id);

            const task1Res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Task 1",
                    project_id: projectId,
                    progress: 0,
                });

            expect(task1Res.statusCode).toBe(201);

            const task2Res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Task 2",
                    project_id: projectId,
                    progress: 50,
                });

            expect(task2Res.statusCode).toBe(201);

            const res = await request(app)
                .get("/api/projects")
                .set(authHeader(token));

            expect(res.statusCode).toBe(200);

            const project = res.body.find((p) => Number(p.id) === projectId);

            expect(project).toBeDefined();
            expect(Number(project.task_count)).toBe(2);
        });
    });


    // SINGLE PROJECT
    describe("GET /api/projects/:id", () => {

        test("returns a single project owned by the logged-in user", async () => {
            const { token } = await registerAndLogin();

            const createRes = await request(app)
                .post("/api/projects")
                .set(authHeader(token))
                .send({
                    name: "Single Project",
                    scheduled_completion: "2026-04-11",
                    status: "In Progress",
                });

            const projectId = createRes.body.id;

            const res = await request(app)
                .get(`/api/projects/${projectId}`)
                .set(authHeader(token));

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(projectId);
            expect(res.body.name).toBe("Single Project");

            // API also returns task_count metadata
            expect(res.body.task_count).toBeDefined();
        });

        test("returns 400 for invalid project id", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .get("/api/projects/abc")
                .set(authHeader(token));

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid project id");
        });

        test("returns 404 for non-existent project", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .get("/api/projects/999999")
                .set(authHeader(token));

            expect(res.statusCode).toBe(404);
        });

        test("prevents access to another user's project", async () => {
            const userA = await registerAndLogin();
            const userB = await registerAndLogin();

            const createRes = await request(app)
                .post("/api/projects")
                .set(authHeader(userA.token))
                .send({
                    name: "Private Project",
                    scheduled_completion: "2026-04-12",
                    status: "In Progress",
                });

            const projectId = createRes.body.id;

            const res = await request(app)
                .get(`/api/projects/${projectId}`)
                .set(authHeader(userB.token));

            // Secure pattern: behave as if project doesn't exist
            expect(res.statusCode).toBe(404);
        });
    });
});