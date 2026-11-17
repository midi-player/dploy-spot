import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

const boot = document.getElementById('boot');
if (boot) {
  const wait = Math.max(0, 1200 - performance.now());
  window.setTimeout(() => { boot.classList.add('hide'); window.setTimeout(() => boot.remove(), 600); }, wait);
}
