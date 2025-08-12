// my-fullstack-project/client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // Todas las peticiones que empiecen por /api
        target: 'http://localhost:4000', // Apuntan a tu servidor Express
        changeOrigin: true,
        secure: false, // Para desarrollo, si usas HTTPS en el backend
      },
    },
  },
  build: {
    outDir: '../dist/client', // La salida del build del frontend irá a my-fullstack-project/dist/client
    emptyOutDir: true, // Limpiar el directorio de salida antes de construir
  },
  base: './', // Fundamental para despliegue en Heroku (rutas relativas)
});