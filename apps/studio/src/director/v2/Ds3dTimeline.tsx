/** Floating timeline: transport, ruler, camera shot track and one track per character (keyframes as diamonds). */
import React, { useRef, useState } from 'react';
import type { PrevisPlan } from '@core/previsPlanCore.ts';
import { isPrevisKeySelected, previsKeyShift, previsKeysInRange, shiftPrevisKeys, type PrevisKeyRef } from '@edit/previsKeyTimes.ts';
import { ds3dFigureHex } from './v2Palette';
import { DS3D_GLASS, DS3D_PRESSABLE, Ds3dIcon } from './ds3dChrome';

function clock(sec: number): string {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
}

function TrackRow({
  label,
  icon,
  dot,
  selected,
  track,
  children,
}: {
  track: string;
  label: string;
  icon?: string;
  dot?: string;
  selected?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[26px] items-center" data-track={track} data-selected={selected ? 'true' : undefined}>
      <span className="flex w-[104px] items-center gap-1.5 truncate pr-2 text-xs font-semibold text-zinc-300">
        {icon ? <Ds3dIcon name={icon} className="text-[16px] text-primary" /> : null}
        {dot ? <span className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: dot }} /> : null}
        <span className="truncate">{label}</span>
      </span>
      <div className={`relative h-full flex-1 rounded-md bg-white/[0.05] ${selected ? 'shadow-[inset_0_0_0_1px_rgba(163,230,53,0.9)]' : ''}`}>{children}</div>
    </div>
  );
}

export type Ds3dTimelineProps = {
  tr: (k: string, p?: Record<string, string | number>) => string;
  plan: PrevisPlan;
  duration: number;
  time: number;
  playing: boolean;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
  onScrubStart: () => void;
  /** Character id or 'camera' whose track is highlighted. */
  selectedTrack?: string | null;
  canAddKey?: boolean;
  onAddKey?: () => void;
  /** The selected track has a key at the playhead that can go. */
  canRemoveKey?: boolean;
  onRemoveKey?: () => void;
  /** Something moves: reset puts every character and the camera back at their start. */
  canReset?: boolean;
  onReset?: () => void;
  /** Motion between keys: smooth curves or straight lines. */
  smooth: boolean;
  onSmooth: (on: boolean) => void;
  /** Selected keyframes (click, Shift / Cmd-click, or a box dragged over the tracks). */
  keySel: PrevisKeyRef[];
  onKeySel: (sel: PrevisKeyRef[]) => void;
  /** Move the selected keys along the timeline by `dt` (retimes the motion); returns the moved selection. */
  onShiftKeys: (sel: PrevisKeyRef[], dt: number) => PrevisKeyRef[];
  onDeleteKeys: (sel: PrevisKeyRef[]) => void;
};

/** Label column width (px) left of the lanes. */
const LABEL_PX = 104;
/** A press that moves less than this (px) is a click. */
const CLICK_PX = 4;

/** Playhead snaps to a keyframe within this many pixels while scrubbing. */
const SNAP_PX = 8;

/** Keyframe glyph with a plus or minus inside (add / remove key). */
function KeyGlyph({ sign }: { sign: '+' | '-' }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M10 1.8 18.2 10 10 18.2 1.8 10Z" strokeLinejoin="round" />
      <path d="M6.6 10h6.8" />
      {sign === '+' ? <path d="M10 6.6v6.8" /> : null}
    </svg>
  );
}

const ICON_BTN = `${DS3D_PRESSABLE} grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:text-zinc-600 disabled:hover:bg-transparent`;

function KeyDiamond({
  t,
  color,
  pct,
  label,
  selected,
  handlers,
}: {
  t: number;
  color: string;
  pct: (s: number) => string;
  label: string;
  selected: boolean;
  handlers: Pick<React.DOMAttributes<HTMLButtonElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;
}) {
  return (
    <button
      type="button"
      {...handlers}
      aria-label={label}
      aria-pressed={selected}
      title={label}
      data-key-t={t}
      className={`absolute top-[7px] h-3 w-3 -translate-x-1/2 rotate-45 cursor-grab touch-none rounded-[2px] border-2 transition-transform duration-100 hover:scale-125 active:cursor-grabbing ${
        selected ? 'scale-125 border-white shadow-[0_0_0_2px_rgba(14,15,19,0.9)]' : 'border-[#0e0f13]'
      }`}
      style={{ left: pct(t), background: color }}
    />
  );
}

export function Ds3dTimeline(p: Ds3dTimelineProps) {
  const { tr, duration, time, playing, onTogglePlay, onSeek, onScrubStart, selectedTrack, canAddKey, onAddKey, keySel, onKeySel } = p;
  const pct = (sec: number) => `${(Math.max(0, Math.min(duration, sec)) / duration) * 100}%`;
  const lanesRef = useRef<HTMLDivElement>(null);
  /** Dragging keys: the selection being moved and the (clamped) move so far; drawn moved until release. */
  const keyDrag = useRef<{ x0: number; pxPerSec: number; sel: PrevisKeyRef[]; t: number; moved: boolean; seek: boolean } | null>(null);
  const [dragDt, setDragDt] = useState(0);
  /** Box selection (px inside the lanes container) and the selection it adds to. */
  const boxStart = useRef<{ x0: number; y0: number; base: PrevisKeyRef[] } | null>(null);
  const [box, setBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const moving = keyDrag.current?.moved && dragDt !== 0 ? keyDrag.current : null;
  const plan = moving ? shiftPrevisKeys(p.plan, moving.sel, dragDt, duration).plan : p.plan;
  const shownSel = moving ? moving.sel.map((s) => ({ ...s, t: Math.round((s.t + dragDt) * 100) / 100 })) : keySel;
  const keyHandlers = (track: string, t: number): Pick<React.DOMAttributes<HTMLButtonElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'> => ({
    onPointerDown: (e) => {
      e.stopPropagation();
      e.preventDefault();
      const toggle = e.shiftKey || e.metaKey || e.ctrlKey;
      const on = isPrevisKeySelected(keySel, track, t);
      const sel = toggle ? (on ? keySel.filter((s) => !(s.track === track && Math.abs(s.t - t) < 1e-6)) : [...keySel, { track, t }]) : on ? keySel : [{ track, t }];
      onKeySel(sel);
      const lane = (lanesRef.current?.getBoundingClientRect().width ?? 0) - LABEL_PX;
      keyDrag.current = { x0: e.clientX, pxPerSec: Math.max(1, lane) / duration, sel, t, moved: false, seek: !toggle };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      const d = keyDrag.current;
      if (!d || d.sel.length === 0) return;
      if (Math.abs(e.clientX - d.x0) > CLICK_PX) d.moved = true;
      if (d.moved) setDragDt(previsKeyShift(p.plan, d.sel, (e.clientX - d.x0) / d.pxPerSec, duration));
    },
    onPointerUp: (e) => {
      const d = keyDrag.current;
      keyDrag.current = null;
      setDragDt(0);
      if (!d) return;
      if (d.moved) onKeySel(p.onShiftKeys(d.sel, (e.clientX - d.x0) / d.pxPerSec));
      else if (d.seek) onSeek(d.t);
    },
    onPointerCancel: () => {
      keyDrag.current = null;
      setDragDt(0);
    },
  });
  /** Keys under the box: rows it overlaps, times between its left and right edges. */
  const keysInBox = (b: { x0: number; y0: number; x1: number; y1: number }): PrevisKeyRef[] => {
    const el = lanesRef.current;
    if (!el) return [];
    const r = el.getBoundingClientRect();
    const lane = Math.max(1, r.width - LABEL_PX);
    const tAt = (x: number) => (Math.max(0, Math.min(lane, x - LABEL_PX)) / lane) * duration;
    const top = Math.min(b.y0, b.y1);
    const bottom = Math.max(b.y0, b.y1);
    const tracks = [...el.querySelectorAll<HTMLElement>('[data-track]')]
      .filter((row) => {
        const rr = row.getBoundingClientRect();
        return rr.bottom - r.top >= top && rr.top - r.top <= bottom;
      })
      .map((row) => row.dataset.track as string);
    return previsKeysInRange(p.plan, tracks, tAt(b.x0), tAt(b.x1));
  };
  const boxHandlers: Pick<React.DOMAttributes<HTMLDivElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'> = {
    onPointerDown: (e) => {
      if (e.button !== 0) return;
      const r = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      boxStart.current = { x0: x, y0: y, base: e.shiftKey || e.metaKey || e.ctrlKey ? keySel : [] };
      setBox({ x0: x, y0: y, x1: x, y1: y });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      const s = boxStart.current;
      if (!s) return;
      const r = e.currentTarget.getBoundingClientRect();
      const b = { x0: s.x0, y0: s.y0, x1: e.clientX - r.left, y1: e.clientY - r.top };
      setBox(b);
      if (Math.abs(b.x1 - b.x0) > CLICK_PX || Math.abs(b.y1 - b.y0) > CLICK_PX) {
        const add = keysInBox(b).filter((k) => !isPrevisKeySelected(s.base, k.track, k.t));
        onKeySel([...s.base, ...add]);
      }
    },
    onPointerUp: (e) => {
      const s = boxStart.current;
      boxStart.current = null;
      setBox(null);
      if (!s) return;
      const r = e.currentTarget.getBoundingClientRect();
      // A click on an empty lane clears the selection (Shift keeps it).
      if (Math.abs(e.clientX - r.left - s.x0) <= CLICK_PX && Math.abs(e.clientY - r.top - s.y0) <= CLICK_PX) onKeySel(s.base);
    },
    onPointerCancel: () => {
      boxStart.current = null;
      setBox(null);
    },
  };
  const shots = plan.camera.shots ?? [];
  const keyTimes = [
    ...(shots.length ? shots.map((s) => s.t) : plan.camera.keys.map((k) => k.t)),
    ...plan.characters.flatMap((c) => c.path.map((k) => k.t)),
  ];
  const fromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const t = ((e.clientX - r.left) / w) * duration;
    let near: number | null = null;
    for (const k of keyTimes) if (Math.abs(k - t) * (w / duration) <= SNAP_PX && (near === null || Math.abs(k - t) < Math.abs(near - t))) near = k;
    onSeek(near ?? t);
  };
  return (
    <div
      className={`pointer-events-auto w-[1040px] max-w-full rounded-[14px] px-3 pb-3 pt-2 ${DS3D_GLASS}`}
      data-testid="ds3d-v2-timeline"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onSeek(0)}
          aria-label={tr('toStart')}
          className={`${DS3D_PRESSABLE} grid h-9 w-9 place-items-center rounded-[10px] text-zinc-300 hover:bg-white/[0.08]`}
        >
          <Ds3dIcon name="skip_previous" className="text-[20px]" />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? tr('pause') : tr('play')}
          data-testid="ds3d-v2-play"
          className={`${DS3D_PRESSABLE} grid h-9 w-9 place-items-center rounded-[10px] bg-primary/15 text-primary hover:bg-primary/25`}
        >
          <Ds3dIcon name={playing ? 'pause' : 'play_arrow'} fill className="text-[20px]" />
        </button>
        <span className="ml-1 text-xs font-bold tabular-nums text-zinc-100">
          {clock(time)} / {clock(duration)}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={p.smooth}
          onClick={() => p.onSmooth(!p.smooth)}
          title={tr('smoothMotionHint')}
          data-testid="ds3d-v2-smooth"
          className={`${DS3D_PRESSABLE} ml-auto flex h-8 shrink-0 items-center gap-2 rounded-[10px] px-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.06]`}
        >
          {tr('smoothMotion')}
          <span className={`relative h-[18px] w-8 rounded-full transition-colors duration-150 ${p.smooth ? 'bg-primary' : 'bg-white/15'}`}>
            <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-[#0e0f13] transition-[left] duration-150 ${p.smooth ? 'left-[16px]' : 'left-[2px]'}`} />
          </span>
        </button>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <button type="button" onClick={p.onReset} disabled={!p.canReset} aria-label={tr('resetMotion')} title={tr('resetMotion')} data-testid="ds3d-v2-reset-motion" className={ICON_BTN}>
          <Ds3dIcon name="restart_alt" className="text-[19px]" />
        </button>
        <button type="button" onClick={onAddKey} disabled={!canAddKey} aria-label={tr('addKey')} title={tr('addKey')} data-testid="ds3d-v2-add-key" className={ICON_BTN}>
          <KeyGlyph sign="+" />
        </button>
        <button
          type="button"
          onClick={() => (keySel.length > 0 ? p.onDeleteKeys(keySel) : p.onRemoveKey?.())}
          disabled={!p.canRemoveKey && keySel.length === 0}
          aria-label={keySel.length > 0 ? tr('removeKeys', { n: keySel.length }) : tr('removeKey')}
          title={keySel.length > 0 ? tr('removeKeys', { n: keySel.length }) : tr('removeKey')}
          data-testid="ds3d-v2-remove-key"
          className={ICON_BTN}
        >
          <KeyGlyph sign="-" />
        </button>
      </div>
      <div className="relative flex flex-col gap-1">
        <div
          data-testid="ds3d-v2-ruler"
          className="relative ml-[104px] h-4 cursor-ew-resize text-[10px] tabular-nums text-zinc-500"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            onScrubStart();
            fromPointer(e);
          }}
          onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
        >
          {Array.from({ length: Math.floor(duration / 3) + 1 }, (_, i) => i * 3).map((s) => (
            <span
              key={s}
              className={`absolute ${s === 0 ? '' : s >= duration - 0.01 ? '-translate-x-full' : '-translate-x-1/2'}`}
              style={{ left: pct(s) }}
            >
              {s}s
            </span>
          ))}
        </div>
        <div ref={lanesRef} className="relative flex cursor-crosshair select-none flex-col gap-1" title={tr('keysHint')} data-testid="ds3d-v2-lanes" {...boxHandlers}>
        <TrackRow track="camera" label={tr('trackCamera')} icon="videocam" selected={selectedTrack === 'camera'}>
          {shots.length === 0
            ? plan.camera.keys.map((k, i) => (
                <KeyDiamond
                  key={`${k.t}-${i}`}
                  t={k.t}
                  color="#a3e635"
                  pct={pct}
                  label={tr('keyAt', { time: clock(k.t) })}
                  selected={isPrevisKeySelected(shownSel, 'camera', k.t)}
                  handlers={keyHandlers('camera', k.t)}
                />
              ))
            : null}
          {shots.map((s, i) => {
            const end = shots[i + 1]?.t ?? duration;
            const active = time >= s.t && time < end;
            return (
              <div
                key={`${s.t}-${i}`}
                className={`absolute inset-y-0.5 flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-[5px] border px-2 text-[11px] font-bold ${
                  active ? 'border-primary bg-primary/25 text-primary' : 'border-primary/45 bg-primary/10 text-primary/90'
                }`}
                style={{ left: `calc(${pct(s.t)} + 2px)`, width: `calc(${pct(end - s.t)} - 4px)` }}
              >
                <Ds3dIcon name="videocam" className="text-[14px]" />
                {tr('shot', { n: i + 1 })} · {tr(`relations.${s.relation}`)}
              </div>
            );
          })}
        </TrackRow>
        {(plan.characters ?? []).slice(0, 6).map((c) => {
          const hex = ds3dFigureHex(c.color);
          const moves: Array<[number, number]> = [];
          for (let i = 1; i < c.path.length; i++) {
            const a = c.path[i - 1];
            const b = c.path[i];
            if (Math.hypot(b.x - a.x, b.y - a.y) > 0.2) moves.push([a.t, b.t]);
          }
          return (
            <TrackRow key={c.id} track={c.id} label={c.name} dot={hex} selected={selectedTrack === c.id}>
              {moves.map(([a, b], i) => (
                <div key={i} className="absolute top-[10px] h-1.5 rounded-[3px]" style={{ left: pct(a), width: pct(b - a), background: hex, opacity: 0.55 }} />
              ))}
              {c.path.map((k, i) => (
                <KeyDiamond
                  key={`${k.t}-${i}`}
                  t={k.t}
                  color={hex}
                  pct={pct}
                  label={tr('keyAt', { time: clock(k.t) })}
                  selected={isPrevisKeySelected(shownSel, c.id, k.t)}
                  handlers={keyHandlers(c.id, k.t)}
                />
              ))}
            </TrackRow>
          );
        })}
          {box && (Math.abs(box.x1 - box.x0) > CLICK_PX || Math.abs(box.y1 - box.y0) > CLICK_PX) ? (
            <div
              className="pointer-events-none absolute rounded-[3px] border border-primary/80 bg-primary/10"
              data-testid="ds3d-v2-key-box"
              style={{ left: Math.min(box.x0, box.x1), top: Math.min(box.y0, box.y1), width: Math.abs(box.x1 - box.x0), height: Math.abs(box.y1 - box.y0) }}
            />
          ) : null}
        </div>
        <div className="pointer-events-none absolute -top-0.5 bottom-0 left-[104px] right-0">
          <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: pct(time) }} />
        </div>
      </div>
    </div>
  );
}
