// Import jsonwebtoken so we can verify JWT tokens sent by the client
import jwt from "jsonwebtoken";


// Middleware to protect routes that require authentication
export const requireAuth = (req, res, next) => {

    // Get the Authorization header from the request
    const authHeader = req.headers.authorization;

    // Check that the header exists and starts with "Bearer "
    // Example: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using the secret stored in environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store the decoded token data on the request object
        // This allows other controllers to access the user's id/role
        req.user = decoded; // Example: { id, role }

        // Continue to the next middleware/controller
        next();

    } catch {
        // If token verification fails (expired or invalid)
        return res.status(401).json({ message: "Invalid token" });
    }
};


// Middleware to restrict access to admin users only
export const requireAdmin = (req, res, next) => {

    // Check the role stored in req.user from the requireAuth middleware
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" })
    }

    // If the user is an admin, allow the request to continue
    next()
};