import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(path.resolve(__dirname, './tailwind.config.cjs')),
        autoprefixer(),
      ],
    },
  },
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 1600,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
