import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const root = import.meta.dirname || '.';

/** Dev server: send /admin to /admin/ like Apache's mod_dir does in production. */
const adminTrailingSlash = (): Plugin => ({
  name: 'admin-trailing-slash',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/admin' || req.url?.startsWith('/admin?')) {
        res.statusCode = 301;
        res.setHeader('Location', req.url.replace('/admin', '/admin/'));
        return res.end();
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), adminTrailingSlash()],
    resolve: {
      alias: {
        '@': path.resolve(root),
      },
    },
    build: {
      // Two pages: the app (/) and the admin dashboard (/admin/), each with its own bundle.
      rollupOptions: {
        input: {
          main: path.resolve(root, 'index.html'),
          admin: path.resolve(root, 'admin/index.html'),
        },
      },
    },
    server: {
      // Forward API calls to the Express backend (backend/, default port 5000).
      proxy: {
        '/api': {
          target: process.env.API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
