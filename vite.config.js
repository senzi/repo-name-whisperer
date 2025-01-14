import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    server: {
      proxy: command === 'serve' ? {
        '/api/generate-name': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response:', proxyRes.statusCode);
              if (proxyRes.statusCode >= 400) {
                let body = '';
                proxyRes.on('data', chunk => {
                  body += chunk;
                });
                proxyRes.on('end', () => {
                  console.log('Error Response Body:', body);
                });
              }
            });
          }
        }
      } : {}
    }
  }
})
