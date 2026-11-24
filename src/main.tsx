import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { Analytics } from '@vercel/analytics/react';
import 'lenis/dist/lenis.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Cookie-free visitor stats (Vercel Web Analytics). Only reports on the deployed site. */}
    <Analytics />
  </StrictMode>,
);
