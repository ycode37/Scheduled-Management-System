// Import Zod library for schema validation
import { z } from "zod";


// Define allowed project status values
// z.enum ensures the status can only be one of these options
const statusEnum = z.enum(["Complete", "In Progress", "Not Started"]);


// Schema used when creating a new project
export const createProjectSchema = z.object({

  // Project name is required and must be at least 1 character
  name: z.string().min(1, "Project name is required"),

  // Scheduled completion date is optional
  // It may be null or a valid date string
  scheduled_completion: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      // Convert empty strings into null so the database stores NULL instead of ""
      if (!val || val.trim() === "") return null;
      return val;
    })
    .refine(
      // Ensure the value is either null or a valid date
      (val) => val === null || !isNaN(Date.parse(val)),
      "Invalid date format"
    ),

  // Project status must match one of the values in statusEnum
  // Default value is "Not Started"
  status: statusEnum.default("Not Started"),
});


// Schema used when updating a project
// .partial() makes every field optional so the user can update only specific fields
export const updateProjectSchema = createProjectSchema.partial();
