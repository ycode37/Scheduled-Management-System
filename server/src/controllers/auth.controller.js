// Import jsonwebtoken to create authentication tokens
import jwt from 'jsonwebtoken';

// Import service functions that handle the business logic for auth
import { registerUser, loginUser } from "../services/auth.service.js";


// Controller for registering a new user
export const registerController = async (req, res) => {
    try {
        // Call the registerUser service and pass the request body (user data)
        const user = await registerUser(req.body);

        // If successful, return the created user with status 201 (Created)
        return res.status(201).json({ user });

    } catch (err) {

        // If the email already exists in the database, return a 409 conflict error
        if (err.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Log the error to the server console for debugging
        console.error(err);

        // Return a generic server error response
        return res.status(500).json({ message: "Server error" });
    }
};


// Controller for logging in an existing user
export const loginController = async (req, res) => {
    try {
        // Call the loginUser service to validate the user's credentials
        const user = await loginUser(req.body);

        // Temporary console log to check what user data is returned
        console.log("LOGIN user:", user);

        // Create a JWT token that includes some user information
        // This token will be used for authenticating future requests
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username, email: user.email },
            process.env.JWT_SECRET,   // Secret key stored in environment variables
            { expiresIn: "1h" }       // Token expires in 1 hour
        );

        // Send the user data and token back to the client
        return res.status(200).json({ user, token });

    } catch (err) {

        // If the login credentials are invalid, return a 401 Unauthorized error
        if (err.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Log unexpected errors for debugging
        console.error(err);

        // Return a generic server error response
        return res.status(500).json({ message: "Server error" });
    }
};