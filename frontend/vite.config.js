/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PORT) || 3000, // Use environment variable for port
  },
  plugins: [react(), tailwindcss()],
})
