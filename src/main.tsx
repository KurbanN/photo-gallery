import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { loadRuntimeConfig } from './lib/runtime-config';

const rootEl = document.getElementById('root')!;

async function bootstrap() {
  try {
    await loadRuntimeConfig();
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка конфигурации';
    rootEl.innerHTML = `<div style="font-family:system-ui;padding:2rem;max-width:28rem;margin:0 auto;line-height:1.5"><p style="color:#991b1b">${msg}</p><p style="font-size:0.875rem;color:#666">См. .env.example и public/app-config.json</p></div>`;
  }
}

void bootstrap();
