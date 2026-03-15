import request from "supertest";
import app from "../src/app.js";

export function uniqueEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
}

export async function registerUser({
  username = "testuser",
  email = uniqueEmail(),
  password = "Password123!"
} = {}) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username, email, password });

  return { res, email, password, username };
}

export async function loginUser(email, password) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
}

export async function registerAndLogin() {
  const { email, password } = await registerUser();
  const token = await loginUser(email, password);

  return { token, email, password };
}

export function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}