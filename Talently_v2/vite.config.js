import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Commit corto del build — identifica qué versión de la capa web corre el
// dispositivo (coincide con la versión registrada en app_bundles para OTA).
let buildCommit = 'dev'
try {
  buildCommit = execSync('git rev-parse --short HEAD').toString().trim()
} catch { /* fuera de un repo git: queda 'dev' */ }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
