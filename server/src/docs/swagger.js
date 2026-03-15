import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SimpliTask Pro API",
            version: "1.0.0",
            description: "API documentation for the SimpliTask Pro backend",
        },

        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],

        components: {

            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },

            schemas: {

                /* ======================
                   USER / AUTH SCHEMAS
                ====================== */

                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1,
                        },
                        username: {
                            type: "string",
                            example: "harrison",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "harrison@test.com",
                        },
                    },
                },

                RegisterRequest: {
                    type: "object",
                    required: ["username", "email", "password"],
                    properties: {
                        username: {
                            type: "string",
                            example: "harrison",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "harrison@test.com",
                        },
                        password: {
                            type: "string",
                            example: "Password123!",
                        },
                    },
                },

                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "harrison@test.com",
                        },
                        password: {
                            type: "string",
                            example: "Password123!",
                        },
                    },
                },

                LoginResponse: {
                    type: "object",
                    properties: {
                        user: {
                            $ref: "#/components/schemas/User",
                        },
                        token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                    },
                },

                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Invalid request",
                        },
                    },
                },

                /* ======================
                   TASK SCHEMAS
                ====================== */

                Task: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1,
                        },
                        title: {
                            type: "string",
                            example: "Finish backend tests",
                        },
                        due_date: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2026-03-10",
                        },
                        progress: {
                            type: "integer",
                            minimum: 0,
                            maximum: 100,
                            example: 25,
                        },
                        project_id: {
                            type: "integer",
                            nullable: true,
                            example: 2,
                        },
                        project_name: {
                            type: "string",
                            nullable: true,
                            example: "Website Redesign",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                CreateTaskRequest: {
                    type: "object",
                    required: ["title"],
                    properties: {
                        title: {
                            type: "string",
                            example: "Finish backend tests",
                        },
                        due_date: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2026-03-10",
                        },
                        progress: {
                            type: "integer",
                            minimum: 0,
                            maximum: 100,
                            example: 25,
                        },
                        project_id: {
                            type: "integer",
                            nullable: true,
                            example: 2,
                        },
                    },
                },

                UpdateTaskRequest: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            example: "Updated task title",
                        },
                        due_date: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2026-03-12",
                        },
                        progress: {
                            type: "integer",
                            minimum: 0,
                            maximum: 100,
                            example: 80,
                        },
                        project_id: {
                            type: "integer",
                            nullable: true,
                            example: 2,
                        },
                    },
                },

                /* ======================
                   PROJECT SCHEMAS
                ====================== */

                Project: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1,
                        },
                        name: {
                            type: "string",
                            example: "Website Redesign",
                        },
                        scheduled_completion: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2026-04-10",
                        },
                        status: {
                            type: "string",
                            enum: ["Complete", "In Progress", "Not Started"],
                            example: "In Progress",
                        },
                        task_count: {
                            type: "integer",
                            example: 3,
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                CreateProjectRequest: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Website Redesign",
                        },
                        scheduled_completion: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2026-04-10",
                        },
                        status: {
                            type: "string",
                            enum: ["Complete", "In Progress", "Not Started"],
                            example: "Not Started",
                        },
                    },
                },

                UpdateProjectRequest: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            example: "Updated Project Name",
                        },
                        scheduled_completion: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2026-04-15",
                        },
                        status: {
                            type: "string",
                            enum: ["Complete", "In Progress", "Not Started"],
                            example: "Complete",
                        },
                    },
                },
            },
        },

        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;