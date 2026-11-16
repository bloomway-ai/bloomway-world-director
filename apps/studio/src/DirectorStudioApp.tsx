import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizePrevisPlan, type PrevisPlan } from '@core/previsPlanCore.ts';
import {
  PREVIS_V2_KEY_SNAP_SEC,
  previsHasMotion,
  removePrevisCameraKey,
  resetPrevisMotion,
  setPrevisCameraKey,
} from '@edit/previsV2Edit.ts';
import { removePrevisKeys, shiftPrevisKeys, type PrevisKeyRef } from '@edit/previsKeyTimes.ts';
import { ProjectAttribution } from './components/ProjectAttribution';
import {
  loadStudioHistory,
  pushStudioHistory,
  worldStyleLabel,
  type StudioHistoryEntry,
} from './director/ossStudioHistory';
import { runOssComposerCommand } from './director/ossLocalComposer';
import { classifyWorldRefChange, worldRefFromSource, worldRefGeometryKey } from './director/worldRefRefresh';
import { Ds3dTimeline } from './director/v2/Ds3dTimeline';
import { Ds3dWorldPresets, resolveHomeSelection, type Ds3dHomePick, type Ds3dHomeHistoryItem } from './director/v2/Ds3dWorldPresets';
import { Ds3dHomeWorldPreview } from './director/v2/Ds3dHomeWorldPreview';
import { DS3D_WORLD_PRESETS } from './director/v2/ds3dPresetWorlds';
import { createDs3dTr } from './director/v2/ds3dI18n';
import { DS3D_LOOK_MULT, DS3D_SLOPES, type Ds3dLookSensitivity, type Ds3dWorldPatch } from './director/v2/Ds3dSettingsPanel';
import { DS3D_GLASS, Ds3dIcon } from './director/v2/ds3dChrome';
import { OssDs3dComposer } from './director/v2/OssDs3dComposer';
import { OssDs3dTopBar, type OssTool } from './director/v2/OssDs3dTopBar';
import { Ds3dHomeBackdrop } from './director/v2/Ds3dHomeBackdrop';
import { createWorld3dScene, type World3dScene, type World3dSource } from './director/v2/world3dScene';
import type { World3dPickInfo } from './director/v2/world3dContent';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';
import { normalizePrevisWorldRef } from '@core/previsWorldGen.ts';

type SessionSnap = { plan: PrevisPlan | null; world: PrevisWorldRef | null };

function cloneSnap(s: SessionSnap): SessionSnap {
  return {
    plan: s.plan ? (JSON.parse(JSON.stringify(s.plan)) as PrevisPlan) : null,
    world: s.world ? normalizePrevisWorldRef(JSON.parse(JSON.stringify(s.world))) : null,
  };
}

function useQueryFlags() {
  return useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const loadExample = q.has('example') || q.has('autoplay') || q.has('demo');
    return { autoplay: q.has('autoplay'), demo: q.has('demo'), loadExample };
  }, []);
}

export function DirectorStudioApp() {
  const { autoplay, loadExample } = useQueryFlags();
  const tr = useMemo(() => createDs3dTr('en'), []);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<World3dScene | null>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const sourceKeyRef = useRef('');
  const prevWorldRef = useRef<PrevisWorldRef | null>(null);
  const prevGeomKeyRef = useRef('');
  const undoRef = useRef<SessionSnap[]>([]);
  const redoRef = useRef<SessionSnap[]>([]);

  const [plan, setPlan] = useState<PrevisPlan | null>(null);
  const [world, setWorld] = useState<PrevisWorldRef | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [uiTime, setUiTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [smoothMotion, setSmoothMotion] = useState(true);
  const [keySel, setKeySel] = useState<PrevisKeyRef[]>([]);
  const [moveSpeed, setMoveSpeed] = useState(4);
  const [look, setLook] = useState<Ds3dLookSensitivity>('medium');
  const [homePick, setHomePick] = useState<Ds3dHomePick>({ kind: 'preset', id: DS3D_WORLD_PRESETS[0].id });
  const [picked, setPicked] = useState<World3dPickInfo | null>(null);
  const [composerText, setComposerText] = useState('');
  const [composerReply, setComposerReply] = useState<string | null>(null);
  const [composerBusy, setComposerBusy] = useState(false);
  const [history, setHistory] = useState<StudioHistoryEntry[]>(() => loadStudioHistory());
  const [activeHistoryKey, setActiveHistoryKey] = useState<string | null>(null);
  const [tool, setTool] = useState<OssTool>('select');
  const [undoDepth, setUndoDepth] = useState(0);
  const [redoDepth, setRedoDepth] = useState(0);

  playingRef.current = playing;
  const duration = plan?.durationSec ?? 12;
  const sessionWorld = world ?? plan?.set?.world ?? null;
  const hasSession = !!(plan || sessionWorld);
  const scopeNew = !hasSession;

  const source: World3dSource | null = useMemo(() => {
    if (plan) return plan;
    if (world) return { world };
    return null;
  }, [plan, world]);

  const sourceKey = useMemo(() => JSON.stringify(source), [source]);

  const currentLabel = plan?.title ?? (sessionWorld ? worldStyleLabel(sessionWorld) : '—');
  const currentNote = plan?.set?.description ?? '';

  const homeHistoryItems = useMemo((): Ds3dHomeHistoryItem[] => {
    return history.map((h) => ({
      key: h.key,
      label: h.label,
      note: h.note,
      time: h.createdAt,
      ref: h.world,
      icon: h.plan ? 'movie' : 'public',
    }));
  }, [history]);

  useEffect(() => {
    if (!loadExample) return;
    (async () => {
      try {
        const res = await fetch('/examples/edo-rainy-night/plan.json');
        const json = await res.json();
        const p = normalizePrevisPlan(json);
        setPlan(p);
        if (p.set?.world) setWorld(normalizePrevisWorldRef(p.set.world));
        if (autoplay) {
          timeRef.current = 0;
          setUiTime(0);
          setPlaying(true);
        }
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, [autoplay, loadExample]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let scene: World3dScene | null = null;
    try {
      scene = createWorld3dScene(el);
    } catch {
      setWebglFailed(true);
      return;
    }
    sceneRef.current = scene;
    const canvas = el.querySelector('canvas');
    canvas?.addEventListener('click', () => canvas.focus());
    return () => {
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!source) {
      sceneRef.current?.setSource(null);
      prevWorldRef.current = null;
      prevGeomKeyRef.current = '';
      return;
    }
    const nextRef = worldRefFromSource(source);
    const geomKey = worldRefGeometryKey(nextRef);
    const refresh = classifyWorldRefChange(prevWorldRef.current, nextRef);
    const grow = !prevGeomKeyRef.current;
    const keepView = Boolean(prevGeomKeyRef.current || sourceKeyRef.current);
    sceneRef.current?.setSource(source, { grow, keepView, refresh: refresh === 'none' ? 'none' : refresh });
    if (!sourceKeyRef.current) {
      timeRef.current = 0;
      setUiTime(0);
      sceneRef.current?.setTime(0);
    }
    prevWorldRef.current = nextRef;
    prevGeomKeyRef.current = geomKey;
    sourceKeyRef.current = sourceKey;
  }, [sourceKey, source]);

  useEffect(() => sceneRef.current?.setSelection(picked), [picked]);
  useEffect(() => sceneRef.current?.setMoveSpeed(moveSpeed), [moveSpeed]);
  useEffect(() => sceneRef.current?.setLookSensitivity(DS3D_LOOK_MULT[look]), [look]);
  useEffect(() => sceneRef.current?.setSmoothMotion(smoothMotion), [smoothMotion]);

  const freeExplore = !playing || !plan;
  useEffect(() => sceneRef.current?.setCameraMode(freeExplore ? 'free' : 'shot'), [freeExplore]);
  useEffect(() => {
    if (!freeExplore || showHome) return;
    const canvas = viewportRef.current?.querySelector('canvas');
    canvas?.focus({ preventScroll: true });
  }, [freeExplore, showHome]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current && plan) {
        const d = Math.max(0.1, duration);
        timeRef.current = timeRef.current + dt;
        if (timeRef.current >= d) {
          timeRef.current = d;
          playingRef.current = false;
          setPlaying(false);
        }
        sceneRef.current?.setTime(timeRef.current);
      }
      if (now - lastUi > 66) {
        lastUi = now;
        setUiTime(timeRef.current);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [plan, duration]);

  const pushUndo = useCallback(() => {
    const snap = cloneSnap({ plan, world: sessionWorld });
    undoRef.current.push(snap);
    if (undoRef.current.length > 40) undoRef.current.shift();
    redoRef.current = [];
    setUndoDepth(undoRef.current.length);
    setRedoDepth(0);
    setActiveHistoryKey(null);
  }, [plan, sessionWorld]);

  const applySnap = useCallback((snap: SessionSnap, replaceSourceKey = false) => {
    if (replaceSourceKey) {
      sourceKeyRef.current = '';
      prevGeomKeyRef.current = '';
      prevWorldRef.current = null;
    }
    setPlan(snap.plan);
    setWorld(snap.world);
    setPicked(null);
    setPlaying(false);
  }, []);

  const commitPlan = useCallback(
    (next: PrevisPlan | null, recordUndo = true) => {
      if (recordUndo) pushUndo();
      setPlan(next);
      if (next?.set?.world) setWorld(normalizePrevisWorldRef(next.set.world));
    },
    [pushUndo],
  );

  const applyWorld = useCallback(
    (next: PrevisWorldRef | null, recordUndo = true) => {
      if (recordUndo) pushUndo();
      setWorld(next);
      setPlan((prev) => (prev?.set && next ? { ...prev, set: { ...prev.set, world: next } } : prev));
    },
    [pushUndo],
  );

  const saveSessionToHistory = useCallback(
    (note: string) => {
      if (!hasSession) return;
      const list = pushStudioHistory({
        label: currentLabel,
        note,
        plan: plan ? (JSON.parse(JSON.stringify(plan)) as PrevisPlan) : null,
        world: sessionWorld ? normalizePrevisWorldRef(JSON.parse(JSON.stringify(sessionWorld))) : null,
      });
      setHistory(list);
    },
    [hasSession, currentLabel, plan, sessionWorld],
  );

  const restoreHistoryEntry = useCallback((entry: StudioHistoryEntry) => {
    pushUndo();
    sourceKeyRef.current = '';
    prevGeomKeyRef.current = '';
    prevWorldRef.current = null;
    setPlan(entry.plan ? normalizePrevisPlan(entry.plan) : null);
    setWorld(entry.world ? normalizePrevisWorldRef(entry.world) : entry.plan?.set?.world ? normalizePrevisWorldRef(entry.plan.set.world) : null);
    setActiveHistoryKey(entry.key);
    setPlaying(false);
    setPicked(null);
  }, [pushUndo]);

  const undo = useCallback(() => {
    const prev = undoRef.current.pop();
    if (!prev) return;
    redoRef.current.push(cloneSnap({ plan, world: sessionWorld }));
    applySnap(prev);
    setUndoDepth(undoRef.current.length);
    setRedoDepth(redoRef.current.length);
  }, [plan, sessionWorld, applySnap]);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(cloneSnap({ plan, world: sessionWorld }));
    applySnap(next);
    setUndoDepth(undoRef.current.length);
    setRedoDepth(redoRef.current.length);
  }, [plan, sessionWorld, applySnap]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void sceneRef.current?.screenshot().then((b) => {
          if (!b) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = `bwd-shot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
        });
      } else if (e.key.toLowerCase() === 'v') setTool('select');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const seek = useCallback(
    (sec: number) => {
      const t = Math.max(0, Math.min(duration, sec));
      timeRef.current = t;
      setUiTime(t);
      sceneRef.current?.setTime(t);
    },
    [duration],
  );

  const keyTarget = plan ? { kind: 'camera' as const, id: 'camera' } : null;
  const keyAtPlayhead =
    !!plan &&
    !plan.camera.shots?.length &&
    plan.camera.keys.length > 1 &&
    plan.camera.keys.some((k) => Math.abs(k.t - uiTime) <= PREVIS_V2_KEY_SNAP_SEC);

  const addKeyNow = () => {
    if (!plan) return;
    commitPlan(setPrevisCameraKey(plan, timeRef.current, {}));
  };

  const removeKeyNow = () => {
    if (!plan || !keyAtPlayhead) return;
    commitPlan(removePrevisCameraKey(plan, timeRef.current));
  };

  const enterHome = () => {
    if (homePick.kind === 'preset') {
      const preset = DS3D_WORLD_PRESETS.find((x) => x.id === homePick.id);
      if (preset?.ref) {
        saveSessionToHistory(`Preset: ${homePick.id}`);
        sourceKeyRef.current = '';
        prevGeomKeyRef.current = '';
        prevWorldRef.current = null;
        setPlan(null);
        setPicked(null);
        setWorld(normalizePrevisWorldRef(preset.ref));
        setActiveHistoryKey(null);
      }
    } else {
      const entry = history.find((h) => h.key === homePick.key);
      if (entry) restoreHistoryEntry(entry);
    }
  };

  const openBlankHome = () => {
    saveSessionToHistory('Before new world');
    sourceKeyRef.current = '';
    prevGeomKeyRef.current = '';
    prevWorldRef.current = null;
    setPlan(null);
    setWorld(null);
    setPicked(null);
    setPlaying(false);
    setActiveHistoryKey(null);
    undoRef.current = [];
    redoRef.current = [];
    setUndoDepth(0);
    setRedoDepth(0);
  };

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const onViewportPointerDown = (e: React.PointerEvent) => {
    if (e.button === 0) dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onViewportPointerUp = (e: React.PointerEvent) => {
    if (e.button !== 0 || tool !== 'select') return;
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return;
    const info = sceneRef.current?.pick(e.clientX, e.clientY) ?? null;
    setPicked(info);
    setComposerReply(
      info
        ? `Selected ${info.kind} ${info.id}. Try "remove building" or "taller" after picking, or change weather in Settings.`
        : null,
    );
  };

  const loadPlanFromUrl = (url: string, historyLabel: string) => {
    void (async () => {
      setComposerBusy(true);
      try {
        const res = await fetch(url);
        const json = await res.json();
        const p = normalizePrevisPlan(json);
        saveSessionToHistory('Before load plan');
        sourceKeyRef.current = '';
        prevGeomKeyRef.current = '';
        prevWorldRef.current = null;
        commitPlan(p, true);
        if (p.set?.world) setWorld(normalizePrevisWorldRef(p.set.world));
        saveSessionToHistory(historyLabel);
        setComposerText('');
      } catch (e) {
        setComposerReply(String(e));
      } finally {
        setComposerBusy(false);
      }
    })();
  };

  const sendComposer = () => {
    const out = runOssComposerCommand(composerText, {
      plan,
      world: sessionWorld,
      pick: picked,
    });
    setComposerReply(out.reply);
    if (!out.ok) return;
    if (out.fetchPlanUrl) {
      loadPlanFromUrl(out.fetchPlanUrl, composerText.trim().slice(0, 80));
      return;
    }
    setComposerBusy(true);
    try {
      if (out.plan === null && out.world === null) {
        openBlankHome();
      } else {
        if (out.grow) {
          prevGeomKeyRef.current = '';
          prevWorldRef.current = null;
        }
        if (out.world) applyWorld(out.world);
        if (out.plan) commitPlan(out.plan);
        else if (out.plan === null && out.world) setPlan(null);
        saveSessionToHistory(composerText.trim().slice(0, 80));
      }
      setComposerText('');
    } finally {
      setComposerBusy(false);
    }
  };

  const showHome = !source && !webglFailed;

  const homeSelection = useMemo(
    () => (showHome ? resolveHomeSelection(homePick, homeHistoryItems) : null),
    [showHome, homePick, homeHistoryItems],
  );

  const onWorldPatch = (patch: Ds3dWorldPatch) => {
    const base = sessionWorld;
    if (!base) return;
    const ref = { ...base } as Record<string, unknown>;
    if (patch.extent) ref.extentM = [patch.extent, patch.extent];
    if (patch.density) ref.density = patch.density;
    if (patch.time) ref.timeOfDay = patch.time;
    if (patch.weather) {
      if (patch.weather === 'clear') delete ref.weather;
      else ref.weather = patch.weather;
    }
    if (patch.neon !== undefined) {
      if (patch.neon) ref.neon = true;
      else delete ref.neon;
    }
    if (patch.water) {
      if (patch.water === 'none') delete ref.water;
      else ref.water = { kind: patch.water };
    }
    if (patch.slope) {
      delete ref.slope;
      delete ref.hills;
      if (patch.slope === 'hilly') ref.hills = true;
      else if (patch.slope !== 'flat') ref.slope = DS3D_SLOPES[patch.slope];
    }
    try {
      applyWorld(normalizePrevisWorldRef(ref));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative flex h-full min-h-[100dvh] flex-col overflow-hidden bg-[#070708]" data-testid="ds3d-v2-workspace">
      <OssDs3dTopBar
        tr={tr}
        scopeNew={scopeNew}
        onNewWorld={openBlankHome}
        history={history}
        currentLabel={currentLabel}
        currentNote={currentNote}
        hasSession={hasSession}
        activeHistoryKey={activeHistoryKey}
        onRestoreHistory={restoreHistoryEntry}
        onRestoreCurrentWorld={() => {
          setActiveHistoryKey(null);
          setPlaying(false);
        }}
        tool={tool}
        onTool={(t) => {
          setTool(t);
          if (t !== 'select')
            setComposerReply('Actor, camera, and rotate tools are not wired in OSS yet — use Select to pick buildings.');
        }}
        canUseTools={hasSession}
        undoDepth={undoDepth}
        redoDepth={redoDepth}
        onUndo={undo}
        onRedo={redo}
        onScreenshot={() => {
          void sceneRef.current?.screenshot().then((b) => {
            if (!b) return;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(b);
            a.download = `bwd-shot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
          });
        }}
        onResetView={() => sceneRef.current?.resetView()}
        moveSpeed={moveSpeed}
        onMoveSpeed={setMoveSpeed}
        look={look}
        onLook={setLook}
        world={sessionWorld}
        onWorld={onWorldPatch}
        plan={plan}
      />

      <main
        ref={viewportRef}
        data-testid="previs-canvas-host"
        className={`relative min-h-0 flex-1 ${showHome ? 'bg-zinc-100' : 'bg-black'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onViewportPointerDown}
        onPointerUp={onViewportPointerUp}
      >
        {showHome ? <Ds3dHomeBackdrop /> : null}
        {showHome && homeSelection?.ref ? (
          <Ds3dHomeWorldPreview thumbKey={homeSelection.thumbKey} worldRef={homeSelection.ref} />
        ) : null}
        {err ? <p className="pointer-events-none p-4 text-red-400">{err}</p> : null}
        {webglFailed ? <p className="pointer-events-none p-4 text-red-400">WebGL unavailable</p> : null}
        {freeExplore && !showHome ? (
          <div className={`pointer-events-none absolute left-3 top-[4.5rem] z-10 max-w-xs rounded-xl px-3 py-2 text-[11px] leading-relaxed text-zinc-300 ${DS3D_GLASS}`}>
            <Ds3dIcon name="explore" className="mr-1 inline text-[16px] text-primary" />
            {tr('exploreHint')} · New world &amp; History on the top bar
          </div>
        ) : (
          <div className={`pointer-events-none absolute left-3 top-[4.5rem] z-10 rounded-xl px-3 py-2 text-[11px] text-zinc-300 ${DS3D_GLASS}`}>
            Playing shot timeline · pause for free camera
          </div>
        )}
      </main>

      <span className="sr-only" data-testid="time-label" aria-live="polite">
        {uiTime.toFixed(1)}s / {duration}s
      </span>

      <div className="pointer-events-none absolute inset-x-0 bottom-[18px] z-10 flex flex-col items-center gap-3 px-4">
        {plan ? (
          <Ds3dTimeline
            tr={tr}
            plan={plan}
            duration={duration}
            time={uiTime}
            playing={playing}
            onTogglePlay={() => {
              if (!playing && timeRef.current >= duration) seek(0);
              setPlaying((p) => !p);
            }}
            onSeek={seek}
            onScrubStart={() => setPlaying(false)}
            selectedTrack="camera"
            canAddKey={!!keyTarget}
            onAddKey={addKeyNow}
            canRemoveKey={keyAtPlayhead}
            onRemoveKey={removeKeyNow}
            canReset={!!plan && previsHasMotion(plan)}
            onReset={() => commitPlan(resetPrevisMotion(plan))}
            smooth={smoothMotion}
            onSmooth={setSmoothMotion}
            keySel={keySel}
            onKeySel={setKeySel}
            onShiftKeys={(sel, dt) => {
              const moved = shiftPrevisKeys(plan, sel, dt, duration);
              if (moved.plan !== plan) commitPlan(moved.plan);
              return moved.sel;
            }}
            onDeleteKeys={(sel) => {
              const next = removePrevisKeys(plan, sel);
              if (next !== plan) commitPlan(next);
              setKeySel([]);
            }}
          />
        ) : null}
        {showHome ? (
          <Ds3dWorldPresets
            tr={tr}
            pick={homePick}
            onPick={setHomePick}
            history={homeHistoryItems}
            onEnter={enterHome}
            disabled={false}
          />
        ) : null}
        <OssDs3dComposer
          value={composerText}
          onChange={setComposerText}
          onSend={sendComposer}
          busy={composerBusy}
          scopeLabel={plan ? 'World / shot' : 'World'}
          placeholder="e.g. rainy night · remove building (pick first) · new plan · paste JSON"
          reply={composerReply}
        />
      </div>

      <footer className="pointer-events-none absolute bottom-1 left-0 right-0 z-0 opacity-80">
        <ProjectAttribution />
      </footer>
    </div>
  );
}
