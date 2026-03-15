import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projects.validator.js';
import { createProjectController, getProjectByIdController, getProjectsController, getProjectTasksController, removeProjectController, updateProjectController } from '../controllers/projects.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Get all projects belonging to the authenticated user
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 */
router.get("/", requireAuth, getProjectsController);


/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, validate(createProjectSchema), createProjectController);


/**
 * @openapi
 * /api/projects/{id}/tasks:
 *   get:
 *     summary: Get all tasks belonging to a specific project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of tasks in the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid project id
 *       401:
 *         description: Unauthorized
 */
router.get("/:id/tasks", requireAuth, getProjectTasksController);


/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project by id
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid project id
 *       404:
 *         description: Project not found
 */
router.get("/:id", requireAuth, getProjectByIdController);


/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     summary: Update an existing project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid project id or request body
 *       404:
 *         description: Project not found
 */
router.put("/:id", requireAuth, validate(updateProjectSchema), updateProjectController);


/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid project id
 *       404:
 *         description: Project not found
 */
router.delete("/:id", requireAuth, removeProjectController);

export default router;