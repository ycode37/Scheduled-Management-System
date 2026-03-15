// Import project service functions that interact with the database
import {
    createProject,
    getProjectById,
    getProjects,
    updateProject,
    removeProject,
    getTasksByProject
} from "../services/projects.service.js";


// Controller to fetch all projects for the currently logged-in user
export const getProjectsController = async (req, res) => {
    try {
        // Get the authenticated user's id from the JWT middleware
        const userId = req.user.id;

        // Call the service to retrieve all projects belonging to the user
        const projects = await getProjects(userId);

        // Return the projects with a success status
        return res.status(200).json(projects);
    } catch (err) {
        // Log error to server console for debugging
        console.error("Error fetching projects:", err);

        // Return generic server error message
        return res.status(500).json({ message: "Failed to fetch projects" });
    }
};


// Controller to create a new project
export const createProjectController = async (req, res) => {
    try {
        // Get the logged-in user's id
        const userId = req.user.id;

        // Create a new project by passing userId and form data from the request body
        const project = await createProject({
            userId,
            ...req.body, // Spread the rest of the project fields (name, date, etc.)
        });

        // Return the newly created project
        return res.status(201).json(project);
    } catch (err) {
        console.error("Error creating project:", err);

        return res.status(500).json({ message: "Failed to create project" });
    }
};


// Controller to get all tasks that belong to a specific project
export const getProjectTasksController = async (req, res) => {
    try {
        const userId = req.user.id;

        // Convert project id from URL params into a number
        const projectId = Number(req.params.id);

        // Validate project id to make sure it's a positive integer
        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({ message: "Invalid project id" });
        }

        // Call service to fetch tasks belonging to this project
        const tasks = await getTasksByProject(userId, projectId);

        // Return tasks list
        return res.status(200).json(tasks);
    } catch (err) {
        console.error("Error fetching project tasks:", err);

        return res.status(500).json({ message: "Failed to fetch project tasks" });
    }
};


// Controller to fetch a single project by id
export const getProjectByIdController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = Number(req.params.id);

        // Validate project id
        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({ message: "Invalid project id" });
        }

        // Fetch the project from the service
        const project = await getProjectById(projectId, userId);

        // If project doesn't exist, return 404
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Return the project
        return res.status(200).json(project);
    } catch (err) {
        console.error("Error fetching project:", err);

        return res.status(500).json({ message: "Failed to fetch project" });
    }
};


// Controller to update an existing project
export const updateProjectController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = Number(req.params.id);

        // Validate project id
        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({ message: "Invalid project id" });
        }

        // Call the service to update the project
        const updated = await updateProject(projectId, userId, req.body);

        // If project wasn't found or didn't belong to the user
        if (!updated) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Return updated project
        return res.status(200).json(updated);
    } catch (err) {
        console.error("Error updating project:", err);

        // Service may throw an error if no valid fields were provided
        if (err.message === "No valid fields to update") {
            return res.status(400).json({ message: err.message });
        }

        return res.status(500).json({ message: "Failed to update project" });
    }
};


// Controller to delete a project
export const removeProjectController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = Number(req.params.id);

        // Validate project id
        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({ message: "Invalid project id" });
        }

        // Call the service to delete the project
        const deleted = await removeProject(projectId, userId);

        // If project does not exist
        if (!deleted) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Return the deleted project
        return res.status(200).json(deleted);
    } catch (err) {
        console.error("Error deleting project:", err);

        return res.status(500).json({ message: "Failed to delete project" });
    }
};