import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const root = import.meta.dirname || '.';

/** Dev server: send /admin or /combo-2 to trailing slash like mod_dir. */
const adminTrailingSlash = (): Plugin => ({
  name: 'admin-trailing-slash',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/admin' || req.url?.startsWith('/admin?')) {
        res.statusCode = 301;
        res.setHeader('Location', req.url.replace('/admin', '/admin/'));
        return res.end();
      }
      if (req.url === '/combo-2' || req.url?.startsWith('/combo-2?')) {
        res.statusCode = 301;
        res.setHeader('Location', req.url.replace('/combo-2', '/combo-2/'));
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
      // Multi-page entries: the app (/), the admin dashboard (/admin/), and combo landing (/combo-2/)
      rollupOptions: {
        input: {
          main: path.resolve(root, 'index.html'),
          admin: path.resolve(root, 'admin/index.html'),
          combo2: path.resolve(root, 'combo-2/index.html'),
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
