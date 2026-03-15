// Import the PostgreSQL connection pool so we can run database queries
import pool from "../db/pool.js";


// Service to get all projects for a specific user
export const getProjects = async (userId) => {

    // Query projects belonging to the user
    // LEFT JOIN tasks allows us to count how many tasks belong to each project
    const result = await pool.query(
        `
    SELECT
      p.id,
      p.name,
      p.scheduled_completion,
      p.status,
      p.created_at,
      p.updated_at,
      COUNT(t.id)::int AS task_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id AND t.user_id = p.user_id
    WHERE p.user_id = $1
    GROUP BY p.id
    ORDER BY p.scheduled_completion NULLS LAST, p.created_at DESC
    `,
        [userId]
    );

    // Return all projects as an array
    return result.rows;
};


// Service to create a new project
export const createProject = async ({
    userId,
    name,
    scheduled_completion = null,
    status = "Not Started",
}) => {

    // Insert a new project into the database
    const result = await pool.query(
        `
    INSERT INTO projects (user_id, name, scheduled_completion, status)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      scheduled_completion,
      status,
      created_at,
      updated_at
    `,
        [userId, name, scheduled_completion, status]
    );

    // Return the created project
    return result.rows[0];
};


// Service to get all tasks belonging to a specific project
export const getTasksByProject = async (userId, projectId) => {

    const result = await pool.query(
        `
    SELECT
      t.id, t.title, t.due_date, t.progress, t.project_id,
      p.name AS project_name,
      t.created_at, t.updated_at
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE t.user_id = $1 AND t.project_id = $2
    ORDER BY t.due_date NULLS LAST, t.created_at DESC
    `,
        [userId, projectId]
    );

    // Return all tasks assigned to the project
    return result.rows;
};


// Service to get a single project by its id
export const getProjectById = async (projectId, userId) => {

    const result = await pool.query(
        `
    SELECT
      p.id,
      p.name,
      p.scheduled_completion,
      p.status,
      p.created_at,
      p.updated_at,
      COUNT(t.id)::int AS task_count
    FROM projects p
    LEFT JOIN tasks t
      ON t.project_id = p.id
      AND t.user_id = p.user_id
    WHERE p.id = $1 AND p.user_id = $2
    GROUP BY p.id
    `,
        [projectId, userId]
    );

    // Return the project if found, otherwise return null
    return result.rows[0] ?? null;
};


// Service to update an existing project
export const updateProject = async (projectId, userId, data) => {

    // Only allow specific fields to be updated
    const allowed = ["name", "scheduled_completion", "status"];

    const fields = [];
    const values = [];
    let index = 1;

    // Loop through the provided data and build dynamic SQL fields
    for (const [key, value] of Object.entries(data)) {

        // Ignore fields that are not allowed
        if (!allowed.includes(key)) continue;

        // Build the SQL update statement dynamically
        fields.push(`${key} = $${index}`);
        values.push(value); // scheduled_completion can be null
        index++;
    }

    // If no valid fields were provided, throw an error
    if (fields.length === 0) {
        throw new Error("No valid fields to update");
    }

    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);

    // Add projectId and userId to the query values
    values.push(projectId, userId);

    const result = await pool.query(
        `
    UPDATE projects
    SET ${fields.join(", ")}
    WHERE id = $${index} AND user_id = $${index + 1}
    RETURNING
      id,
      name,
      scheduled_completion,
      status,
      created_at,
      updated_at
    `,
        values
    );

    // Return updated project or null if not found
    return result.rows[0] ?? null;
};


// Service to delete a project
export const removeProject = async (projectId, userId) => {

    const result = await pool.query(
        `
    DELETE FROM projects
    WHERE id = $1 AND user_id = $2
    RETURNING
      id,
      name,
      scheduled_completion,
      status,
      created_at,
      updated_at
    `,
        [projectId, userId]
    );

    // Return the deleted project or null if it didn't exist
    return result.rows[0] ?? null;
};