/** Left camera panel: the planned camera's live viewfinder with its settings underneath (all edits are free keys). */
import React, { useState } from 'react';
import type { PrevisAspect } from '@edit/previsVersions.ts';
import { samplePrevisCamera, type PrevisPlan } from '@core/previsPlanCore.ts';
import {
  editPrevisCamera,
  previsCameraAimAt,
  previsCameraHeightPreset,
  previsCameraMotion,
  previsCameraPoseAt,
  previsCameraShotSizeAt,
  setPrevisCameraAim,
  setPrevisCameraHeight,
  setPrevisCameraKey,
  setPrevisCameraMotion,
  setPrevisCameraShotSize,
  PREVIS_CAMERA_HEIGHTS,
  PREVIS_SHOT_SIZES,
  type PrevisCameraHeightPreset,
  type PrevisCameraMotion,
} from '@edit/previsV2Edit.ts';
import { DS3D_GLASS, DS3D_PRESSABLE, Ds3dIcon } from './ds3dChrome';

/** Full-frame focal length (mm) ↔ vertical field of view (degrees). */
const lensFov = (mm: number) => (2 * Math.atan(12 / mm) * 180) / Math.PI;
const fovLens = (fov: number) => 12 / Math.tan(((fov / 2) * Math.PI) / 180);
const LENS_MIN = 14;
const LENS_MAX = 135;

export const DS3D_CAMERA_DOCK_WIDTH = 320;
/** Shorter than this, the panel shows as its chip only (the window is too low). */
export const DS3D_CAMERA_DOCK_MIN_H = 150;

/** Height the camera settings need below the viewfinder (six rows). */
const SETTINGS_H = 216;

/** Frame shape glyph (as the workflow ratio chips): a rectangle in the ratio. */
function RatioGlyph({ ratio }: { ratio: PrevisAspect }) {
  const [w, h] = ratio === '9:16' ? [6.75, 12] : [12, 6.75];
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x={(16 - w) / 2} y={(16 - h) / 2} width={w} height={h} rx="1" />
    </svg>
  );
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
};

function Chips<T extends string>({
  value,
  options,
  onChange,
  testId,
}: {
  value: T | null;
  options: Array<{ value: T; label: string; icon?: React.ReactNode; disabled?: boolean; title?: string }>;
  onChange: (v: T) => void;
  testId: string;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" data-testid={testId}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={`${DS3D_PRESSABLE} inline-flex h-[26px] max-w-[120px] items-center gap-1 truncate rounded-md px-[7px] text-[11.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-35 ${
              on ? 'bg-primary/15 text-primary' : 'bg-white/[0.05] text-zinc-300 enabled:hover:bg-white/[0.09]'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[46px_1fr] items-center gap-2">
      <span className="text-[11.5px] text-zinc-400">{label}</span>
      {children}
    </div>
  );
}

export type Ds3dCameraDockProps = {
  tr: (k: string, p?: Record<string, string | number>) => string;
  plan: PrevisPlan;
  time: number;
  aspect: PrevisAspect;
  onAspect: (v: PrevisAspect) => void;
  onPlan: (next: PrevisPlan) => void;
  /** The box the scene renders the camera's shot into. */
  viewfinderRef: (el: HTMLDivElement | null) => void;
  collapsed: boolean;
  onCollapsed: (v: boolean) => void;
  /** Tallest the panel may be (its settings scroll beyond). */
  maxHeight: number;
  /** Export to the canvas: the whole take as a video, or the frame at the playhead as a still. */
  onExport?: (kind: 'video' | 'image') => void;
  exportBusy?: boolean;
};

export function Ds3dCameraDock(p: Ds3dCameraDockProps) {
  const { plan, time, tr } = p;
  const [exportMenu, setExportMenu] = useState(false);
  const cam = (k: string) => tr(`camDock.${k}`);
  if (p.collapsed || p.maxHeight < DS3D_CAMERA_DOCK_MIN_H) {
    return (
      <button
        type="button"
        onClick={() => p.onCollapsed(false)}
        disabled={p.maxHeight < DS3D_CAMERA_DOCK_MIN_H}
        title={cam('expand')}
        data-testid="ds3d-v2-camera-dock-expand"
        className={`${DS3D_PRESSABLE} pointer-events-auto flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-zinc-100 disabled:opacity-60 ${DS3D_GLASS}`}
      >
        <Ds3dIcon name="videocam" className="text-[16px] text-primary" />
        {cam('camera')}
        <Ds3dIcon name="expand_more" className="text-[16px] text-zinc-400" />
      </button>
    );
  }

  const motion = previsCameraMotion(plan);
  const aim = previsCameraAimAt(plan, time);
  const shot = previsCameraShotSizeAt(plan, time);
  const pose = previsCameraPoseAt(plan, time);
  const lens = Math.round(Math.max(LENS_MIN, Math.min(LENS_MAX, fovLens(samplePrevisCamera(plan, time).fovDeg))));
  const edit = (fn: (q: PrevisPlan, at: number) => PrevisPlan) => p.onPlan(editPrevisCamera(plan, time, fn));
  const setLens = (mm: number) => edit((q, at) => setPrevisCameraKey(q, at, { fov: lensFov(mm) }));
  const portrait = p.aspect === '9:16';
  // A short window shrinks the viewfinder before the settings start to scroll.
  const vfFull = portrait ? 224 : (DS3D_CAMERA_DOCK_WIDTH * 9) / 16;
  const vfH = Math.round(Math.max(96, Math.min(vfFull, p.maxHeight - SETTINGS_H)));
  const vfW = portrait ? Math.round((vfH * 9) / 16) : Math.round((vfH * 16) / 9);

  return (
    <div
      className="pointer-events-auto flex flex-col overflow-hidden rounded-[14px] border border-white/10 shadow-[0_18px_50px_-14px_rgba(0,0,0,0.65)]"
      style={{ width: DS3D_CAMERA_DOCK_WIDTH, maxHeight: p.maxHeight }}
      data-testid="ds3d-v2-camera-dock"
    >
      <div className="relative flex shrink-0 justify-center" style={{ height: vfH }}>
        {/* Letterbox bars only beside the frame: a backdrop under the frame would dim the shot drawn there. */}
        {vfW < DS3D_CAMERA_DOCK_WIDTH ? (
          <>
            <div className="absolute inset-y-0 left-0 bg-black/70" style={{ width: `calc((100% - ${vfW}px) / 2)` }} aria-hidden />
            <div className="absolute inset-y-0 right-0 bg-black/70" style={{ width: `calc((100% - ${vfW}px) / 2)` }} aria-hidden />
          </>
        ) : null}
        <div ref={p.viewfinderRef} className="h-full" style={{ width: Math.min(vfW, DS3D_CAMERA_DOCK_WIDTH) }} data-testid="ds3d-v2-viewfinder" />
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-zinc-100">
          {cam('camera')} · {fmtTime(time)}
        </span>
        <button
          type="button"
          onClick={() => p.onCollapsed(true)}
          title={cam('collapse')}
          aria-label={cam('collapse')}
          data-testid="ds3d-v2-camera-dock-collapse"
          className={`${DS3D_PRESSABLE} absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-black/55 text-zinc-300 hover:text-zinc-50`}
        >
          <Ds3dIcon name="expand_less" className="text-[18px]" />
        </button>
        {p.onExport ? (
          <div className="absolute bottom-1.5 right-1.5 flex flex-col items-end gap-1">
            {exportMenu ? (
              <div className="flex flex-col overflow-hidden rounded-lg bg-[#0e0f13]/95 py-1 shadow-lg ring-1 ring-white/10" role="menu" data-testid="ds3d-v2-export-menu">
                {(['video', 'image'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setExportMenu(false);
                      p.onExport?.(k);
                    }}
                    data-testid={`ds3d-v2-export-${k}`}
                    className={`${DS3D_PRESSABLE} flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-[11.5px] font-semibold text-zinc-100 hover:bg-white/[0.08]`}
                  >
                    <Ds3dIcon name={k === 'video' ? 'movie' : 'photo_camera'} className="text-[15px] text-primary" />
                    {cam(k === 'video' ? 'exportVideo' : 'exportStill')}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setExportMenu((v) => !v)}
              disabled={p.exportBusy}
              title={cam('export')}
              aria-label={cam('export')}
              aria-expanded={exportMenu}
              data-testid="ds3d-v2-export"
              className={`${DS3D_PRESSABLE} flex h-7 items-center gap-1 rounded-md bg-black/60 px-2 text-[11px] font-semibold text-zinc-100 hover:text-primary disabled:opacity-50`}
            >
              <Ds3dIcon name={p.exportBusy ? 'progress_activity' : 'ios_share'} className={`text-[15px] ${p.exportBusy ? 'animate-spin motion-reduce:animate-none' : ''}`} />
              {cam('export')}
            </button>
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain bg-[#0e0f13]/[0.86] px-3 py-2.5 backdrop-blur-xl backdrop-saturate-[1.2] [scrollbar-width:thin]">
        <Row label={cam('motion')}>
          <Chips<PrevisCameraMotion>
            value={motion}
            onChange={(m) => p.onPlan(setPrevisCameraMotion(plan, time, m))}
            testId="ds3d-v2-camera-motion"
            options={[
              { value: 'static', label: cam('motions.static') },
              { value: 'path', label: cam('motions.path'), disabled: motion === 'static', title: motion === 'static' ? cam('pathHint') : undefined },
              { value: 'follow', label: cam('motions.follow'), disabled: !plan.characters.length, title: plan.characters.length ? undefined : cam('followHint') },
            ]}
          />
        </Row>
        <Row label={cam('lookAt')}>
          <Chips<string>
            value={aim ?? '__fixed'}
            onChange={(v) => edit((q, at) => setPrevisCameraAim(q, at, v === '__fixed' ? null : v))}
            testId="ds3d-v2-camera-look"
            options={[...plan.characters.map((c) => ({ value: c.id, label: c.name })), { value: '__fixed', label: cam('lookFixed') }]}
          />
        </Row>
        <Row label={cam('shotSize')}>
          <Chips
            value={shot}
            onChange={(v) => edit((q, at) => setPrevisCameraShotSize(q, at, v))}
            testId="ds3d-v2-camera-shot"
            options={PREVIS_SHOT_SIZES.map((v) => ({ value: v, label: cam(`shots.${v}`), disabled: !aim, title: aim ? undefined : cam('shotHint') }))}
          />
        </Row>
        <Row label={cam('height')}>
          <Chips<PrevisCameraHeightPreset>
            value={previsCameraHeightPreset(pose.h)}
            onChange={(v) => edit((q, at) => setPrevisCameraHeight(q, at, v))}
            testId="ds3d-v2-camera-height"
            options={(Object.keys(PREVIS_CAMERA_HEIGHTS) as PrevisCameraHeightPreset[]).map((v) => ({ value: v, label: cam(`heights.${v}`) }))}
          />
        </Row>
        <Row label={cam('focal')}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={LENS_MIN}
              max={LENS_MAX}
              step={1}
              defaultValue={lens}
              key={lens}
              onPointerUp={(e) => setLens(Number((e.target as HTMLInputElement).value))}
              onKeyUp={(e) => setLens(Number((e.target as HTMLInputElement).value))}
              aria-label={cam('focal')}
              data-testid="ds3d-v2-camera-focal"
              style={{ accentColor: '#a3e635' }}
              className="h-1 min-w-0 flex-1 cursor-pointer"
            />
            <span className="w-11 text-right text-[11.5px] font-semibold tabular-nums text-primary">{lens}mm</span>
          </div>
        </Row>
        <Row label={cam('aspect')}>
          <Chips<PrevisAspect>
            value={p.aspect}
            onChange={p.onAspect}
            testId="ds3d-v2-aspect"
            options={(['16:9', '9:16'] as const).map((v) => ({
              value: v,
              label: v,
              icon: <RatioGlyph ratio={v} />,
              title: tr(v === '16:9' ? 'aspectLandscape' : 'aspectPortrait'),
            }))}
          />
        </Row>
      </div>
    </div>
  );
}
