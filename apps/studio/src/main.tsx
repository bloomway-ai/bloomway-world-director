import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PrevisCanvas } from './PrevisCanvas';
import { ProjectAttribution } from './components/ProjectAttribution';
import { normalizePrevisPlan, type PrevisPlan } from '@core/previsPlanCore.ts';
import { normalizePrevisWorldRef, type PrevisWorldRef } from '@core/previsWorldGen.ts';

function App() {
  const [plan, setPlan] = useState<PrevisPlan | null>(null);
  const [worldRef, setWorldRef] = useState<PrevisWorldRef | null>(null);
  const [playing, setPlaying] = useState(() => new URLSearchParams(window.location.search).has('autoplay'));
  const [timeSec, setTimeSec] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const onTimeSecChange = useCallback((t: number) => {
    setTimeSec(t);
    if (plan && t >= plan.durationSec) setPlaying(false);
  }, [plan]);

  useEffect(() => {
    (async () => {
      try {
        const [planRes, refRes] = await Promise.all([
          fetch('/examples/edo-rainy-night/plan.json'),
          fetch('/examples/edo-rainy-night/world-ref.json'),
        ]);
        const planJson = await planRes.json();
        const refJson = await refRes.json();
        const p = normalizePrevisPlan(planJson);
        setPlan(p);
        setWorldRef(normalizePrevisWorldRef(refJson));
        if (new URLSearchParams(window.location.search).has('autoplay')) {
          setPlaying(true);
          setTimeSec(0);
        }
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, []);

  const duration = plan?.durationSec ?? 12;

  const togglePlay = () => {
    if (!playing && timeSec >= duration) setTimeSec(0);
    setPlaying((p) => !p);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#121415', color: '#eee' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Bloomway World Director — Studio (preview)</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.8 }}>Example: Edo rainy night — blockout previs</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" data-testid="play-toggle" onClick={togglePlay}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            Time
            <input
              type="range"
              data-testid="time-scrub"
              min={0}
              max={duration}
              step={0.05}
              value={timeSec}
              onChange={(e) => {
                setPlaying(false);
                setTimeSec(Number(e.target.value));
              }}
              style={{ width: 180 }}
            />
            <span data-testid="time-label">{timeSec.toFixed(1)}s / {duration}s</span>
          </label>
        </div>
      </header>
      <main style={{ flex: 1, padding: 8, minHeight: 400 }}>
        {err ? <p>{err}</p> : null}
        {plan && worldRef ? (
          <PrevisCanvas
            plan={plan}
            worldRef={worldRef}
            playing={playing}
            timeSec={timeSec}
            onTimeSecChange={onTimeSecChange}
          />
        ) : (
          <p>Loading example…</p>
        )}
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
