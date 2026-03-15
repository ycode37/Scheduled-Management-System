export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/jest.env.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  transform: {},
};