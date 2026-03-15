import pool from "../src/db/pool.js";

beforeAll(async () => {
    const res = await pool.query("SELECT current_database()");
    console.log("Connected to database:", res.rows[0].current_database);

    if (!res.rows[0].current_database.includes("test")) {
        throw new Error("Tests are NOT running on a test database!");
    }
});

async function resetDb() {
    await pool.query(`
    TRUNCATE TABLE
      tasks,
      projects,
      users
    RESTART IDENTITY
    CASCADE;
  `);
}

beforeEach(async () => {
    await resetDb();
});

afterAll(async () => {
    await pool.end();
});