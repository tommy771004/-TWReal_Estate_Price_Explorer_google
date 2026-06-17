import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  define: {
    'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party libs out of the main bundle so the initial
        // payload shrinks and vendor code caches independently of app code.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
          if (id.includes('framer-motion') || id.includes('motion')) return 'motion';
          if (id.includes('xlsx') || id.includes('papaparse')) return 'data';
          return 'vendor';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
