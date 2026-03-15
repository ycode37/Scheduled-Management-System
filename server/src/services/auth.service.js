// Import bcrypt to hash and compare passwords securely
import bcrypt from "bcrypt";

// Import database connection pool to run SQL queries
import pool from "../db/pool.js";

// Number of salt rounds used when hashing passwords
// Higher = more secure but slightly slower
const SALT_ROUNDS = 10;

// Service function to register a new user
export const registerUser = async ({ username, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, role`,
      [
        username,
        email,
        hashedPassword,
        "user", // ✅ hardcoded default role
      ],
    );

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      const e = new Error("EMAIL_ALREADY_EXISTS");
      e.status = 409;
      throw e;
    }
    throw err;
  }
};

// Service function to authenticate a user when logging in
export const loginUser = async ({ email, password }) => {
  // Find the user in the database by email
  const result = await pool.query(
    `SELECT id, username, email, password_hash, role
        FROM users
        WHERE email = $1`,
    [email],
  );

  const user = result.rows[0];

  // If no user exists with this email, throw an authentication error
  if (!user) {
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  // Compare the password entered by the user with the stored hashed password
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  // If passwords don't match, return the same error (avoid revealing which part failed)
  if (!passwordMatches) {
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  // If login is successful, return the user data (excluding password hash)
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
};
