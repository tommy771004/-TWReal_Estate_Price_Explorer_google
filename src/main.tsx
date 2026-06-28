import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { getSeoContentPage } from './content/seoPages.ts';
import '@fontsource-variable/geist';
import './index.css';

const seoContentPage = getSeoContentPage(window.location.pathname);
const root = createRoot(document.getElementById('root')!);

// Route-level code splitting: content/guide pages never pull in App's heavy
// query UI (leaflet, recharts, google-maps), keeping their critical path light.
if (seoContentPage) {
  import('./components/SeoContentPage.tsx').then(({ default: SeoContentPage }) => {
    root.render(
      <StrictMode>
        <SeoContentPage page={seoContentPage} />
      </StrictMode>,
    );
  });
} else {
  import('./App.tsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}
