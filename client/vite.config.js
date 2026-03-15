import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",  // simulates a browser
    globals: true, // Enables test, expect, etc without importing
    setupFiles: "./src/tests/setup.js" // runs a setup file before tests
  }
})
