import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { CITIES, TRANSACTION_TYPES } from './src/constants';
import { buildSelectionSearch } from './src/lib/urlState';

// Last-resort origin when neither VITE_SITE_URL nor Vercel's build env is present.
const PROD_FALLBACK_ORIGIN = 'https://tw-real-estate-price-explorer-googl.vercel.app';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

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

// Emits sitemap.xml + robots.txt as STATIC files in dist/. Vercel serves real files
// before applying rewrites/functions, so these never touch the serverless function
// (which is currently failing) and always return 200 for Google.
const seoStaticFiles = (origin: string): Plugin => ({
  name: 'generate-seo-static-files',
  apply: 'build',
  generateBundle() {
    const lastmod = new Date().toISOString();

    const urls: { loc: string; priority: string }[] = [{ loc: `${origin}/`, priority: '1.0' }];
    for (const city of CITIES) {
      for (const type of TRANSACTION_TYPES) {
        const search = buildSelectionSearch({ cityName: city.name, typeName: type.name });
        if (!search) continue; // default combo === homepage, already added
        urls.push({ loc: `${origin}/${search}`, priority: '0.8' });
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');

    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
  },
});

export default defineConfig(({ mode }) => {
  // '' prefix loads every env var (incl. Vercel's process.env), not just VITE_*.
  const env = loadEnv(mode, process.cwd(), '');
  const verificationToken = (env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();

  // VERCEL_PROJECT_PRODUCTION_URL is injected by Vercel at build (host without scheme).
  const siteOrigin = (
    env.VITE_SITE_URL?.trim() ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    PROD_FALLBACK_ORIGIN
  ).replace(/\/+$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      googleSiteVerification(verificationToken),
      seoStaticFiles(siteOrigin),
    ],
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
