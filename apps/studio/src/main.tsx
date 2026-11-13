import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PrevisCanvas } from './PrevisCanvas';
import { ProjectAttribution } from './components/ProjectAttribution';
import { normalizePrevisPlan, type PrevisPlan } from '@core/previsPlanCore.ts';
import { normalizePrevisWorldRef, type PrevisWorldRef } from '@core/previsWorldGen.ts';

function App() {
  const [plan, setPlan] = useState<PrevisPlan | null>(null);
  const [worldRef, setWorldRef] = useState<PrevisWorldRef | null>(null);
  const [playing, setPlaying] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [planRes, refRes] = await Promise.all([
          fetch('/examples/edo-rainy-night/plan.json'),
          fetch('/examples/edo-rainy-night/world-ref.json'),
        ]);
        const planJson = await planRes.json();
        const refJson = await refRes.json();
        setPlan(normalizePrevisPlan(planJson));
        setWorldRef(normalizePrevisWorldRef(refJson));
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#121415', color: '#eee' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Bloomway World Director — Studio (preview)</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.8 }}>Example: Edo rainy night — blockout previs</p>
        <button type="button" onClick={() => setPlaying((p) => !p)} style={{ marginTop: 8 }}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </header>
      <main style={{ flex: 1, padding: 8 }}>
        {err ? <p>{err}</p> : null}
        {plan && worldRef ? <PrevisCanvas plan={plan} worldRef={worldRef} playing={playing} /> : <p>Loading example…</p>}
      </main>
      <ProjectAttribution />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
