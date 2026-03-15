import request from "supertest";
import app from "../src/app.js";
import { registerAndLogin, authHeader } from "./helpers.js";

// CREATE TASK
describe("Tasks API", () => {
    describe("POST /api/tasks", () => {
        test("creates a task for the logged-in user", async () => {
            // Create a fresh user and get a valid JWT token
            const { token } = await registerAndLogin();

            // Send POST request to create a new task
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token)) // attach Authorization header
                .send({
                    title: "Finish Jest tests",
                    due_date: "2026-03-10",
                    progress: 25,
                });

            // Check the API created the task successfully
            expect(res.statusCode).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.title).toBe("Finish Jest tests");
            expect(res.body.progress).toBe(25);
        });

        test("uses default progress of 0 when not provided", async () => {
            const { token } = await registerAndLogin();

            // Create task without passing progress
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Default progress task",
                    due_date: "2026-03-11",
                });

            // API/database should fallback to 0
            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe("Default progress task");
            expect(res.body.progress).toBe(0);
        });

        test("creates a task with null project_id", async () => {
            const { token } = await registerAndLogin();

            // Explicitly send project_id as null
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "No project task",
                    due_date: "2026-03-11",
                    progress: 10,
                    project_id: null,
                });

            // Task should still be created and remain unassigned
            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe("No project task");
            expect(res.body.project_id).toBeNull();
        });

        test("rejects unauthenticated task creation", async () => {
            // No auth header sent here
            const res = await request(app).post("/api/tasks").send({
                title: "Blocked task",
                due_date: "2026-03-12",
                progress: 10,
            });

            // Depending on middleware, this may be 401 or 403
            expect([401, 403]).toContain(res.statusCode);
        });

        test("rejects missing title", async () => {
            const { token } = await registerAndLogin();

            // title field completely missing
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    due_date: "2026-03-12",
                    progress: 10,
                });

            // Validation should fail
            expect(res.statusCode).toBe(400);
        });

        test("rejects empty title", async () => {
            const { token } = await registerAndLogin();

            // title is present but empty string
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "",
                    due_date: "2026-03-12",
                    progress: 10,
                });

            expect(res.statusCode).toBe(400);
        });

        test("rejects invalid date format", async () => {
            const { token } = await registerAndLogin();

            // due_date is not a valid date string
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Bad date task",
                    due_date: "not-a-date",
                    progress: 10,
                });

            expect(res.statusCode).toBe(400);
        });

        test("rejects invalid progress over 100", async () => {
            const { token } = await registerAndLogin();

            // progress should be capped at 100
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Bad progress",
                    due_date: "2026-03-12",
                    progress: 150,
                });

            expect(res.statusCode).toBe(400);
        });

        test("rejects invalid progress below 0", async () => {
            const { token } = await registerAndLogin();

            // progress should not be negative
            const res = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Negative progress",
                    due_date: "2026-03-12",
                    progress: -1,
                });

            expect(res.statusCode).toBe(400);
        });
    });

    // GET TASK
    describe("GET /api/tasks", () => {
        test("returns only the logged-in user's tasks", async () => {
            // Create two separate users
            const userA = await registerAndLogin();
            const userB = await registerAndLogin();

            // Create 2 tasks for User A
            await request(app)
                .post("/api/tasks")
                .set(authHeader(userA.token))
                .send({
                    title: "User A Task 1",
                    due_date: "2026-03-13",
                    progress: 20,
                });

            await request(app)
                .post("/api/tasks")
                .set(authHeader(userA.token))
                .send({
                    title: "User A Task 2",
                    due_date: "2026-03-14",
                    progress: 40,
                });

            // Create 1 task for User B
            await request(app)
                .post("/api/tasks")
                .set(authHeader(userB.token))
                .send({
                    title: "User B Task",
                    due_date: "2026-03-15",
                    progress: 60,
                });

            // Fetch tasks as User A
            const res = await request(app)
                .get("/api/tasks")
                .set(authHeader(userA.token));

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            // User A should only see their own tasks
            const titles = res.body.map((task) => task.title);
            expect(titles).toContain("User A Task 1");
            expect(titles).toContain("User A Task 2");
            expect(titles).not.toContain("User B Task");
        });

        test("returns an empty array when user has no tasks", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .get("/api/tasks")
                .set(authHeader(token));

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        test("rejects unauthenticated access", async () => {
            const res = await request(app).get("/api/tasks");

            expect([401, 403]).toContain(res.statusCode);
        });
    });

    // GET SPECEFIC TASK
    describe("GET /api/tasks/:id", () => {
        test("returns a single task owned by the logged-in user", async () => {
            const { token } = await registerAndLogin();

            // First create a task
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Single task",
                    due_date: "2026-03-16",
                    progress: 50,
                });

            const taskId = createRes.body.id;

            // Then fetch that task by id
            const res = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set(authHeader(token));

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(taskId);
            expect(res.body.title).toBe("Single task");
        });

        test("returns 400 for invalid task id", async () => {
            const { token } = await registerAndLogin();

            // "abc" should fail any numeric ID validation
            const res = await request(app)
                .get("/api/tasks/abc")
                .set(authHeader(token));

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid task id");
        });

        test("returns 404 for non-existent task", async () => {
            const { token } = await registerAndLogin();

            // Valid id format, but task does not exist
            const res = await request(app)
                .get("/api/tasks/999999")
                .set(authHeader(token));

            expect(res.statusCode).toBe(404);
        });

        test("prevents access to another user's task", async () => {
            const userA = await registerAndLogin();
            const userB = await registerAndLogin();

            // User A creates task
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(userA.token))
                .send({
                    title: "Private task",
                    due_date: "2026-03-16",
                    progress: 50,
                });

            const taskId = createRes.body.id;

            // User B tries to read User A's task
            const res = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set(authHeader(userB.token));

            // Good security pattern: act like it doesn't exist
            expect(res.statusCode).toBe(404);
        });
    });

    // EDIT TASK
    describe("PUT /api/tasks/:id", () => {
        test("updates a task owned by the logged-in user", async () => {
            const { token } = await registerAndLogin();

            // Create original task
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Old title",
                    due_date: "2026-03-17",
                    progress: 10,
                });

            const taskId = createRes.body.id;

            // Update the task
            const updateRes = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set(authHeader(token))
                .send({
                    title: "Updated title",
                    progress: 80,
                });

            expect(updateRes.statusCode).toBe(200);
            expect(updateRes.body.title).toBe("Updated title");
            expect(updateRes.body.progress).toBe(80);
        });

        test("updates only one field when partial data is sent", async () => {
            const { token } = await registerAndLogin();

            // Create a task with full data
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Keep due date",
                    due_date: "2026-03-17",
                    progress: 10,
                });

            const taskId = createRes.body.id;

            // Only update progress
            const updateRes = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set(authHeader(token))
                .send({
                    progress: 90,
                });

            // Existing title should remain unchanged
            expect(updateRes.statusCode).toBe(200);
            expect(updateRes.body.progress).toBe(90);
            expect(updateRes.body.title).toBe("Keep due date");
        });

        test("returns 400 for invalid task id on update", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .put("/api/tasks/abc")
                .set(authHeader(token))
                .send({
                    title: "Updated title",
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid task id");
        });

        test("returns 404 when updating a non-existent task", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .put("/api/tasks/999999")
                .set(authHeader(token))
                .send({
                    title: "Updated title",
                });

            expect(res.statusCode).toBe(404);
        });

        test("prevents updating another user's task", async () => {
            const userA = await registerAndLogin();
            const userB = await registerAndLogin();

            // User A creates task
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(userA.token))
                .send({
                    title: "Do not edit",
                    due_date: "2026-03-17",
                    progress: 30,
                });

            const taskId = createRes.body.id;

            // User B tries to update it
            const res = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set(authHeader(userB.token))
                .send({
                    title: "Hacked title",
                });

            expect(res.statusCode).toBe(404);
        });

        test("rejects invalid progress on update", async () => {
            const { token } = await registerAndLogin();

            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Progress test",
                    due_date: "2026-03-17",
                    progress: 20,
                });

            const taskId = createRes.body.id;

            // Updating progress above 100 should fail validation
            const res = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set(authHeader(token))
                .send({
                    progress: 101,
                });

            expect(res.statusCode).toBe(400);
        });
    });

    // DELETE TASK
    describe("DELETE /api/tasks/:id", () => {
        test("deletes a task owned by the logged-in user", async () => {
            const { token } = await registerAndLogin();

            // Create task first
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(token))
                .send({
                    title: "Task to delete",
                    due_date: "2026-03-18",
                    progress: 0,
                });

            const taskId = createRes.body.id;

            // Delete it
            const deleteRes = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set(authHeader(token));

            expect(deleteRes.statusCode).toBe(200);
            expect(deleteRes.body.id).toBe(taskId);

            // Confirm it no longer exists
            const getRes = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set(authHeader(token));

            expect(getRes.statusCode).toBe(404);
        });

        test("returns 400 for invalid task id on delete", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .delete("/api/tasks/abc")
                .set(authHeader(token));

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid task id");
        });

        test("returns 404 when deleting a non-existent task", async () => {
            const { token } = await registerAndLogin();

            const res = await request(app)
                .delete("/api/tasks/999999")
                .set(authHeader(token));

            expect(res.statusCode).toBe(404);
        });

        test("prevents deleting another user's task", async () => {
            const userA = await registerAndLogin();
            const userB = await registerAndLogin();

            // User A creates the task
            const createRes = await request(app)
                .post("/api/tasks")
                .set(authHeader(userA.token))
                .send({
                    title: "Protected task",
                    due_date: "2026-03-18",
                    progress: 0,
                });

            const taskId = createRes.body.id;

            // User B tries to delete it
            const deleteRes = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set(authHeader(userB.token));

            expect(deleteRes.statusCode).toBe(404);
        });
    });
});