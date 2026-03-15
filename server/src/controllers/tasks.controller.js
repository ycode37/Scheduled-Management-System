// Import task service functions that handle database operations
import { getTasks, createTask, getTaskById, updateTask, removeTask } from "../services/tasks.service.js";


// Controller to fetch all tasks belonging to the logged-in user
export const getTasksController = async (req, res) => {
  try {
    // Check that the user is authenticated and has an id
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Call the service to retrieve tasks for the current user
    const tasks = await getTasks(req.user.id);

    // Return tasks with success status
    return res.status(200).json(tasks);
  } catch (err) {
    // Log the error on the server for debugging
    console.error("Error fetching tasks:", err);

    // Return generic error message
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};


// Controller to create a new task
export const createTaskController = async (req, res) => {
  try {
    // Get the logged-in user's id from authentication middleware
    const userId = req.user.id;

    // Call service to create the task
    // Spread operator allows us to pass all task fields from the request body
    const task = await createTask({
      userId,
      ...req.body,
    });

    // Return the newly created task with status 201
    return res.status(201).json(task);

  } catch (err) {
    console.error("Error creating task:", err);

    // If an invalid project was selected, return a client error
    if (err.message === "Invalid project selection") {
      return res.status(400).json({ message: err.message });
    }

    // Otherwise return a generic server error
    return res.status(500).json({ message: "Failed to create task" });
  }
};


// Controller to get a single task by its id
export const getTaskByIdController = async (req, res) => {
  try {
    const userId = req.user.id;

    // Convert task id from URL parameter to a number
    const taskId = Number(req.params.id);

    // Validate the task id
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    // Fetch the task from the service layer
    const task = await getTaskById(taskId, userId);

    // If the task doesn't exist, return a 404
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return the task data
    return res.status(200).json(task);

  } catch (err) {
    console.error("Error fetching task:", err);

    return res.status(500).json({ message: "Failed to fetch task" });
  }
};


// Controller to update an existing task
export const updateTaskController = async (req, res) => {
  try {
    const userId = req.user.id;

    // Convert task id from URL params to number
    const taskId = Number(req.params.id);

    // Validate task id
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    // Call the service to update the task with new values
    const updatedTask = await updateTask(taskId, userId, req.body);

    // If task wasn't found return 404
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return the updated task
    return res.status(200).json(updatedTask);

  } catch (err) {
    console.error("Error updating task:", err);

    // If the project selected is invalid
    if (err.message === "Invalid project selection") {
      return res.status(400).json({ message: err.message });
    }

    // If the request didn't include any valid fields to update
    if (err.message === "No valid fields to update") {
      return res.status(400).json({ message: err.message });
    }

    // Generic server error
    return res.status(500).json({ message: "Failed to update task" });
  }
};


// Controller to delete a task
export const removeTaskController = async (req, res) => {
  try {
    const userId = req.user.id;

    // Convert task id from URL parameter to number
    const taskId = Number(req.params.id);

    // Validate task id
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    // Call service to delete the task
    const deletedTask = await removeTask(taskId, userId);

    // If task doesn't exist return 404
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return deleted task data
    return res.status(200).json(deletedTask);

  } catch (err) {
    console.error("Error deleting task:", err);

    return res.status(500).json({ message: "Failed to delete task" });
  }
};