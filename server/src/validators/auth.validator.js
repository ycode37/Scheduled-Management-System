// Import Zod library for validating request data
import { z } from 'zod';


// -------------------------------
// Register validation schema
// -------------------------------

// Define the expected structure for registering a new user
const registerSchema = z.object({

    // Username must be a string between 3 and 30 characters
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be under 30 characters")
        // Trim whitespace before saving/using the value
        .transform((val) => val.trim()),

    // Email must be a valid email format
    email: z
        .email({ message: 'Email must be a valid email address' })
        // Clean the email input by trimming and converting to lowercase
        .transform((val) => val.trim().toLowerCase()),

    // Password must be at least 8 characters long
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
});


// Middleware to validate register requests
export const validateRegister = (req, res, next) => {
    try {

        // Parse and validate the request body using the schema
        // If valid, Zod returns the cleaned data
        req.body = registerSchema.parse(req.body);

        // Continue to the controller
        next();

    } catch (err) {

        // If validation fails, return a 400 Bad Request
        return res.status(400).json({
            message: "Invalid request data",

            // Zod includes detailed validation errors
            errors: err.errors,
        });
    }
};


// -------------------------------
// Login validation schema
// -------------------------------

// Define the expected structure for logging in
const loginSchema = z.object({

    // Email must be valid and is cleaned before use
    email: z
        .email({ message: 'Email must be a valid email address' })
        .transform((val) => val.trim().toLowerCase()),

    // Password is required (minimum length of 1 ensures it isn't empty)
    password: z
        .string()
        .min(1, "Password required")
});


// Middleware to validate login requests
export const validateLogin = (req, res, next) => {
    try {

        // Validate request body using login schema
        req.body = loginSchema.parse(req.body);

        // If valid, continue to login controller
        next();

    } catch (err) {

        // Return validation errors if input data is invalid
        return res.status(400).json({
            message: "Invalid request data",
            errors: err.errors,
        });
    }
};