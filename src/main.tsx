import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import SeoContentPage from './components/SeoContentPage.tsx';
import { getSeoContentPage } from './content/seoPages.ts';
import '@fontsource-variable/geist';
import './index.css';

const seoContentPage = getSeoContentPage(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {seoContentPage ? <SeoContentPage page={seoContentPage} /> : <App />}
  </StrictMode>,
);
