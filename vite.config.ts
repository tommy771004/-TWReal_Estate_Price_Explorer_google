import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { INDEXABLE_SELECTIONS, buildSelectionPath, buildSeoCopy } from './src/lib/seoRoutes';
import { SEO_CONTENT_PAGES } from './src/content/seoPages';

const SEO_LAST_MODIFIED_TOKEN = '__SEO_LAST_MODIFIED__';
const GOOGLE_SITE_VERIFICATION_MARKER = '<!-- GOOGLE_SITE_VERIFICATION -->';

const resolveSeoLastModified = () => {
  const explicitDate = process.env.SEO_LAST_MODIFIED?.trim();
  if (explicitDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(explicitDate)) {
      throw new Error('SEO_LAST_MODIFIED must use YYYY-MM-DD format.');
    }
    return explicitDate;
  }

  const sourceDateEpoch = Number(process.env.SOURCE_DATE_EPOCH);
  const date = Number.isFinite(sourceDateEpoch) && sourceDateEpoch > 0
    ? new Date(sourceDateEpoch * 1000)
    : new Date();

  return date.toISOString().slice(0, 10);
};

const seoLastModified = resolveSeoLastModified();

const resolveGoogleSiteVerification = () => {
  const token = process.env.VITE_GOOGLE_SITE_VERIFICATION?.trim() ?? '';
  if (token && !/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('VITE_GOOGLE_SITE_VERIFICATION contains unsupported characters.');
  }
  return token;
};

const googleSiteVerification = resolveGoogleSiteVerification();

const renderContentPage = (page: (typeof SEO_CONTENT_PAGES)[number]) => {
  const sections = page.sections.map((section) => `
      <section>
        <h2>${section.heading}</h2>
        ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n        ')}
        ${section.items ? `<ul>${section.items.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
      </section>`).join('');
  const relatedLinks = page.links ? `<nav aria-label="本頁相關入口">
      <h2>相關頁面</h2>
      <ul>${page.links.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}</ul>
    </nav>` : '';

  return `<main data-seo-content-page class="seo-shell">
    <p><a href="/">← 返回實價登錄查詢</a></p>
    <article>
      <h1>${page.title}</h1>
      <p>${page.intro}</p>${sections}${relatedLinks}
      <nav aria-label="資訊頁導覽">
        <h2>相關資訊</h2>
        <ul><li><a href="/methodology/">方法說明</a></li><li><a href="/data-sources/">資料來源</a></li><li><a href="/privacy/">隱私權</a></li><li><a href="/contact/">聯絡</a></li></ul>
      </nav>
    </article>
  </main>`;
};

const seoBuildMetadata = () => ({
  name: 'seo-build-metadata',
  transformIndexHtml(html: string) {
    const verificationMeta = googleSiteVerification
      ? `<meta name="google-site-verification" content="${googleSiteVerification}" />`
      : GOOGLE_SITE_VERIFICATION_MARKER;
    return html
      .replaceAll(SEO_LAST_MODIFIED_TOKEN, seoLastModified)
      .replace(GOOGLE_SITE_VERIFICATION_MARKER, verificationMeta);
  },
  async writeBundle(options: { dir?: string }) {
    const outputDirectory = path.resolve(__dirname, options.dir ?? 'dist');
    const homepagePath = path.join(outputDirectory, 'index.html');
    const homepage = await readFile(homepagePath, 'utf8');
    const siteOrigin = (process.env.VITE_SITE_URL || 'https://tw-real-estate-price-explorer-googl.vercel.app').replace(/\/+$/, '');

    for (const selection of INDEXABLE_SELECTIONS) {
      const routePath = buildSelectionPath(selection);
      if (routePath === '/') continue;

      const { title, description, scopeLabel } = buildSeoCopy(selection);
      const canonicalUrl = `${siteOrigin}${routePath}`;
      const collectionPage = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'zh-Hant-TW',
        dateModified: seoLastModified,
        isPartOf: { '@id': `${siteOrigin}/#website` },
        about: { '@type': 'Thing', name: `${scopeLabel}${selection.typeName}房地產成交紀錄` },
      };
      const routeHtml = homepage
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/s, `$1${description}$2`)
        .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
        .replace(/(<meta property="og:description"\s+content=")[^"]*(")/s, `$1${description}$2`)
        .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
        .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
        .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/s, `$1${description}$2`)
        .replace('<h1>實價登錄查詢</h1>', `<h1>${scopeLabel}${selection.typeName}實價登錄查詢</h1>`)
        .replace(
          /(<h1>.*?<\/h1>\s*<p>)[\s\S]*?(<\/p>)/,
          `$1${description} 本頁提供可篩選的成交資料、統計圖表與地圖檢視。$2`,
        )
        .replace(
          '<script type="module"',
          `<script type="application/ld+json" data-seo-id="collection">\n${JSON.stringify(collectionPage, null, 2)}\n</script>\n    <script type="module"`,
        );

      const routeDirectory = path.join(outputDirectory, decodeURIComponent(routePath));
      await mkdir(routeDirectory, { recursive: true });
      await writeFile(path.join(routeDirectory, 'index.html'), routeHtml, 'utf8');
    }

    for (const page of SEO_CONTENT_PAGES) {
      const canonicalUrl = `${siteOrigin}${page.path}`;
      const title = `${page.title} | 實價登錄查詢`;
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: page.title,
        description: page.description,
        inLanguage: 'zh-Hant-TW',
        dateModified: seoLastModified,
        isPartOf: { '@id': `${siteOrigin}/#website` },
      };
      const pageHtml = homepage
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/s, `$1${page.description}$2`)
        .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
        .replace(/(<meta property="og:description"\s+content=")[^"]*(")/s, `$1${page.description}$2`)
        .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
        .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
        .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/s, `$1${page.description}$2`)
        .replace(/<div id="root">[\s\S]*?<\/div>\s*<noscript>/, `<div id="root">${renderContentPage(page)}</div>\n    <noscript>`)
        .replace(
          '<script type="module"',
          `<script type="application/ld+json" data-seo-id="webpage">\n${JSON.stringify(structuredData, null, 2)}\n</script>\n    <script type="module"`,
        );
      const pageDirectory = path.join(outputDirectory, page.path);
      await mkdir(pageDirectory, { recursive: true });
      await writeFile(path.join(pageDirectory, 'index.html'), pageHtml, 'utf8');
    }

    const sitemapUrls = [
      ...INDEXABLE_SELECTIONS.map((selection) => `${siteOrigin}${buildSelectionPath(selection)}`),
      ...SEO_CONTENT_PAGES.map((page) => `${siteOrigin}${page.path}`),
    ];
    const sitemapEntries = sitemapUrls.map((url) => {
      return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${seoLastModified}</lastmod>\n  </url>`;
    }).join('\n');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
    await writeFile(path.join(outputDirectory, 'sitemap.xml'), sitemap, 'utf8');
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), seoBuildMetadata()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  define: {
    'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || ''),
    __SEO_LAST_MODIFIED__: JSON.stringify(seoLastModified),
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
