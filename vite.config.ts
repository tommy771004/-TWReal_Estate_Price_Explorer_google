import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Injects the Google Search Console verification meta tag into the STATIC index.html
// at build time. Google's HTML-tag verification fetches raw HTML and does not run JS,
// so a tag injected later by React is invisible to it. Build-time injection keeps the
// tag in the served HTML while still sourcing the token from the Vercel env var.
const googleSiteVerification = (token: string): Plugin => ({
  name: 'inject-google-site-verification',
  transformIndexHtml() {
    if (!token) return;
    return [
      {
        tag: 'meta',
        attrs: { name: 'google-site-verification', content: token },
        injectTo: 'head',
      },
    ];
  },
});

export default defineConfig(({ mode }) => {
  // '' prefix loads every env var (incl. Vercel's process.env), not just VITE_*.
  const env = loadEnv(mode, process.cwd(), '');
  const verificationToken = (env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();

  return {
    plugins: [react(), tailwindcss(), googleSiteVerification(verificationToken)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY || ''),
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
