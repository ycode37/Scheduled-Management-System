// Import the PostgreSQL connection pool so we can run SQL queries
import pool from "../db/pool.js";


// Service to get all tasks belonging to a specific user
export const getTasks = async (userId) => {
  try {
    // Query tasks for the logged-in user
    // LEFT JOIN projects allows us to include the project name if the task belongs to one
    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.due_date,
        t.progress,
        t.project_id,
        p.name AS project_name,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      WHERE t.user_id = $1
      ORDER BY t.due_date NULLS LAST, t.created_at DESC
      `,
      [userId]
    );

    // Return all tasks as an array
    return result.rows;
  } catch (err) {
    // Re-throw error so controller can handle it
    throw err;
  }
};


// Service to create a new task
export const createTask = async ({
  userId,
  title,
  due_date,
  progress = 0,
  project_id = null,
}) => {
  try {

    // If a project_id was provided, check that the project belongs to the user
    if (project_id) {
      const projectCheck = await pool.query(
        `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
        [project_id, userId]
      );

      // If project doesn't belong to the user, throw an error
      if (projectCheck.rowCount === 0) {
        throw new Error("Invalid project selection");
      }
    }

    // Insert the new task into the database
    const result = await pool.query(
      `
      INSERT INTO tasks (user_id, project_id, title, due_date, progress)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        title,
        due_date,
        progress,
        project_id,
        created_at,
        updated_at
      `,
      [userId, project_id, title, due_date, progress]
    );

    // Return the created task
    return result.rows[0];

  } catch (err) {
    throw err;
  }
};


// Service to get a single task by its id
export const getTaskById = async (taskId, userId) => {
  try {
    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.due_date,
        t.progress,
        t.project_id,
        p.name AS project_name,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      WHERE t.id = $1 AND t.user_id = $2
      `,
      [taskId, userId]
    );

    // If task doesn't exist return null
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];

  } catch (err) {
    throw err;
  }
};


// Service to update an existing task
export const updateTask = async (id, userId, data) => {
  try {

    // If project_id is being updated (and not null),
    // verify the project belongs to the user
    if (Object.prototype.hasOwnProperty.call(data, "project_id") && data.project_id !== null) {
      const projectCheck = await pool.query(
        `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
        [data.project_id, userId]
      );

      if (projectCheck.rowCount === 0) {
        throw new Error("Invalid project selection");
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    // Loop through fields sent by the client
    for (const [key, value] of Object.entries(data)) {

      // Only allow specific columns to be updated
      const allowed = ["title", "due_date", "progress", "project_id"];
      if (!allowed.includes(key)) continue;

      // Build the SQL update fields dynamically
      fields.push(`${key} = $${index}`);
      values.push(value); // value can be null (allows "Unassigned")
      index++;
    }

    // If no valid fields were provided
    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);

    // Build the update query
    // user_id is included so users cannot update other users' tasks
    const query = `
      UPDATE tasks
      SET ${fields.join(", ")}
      WHERE id = $${index} AND user_id = $${index + 1}
      RETURNING id, title, due_date, progress, project_id, created_at, updated_at
    `;

    values.push(id, userId);

    const result = await pool.query(query, values);

    // If no rows updated, the task doesn't exist or doesn't belong to the user
    if (result.rowCount === 0) return null;

    return result.rows[0];

  } catch (err) {
    throw err;
  }
};


// Service to delete a task
export const removeTask = async (taskId, userId) => {

  const result = await pool.query(
    `
    DELETE FROM tasks
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, due_date, progress, project_id, created_at, updated_at
    `,
    [taskId, userId]
  );

  // Return deleted task or null if it didn't exist
  return result.rows[0] ?? null;
};