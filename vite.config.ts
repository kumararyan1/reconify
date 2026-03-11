import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/reconify/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.tsx',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
