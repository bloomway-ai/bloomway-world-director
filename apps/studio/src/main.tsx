import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PrevisCanvas } from './PrevisCanvas';
import { ProjectAttribution } from './components/ProjectAttribution';
import { normalizePrevisPlan, type PrevisPlan } from '@core/previsPlanCore.ts';
import { normalizePrevisWorldRef, type PrevisWorldRef } from '@core/previsWorldGen.ts';
import './studio.css';

function useQueryFlags() {
  return useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    return { autoplay: q.has('autoplay'), demo: q.has('demo') };
  }, []);
}

function App() {
  const { autoplay } = useQueryFlags();
  const [plan, setPlan] = useState<PrevisPlan | null>(null);
  const [worldRef, setWorldRef] = useState<PrevisWorldRef | null>(null);
  const [playing, setPlaying] = useState(autoplay);
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
        if (autoplay) {
          setPlaying(true);
          setTimeSec(0);
        }
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, [autoplay]);

  const duration = plan?.durationSec ?? 12;

  const togglePlay = () => {
    if (!playing && timeSec >= duration) setTimeSec(0);
    setPlaying((p) => !p);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Bloomway World Director</h1>
        <p className="subtitle">Studio preview · Edo rainy night (blockout)</p>
        <span className="badge">Open-source · JSON-driven previs</span>
        <div className="controls">
          <button type="button" className="btn-play" data-testid="play-toggle" onClick={togglePlay}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <label className="scrub">
            Timeline
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
            />
            <span className="time-readout" data-testid="time-label">
              {timeSec.toFixed(1)}s / {duration}s
            </span>
          </label>
        </div>
      </header>
      <main className="main-view">
        {err ? <p>{err}</p> : null}
        <div className="canvas-frame">
          {plan && worldRef ? (
            <PrevisCanvas
              plan={plan}
              worldRef={worldRef}
              playing={playing}
              timeSec={timeSec}
              onTimeSecChange={onTimeSecChange}
            />
          ) : (
            <p style={{ padding: 16 }}>Loading example…</p>
          )}
        </div>
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
