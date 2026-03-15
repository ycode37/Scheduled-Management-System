// Middleware function used to validate request data against a schema
// "schema" will usually be a Zod schema that defines the expected shape of the request body
export const validate = (schema) => (req, res, next) => {
    try {
        // Parse and validate the incoming request body using the provided schema
        // If validation succeeds, Zod returns the parsed/cleaned data
        req.body = schema.parse(req.body);

        // Continue to the next middleware or controller
        next();

    } catch (err) {

        // If validation fails, return a 400 Bad Request with validation details
        return res.status(400).json({
            message: "Validation error",

            // Zod stores validation issues in err.errors
            // Fallback to err in case errors property doesn't exist
            errors: err.errors ?? err,
        });
    }
};