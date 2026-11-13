import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DirectorStudioApp } from './DirectorStudioApp';
import './tailwind.css';

function useLegacy() {
  return new URLSearchParams(window.location.search).has('legacy');
}

async function boot() {
  const root = createRoot(document.getElementById('root')!);
  if (useLegacy()) {
    const { default: LegacyApp } = await import('./LegacyStudioApp');
    root.render(
      <StrictMode>
        <LegacyApp />
      </StrictMode>,
    );
    return;
  }
  root.render(
    <StrictMode>
      <DirectorStudioApp />
    </StrictMode>,
  );
}

void boot();
