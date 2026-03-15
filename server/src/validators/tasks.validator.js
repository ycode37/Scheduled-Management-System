// Import Zod for request data validation
import { z } from "zod";


// Schema used when creating a new task
export const createTaskSchema = z.object({

  // Task title is required and must contain at least 1 character
  title: z.string().min(1, "Title is required"),

  // Due date is optional
  // If provided, it must be a valid date string
  due_date: z
    .string()
    .optional()
    .refine(
      // Allow empty values OR valid date strings
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid date format"
    ),

  // Task progress represents completion percentage
  // Value must be between 0 and 100
  progress: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  // Project ID links the task to a project
  // It must be a positive integer if provided
  // Can also be null if the task is not assigned to a project
  project_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
});


// Schema used when updating an existing task
// .partial() makes every field optional so users can update only specific fields
export const updateTaskSchema = createTaskSchema.partial();