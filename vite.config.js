import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { playerHubDatabase } from './playerHubDb.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    playerHubDatabase(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
