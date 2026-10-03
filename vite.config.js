import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// publicDir is staged by scripts/prepare-public.mjs from an explicit allowlist,
// so Blender, model, panorama and video sources stay out of the deployment.
export default defineConfig({
  base: './',
  publicDir: '.generated/public',
  plugins: [react()],
})
