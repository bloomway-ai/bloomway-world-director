/**
 * Empty 3D Director home above the composer: ready-made worlds and the node's own history (worlds and previs
 * drafts made before), in a strip that scrolls sideways (arrows, wheel, swipe, arrow keys). The picked item is shown
 * behind; it is opened only with the button below the strip.
 */
import React, { useEffect, useRef, useState } from 'react';
import { DS3D_PRESSABLE, Ds3dIcon } from './ds3dChrome';
import { DS3D_WORLD_PRESETS } from './ds3dPresetWorlds';
import { requestWorld3dThumb } from './world3dThumbs';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';

type Tr = (key: string, vars?: Record<string, string | number>) => string;

/** Something made in this node before: the current / an earlier world, or a previs draft / output. */
export interface Ds3dHomeHistoryItem {
  key: string;
  label: string;
  /** Prompt or story it was made from. */
  note: string;
  time: number;
  /** World to show (null: a classic stage or room without a street world). */
  ref: PrevisWorldRef | null;
  icon: string;
}

export type Ds3dHomePick = { kind: 'preset'; id: string } | { kind: 'history'; key: string };

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

export function resolveHomeSelection(
  pick: Ds3dHomePick,
  history: Ds3dHomeHistoryItem[],
): { thumbKey: string; ref: PrevisWorldRef | null; label: string } | null {
  if (pick.kind === 'preset') {
    const preset = DS3D_WORLD_PRESETS.find((x) => x.id === pick.id);
    if (!preset) return null;
    return { thumbKey: preset.id, ref: preset.ref as PrevisWorldRef | null, label: preset.id };
  }
  const entry = history.find((h) => h.key === pick.key);
  if (!entry) return null;
  return {
    thumbKey: entry.ref ? `h-${hash(JSON.stringify(entry.ref))}` : entry.key,
    ref: entry.ref,
    label: entry.label,
  };
}

function WorldThumb({ refKey, worldRef, icon }: { refKey: string; worldRef: PrevisWorldRef | null; icon: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => (worldRef ? requestWorld3dThumb(refKey, worldRef, setUrl) : undefined), [refKey, worldRef]);
  if (!worldRef) return <Ds3dIcon name={icon} className="text-[26px] text-zinc-500" />;
  return url ? (
    <img src={url} alt="" draggable={false} className="h-full w-full object-contain" />
  ) : (
    <span className="block h-8 w-12 animate-pulse rounded-md bg-zinc-400/25 motion-reduce:animate-none" />
  );
}

export function Ds3dWorldPresets(p: {
  tr: Tr;
  pick: Ds3dHomePick;
  onPick: (pick: Ds3dHomePick) => void;
  history: Ds3dHomeHistoryItem[];
  onEnter: () => void;
  disabled?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const tab = p.pick.kind;
  const items =
    tab === 'preset'
      ? DS3D_WORLD_PRESETS.map((x) => ({ key: x.id, label: p.tr(x.labelKey), sub: '', ref: x.ref as PrevisWorldRef | null, icon: 'public', thumbKey: x.id }))
      : p.history.map((h) => ({
          key: h.key,
          label: h.label,
          sub: new Date(h.time).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          ref: h.ref,
          icon: h.icon,
          thumbKey: h.ref ? `h-${hash(JSON.stringify(h.ref))}` : h.key,
        }));
  const selectedKey = p.pick.kind === 'preset' ? p.pick.id : p.pick.key;
  const selected = items.find((x) => x.key === selectedKey) ?? items[0];

  // Vertical wheel scrolls the strip sideways.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      row.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    row.addEventListener('wheel', onWheel, { passive: false });
    return () => row.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    rowRef.current?.querySelector<HTMLElement>(`[data-home-item="${CSS.escape(selectedKey)}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selectedKey, tab]);

  const pickKey = (key: string) => p.onPick(tab === 'preset' ? { kind: 'preset', id: key } : { kind: 'history', key });
  const step = (dir: 1 | -1) => {
    if (items.length === 0) return;
    const i = Math.max(0, items.findIndex((x) => x.key === selected?.key));
    pickKey(items[(i + dir + items.length) % items.length].key);
  };
  const switchTab = (next: 'preset' | 'history') => {
    if (next === tab) return;
    if (next === 'preset') p.onPick({ kind: 'preset', id: DS3D_WORLD_PRESETS[0].id });
    else if (p.history[0]) p.onPick({ kind: 'history', key: p.history[0].key });
  };

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => step(dir)}
      aria-label={p.tr(dir < 0 ? 'presetPrev' : 'presetNext')}
      className={`${DS3D_PRESSABLE} grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-600 hover:bg-zinc-900/[0.06] hover:text-zinc-900`}
    >
      <Ds3dIcon name={dir < 0 ? 'chevron_left' : 'chevron_right'} className="text-[20px]" />
    </button>
  );

  const tabButton = (id: 'preset' | 'history', label: string, testId: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => switchTab(id)}
      data-testid={testId}
      className={`${DS3D_PRESSABLE} h-7 rounded-full px-3 text-xs ${tab === id ? 'bg-zinc-900 font-semibold text-white' : 'text-zinc-600 hover:bg-zinc-900/[0.06] hover:text-zinc-900'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="pointer-events-auto flex w-[min(820px,calc(100vw-32px))] flex-col items-center gap-2.5" data-testid="ds3d-v2-presets">
      {p.history.length ? (
        <div role="tablist" className="flex items-center gap-1">
          {tabButton('preset', p.tr('tabPresets'), 'ds3d-v2-home-tab-presets')}
          {tabButton('history', p.tr('tabHistory', { n: p.history.length }), 'ds3d-v2-home-tab-history')}
        </div>
      ) : null}
      <div className="text-xs text-zinc-600">{tab === 'preset' ? p.tr('presetsTitle') : p.tr('historyTitle')}</div>
      <div className="flex w-full items-center gap-1">
        {arrow(-1)}
        <div
          ref={rowRef}
          role="listbox"
          aria-label={tab === 'preset' ? p.tr('tabPresets') : p.tr('historyTitle')}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              step(e.key === 'ArrowLeft' ? -1 : 1);
            }
          }}
          className="flex min-w-0 flex-1 snap-x gap-1.5 overflow-x-auto px-1 py-1 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it) => {
            const on = it.key === selected?.key;
            return (
              <button
                key={it.key}
                type="button"
                role="option"
                aria-selected={on}
                data-home-item={it.key}
                onClick={() => pickKey(it.key)}
                className={`${DS3D_PRESSABLE} flex w-[104px] shrink-0 snap-center flex-col items-center gap-0.5 rounded-xl px-1.5 pb-1.5 pt-1 ${
                  on ? 'bg-white/70 shadow-[0_0_0_1.5px_rgba(24,24,27,0.85)]' : 'hover:bg-white/45'
                }`}
                data-testid={tab === 'preset' ? `ds3d-v2-preset-${it.key}` : `ds3d-v2-history-${it.key}`}
              >
                <span className="grid h-[58px] w-full place-items-center overflow-hidden rounded-lg bg-zinc-200/90">
                  <WorldThumb refKey={it.thumbKey} worldRef={it.ref} icon={it.icon} />
                </span>
                <span className={`max-w-full truncate text-[11px] ${on ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}>{it.label}</span>
                {it.sub ? <span className="max-w-full truncate text-[10px] tabular-nums text-zinc-500">{it.sub}</span> : null}
              </button>
            );
          })}
        </div>
        {arrow(1)}
      </div>
      {selected ? (
        <button
          type="button"
          onClick={p.onEnter}
          disabled={p.disabled}
          className={`${DS3D_PRESSABLE} inline-flex h-10 max-w-full items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50`}
          data-testid="ds3d-v2-enter-world"
        >
          <span className="truncate">{tab === 'preset' ? p.tr('enterWorld', { name: selected.label }) : p.tr('openHistory', { name: selected.label })}</span>
          <Ds3dIcon name="arrow_forward" className="text-[18px]" />
        </button>
      ) : null}
    </div>
  );
}
