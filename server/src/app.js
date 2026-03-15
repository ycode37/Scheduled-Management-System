import cors from "cors";
import express from 'express';
import swaggerUi from "swagger-ui-express";

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import projectRoutes from './routes/projects.routes.js';

import swaggerSpec from "./docs/swagger.js";

import pool from './db/pool.js';

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://scheduled-management-system.vercel.app"
    ]
  })
);

app.use(express.json());

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// DB health check
app.get("/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now;");
    res.json({ db: "ok", now: result.rows[0].now });
  } catch (err) {
    console.error("DB healthcheck failed:", err.message);
    console.error(err);
    res.status(500).json({ db: "error" });
  }
});

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/projects", projectRoutes)

export default app;
