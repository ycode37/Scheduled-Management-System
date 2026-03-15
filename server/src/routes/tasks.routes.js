import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/tasks.validator.js';
import { createTaskController, getTaskByIdController, getTasksController, removeTaskController, updateTaskController } from '../controllers/tasks.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: Get all tasks belonging to the authenticated user
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch tasks
 */
router.get("/", requireAuth, getTasksController);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request data or invalid project selection
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create task
 */
router.post("/", requireAuth, validate(createTaskSchema), createTaskController);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by id
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid task id
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to fetch task
 */
router.get("/:id", requireAuth, getTaskByIdController);

/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid task id, invalid request body, invalid project selection, or no valid fields to update
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to update task
 */
router.put("/:id", requireAuth, validate(updateTaskSchema), updateTaskController);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid task id
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to delete task
 */
router.delete("/:id", requireAuth, removeTaskController);

export default router;