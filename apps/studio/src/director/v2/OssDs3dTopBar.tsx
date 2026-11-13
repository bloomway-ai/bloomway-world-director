import React, { useEffect, useRef } from 'react';
import type { PrevisPlan } from '@core/previsPlanCore.ts';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';
import { DS3D_GLASS, DS3D_PRESSABLE, Ds3dBar, Ds3dBarSeparator, Ds3dIcon, Ds3dIconButton } from './ds3dChrome';
import { Ds3dSettingsPanel, type Ds3dLookSensitivity, type Ds3dWorldPatch } from './Ds3dSettingsPanel';
import type { StudioHistoryEntry } from '../ossStudioHistory';

export type OssTool = 'select' | 'rotate' | 'actor' | 'camera';

const TOOLS: Array<{ id: OssTool; icon: string; key: string }> = [
  { id: 'select', icon: 'arrow_selector_tool', key: 'V' },
  { id: 'rotate', icon: 'rotate_right', key: 'R' },
  { id: 'actor', icon: 'person_add', key: 'H' },
  { id: 'camera', icon: 'videocam', key: 'C' },
];

type Popover = 'versions' | 'settings' | null;

export type OssDs3dTopBarProps = {
  tr: (k: string, p?: Record<string, string | number>) => string;
  scopeNew: boolean;
  onNewWorld: () => void;
  history: StudioHistoryEntry[];
  currentLabel: string;
  currentNote: string;
  hasSession: boolean;
  activeHistoryKey: string | null;
  onRestoreHistory: (entry: StudioHistoryEntry) => void;
  onRestoreCurrentWorld: () => void;
  tool: OssTool;
  onTool: (t: OssTool) => void;
  canUseTools: boolean;
  undoDepth: number;
  redoDepth: number;
  onUndo: () => void;
  onRedo: () => void;
  onScreenshot: () => void;
  onResetView: () => void;
  moveSpeed: number;
  onMoveSpeed: (v: number) => void;
  look: Ds3dLookSensitivity;
  onLook: (v: Ds3dLookSensitivity) => void;
  world: PrevisWorldRef | null;
  onWorld: (patch: Ds3dWorldPatch) => void;
  plan: PrevisPlan | null;
};

export function OssDs3dTopBar(p: OssDs3dTopBarProps) {
  const [popover, setPopover] = React.useState<Popover>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!popover) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if ((e.target as HTMLElement)?.closest?.('[data-ds3d-popover-trigger]')) return;
      setPopover(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopover(null);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [popover]);

  return (
    <>
      {/* Top-left: title + 新建 + 历史 */}
      <div className="pointer-events-none absolute left-4 top-3.5 z-30 flex flex-col items-start gap-2 [&>*]:pointer-events-auto">
        <Ds3dBar className="pr-3.5" data-testid="ds3d-v2-title-bar">
          <span className="grid h-9 w-9 place-items-center text-primary">
            <Ds3dIcon name="view_in_ar" className="text-[22px]" fill />
          </span>
          <h2 className="text-[13px] font-bold tracking-[0.12em] text-zinc-50">{p.tr('title')}</h2>
          <span className="ml-2 max-w-[180px] truncate text-xs text-zinc-500">OSS</span>
          <Ds3dBarSeparator />
          <button
            type="button"
            onClick={p.onNewWorld}
            title={p.tr('newWorldHint')}
            aria-pressed={p.scopeNew}
            data-testid="ds3d-v2-new"
            className={`${DS3D_PRESSABLE} flex h-9 items-center gap-1.5 rounded-[10px] px-2.5 text-xs font-semibold ${
              p.scopeNew ? 'bg-primary/15 text-primary' : 'text-zinc-200 hover:bg-white/[0.08]'
            }`}
          >
            <Ds3dIcon name="add" className="text-[18px]" />
            {p.tr('newWorld')}
          </button>
          {p.history.length > 0 || p.hasSession ? (
            <>
              <Ds3dBarSeparator />
              <span data-ds3d-popover-trigger="">
                <Ds3dIconButton
                  icon="history"
                  label={p.tr('versions')}
                  active={popover === 'versions'}
                  onClick={() => setPopover((x) => (x === 'versions' ? null : 'versions'))}
                  testId="ds3d-v2-versions"
                />
              </span>
            </>
          ) : null}
        </Ds3dBar>
        {popover === 'versions' ? (
          <div ref={popRef} className={`flex max-h-[min(420px,50vh)] w-[280px] flex-col gap-1 overflow-y-auto rounded-[14px] p-1.5 ${DS3D_GLASS}`} role="menu">
            {p.hasSession ? (
              <button
                type="button"
                role="menuitemradio"
                aria-checked={!p.activeHistoryKey}
                onClick={() => {
                  p.onRestoreCurrentWorld();
                  setPopover(null);
                }}
                data-testid="ds3d-v2-version-world"
                className={`${DS3D_PRESSABLE} flex flex-col items-start gap-0.5 rounded-[10px] px-2.5 py-2 text-left ${
                  !p.activeHistoryKey ? 'bg-primary/[0.12]' : 'hover:bg-white/[0.06]'
                }`}
              >
                <span className={`text-xs font-semibold ${!p.activeHistoryKey ? 'text-primary' : 'text-zinc-200'}`}>
                  {p.tr('versionWorld', { name: p.currentLabel })}
                </span>
                <span className="line-clamp-2 text-[11px] text-zinc-500">{p.currentNote || '—'}</span>
              </button>
            ) : null}
            {p.history.map((h) => {
              const on = p.activeHistoryKey === h.key;
              return (
                <button
                  key={h.key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  onClick={() => {
                    p.onRestoreHistory(h);
                    setPopover(null);
                  }}
                  data-testid={`ds3d-v2-history-${h.key}`}
                  className={`${DS3D_PRESSABLE} flex flex-col items-start gap-0.5 rounded-[10px] px-2.5 py-2 text-left ${on ? 'bg-primary/[0.12]' : 'hover:bg-white/[0.06]'}`}
                >
                  <span className={`text-xs font-semibold ${on ? 'text-primary' : 'text-zinc-300'}`}>{h.label}</span>
                  <span className="text-[11px] tabular-nums text-zinc-500">
                    {new Date(h.createdAt).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="line-clamp-1 text-[11px] text-zinc-500">{h.note || '—'}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Top-centre: tools */}
      <div className="pointer-events-none absolute left-1/2 top-3.5 z-30 -translate-x-1/2 [&>*]:pointer-events-auto">
        <Ds3dBar data-testid="ds3d-v2-toolbar">
          {TOOLS.map((tl) => (
            <Ds3dIconButton
              key={tl.id}
              icon={tl.icon}
              label={p.tr(`tools.${tl.id}`)}
              shortcut={tl.key}
              active={p.tool === tl.id}
              disabled={tl.id !== 'select' && !p.canUseTools}
              onClick={() => p.onTool(tl.id)}
              testId={`ds3d-v2-tool-${tl.id}`}
            />
          ))}
          <Ds3dBarSeparator />
          <Ds3dIconButton
            icon="photo_camera"
            label={p.tr('tools.screenshot')}
            shortcut="⇧ S"
            disabled={!p.canUseTools}
            onClick={p.onScreenshot}
            testId="ds3d-v2-screenshot"
          />
          <Ds3dBarSeparator />
          <Ds3dIconButton icon="undo" label={p.tr('tools.undo')} shortcut="⌘ Z" disabled={p.undoDepth === 0} onClick={p.onUndo} testId="ds3d-v2-undo" />
          <Ds3dIconButton icon="redo" label={p.tr('tools.redo')} shortcut="⇧ ⌘ Z" disabled={p.redoDepth === 0} onClick={p.onRedo} testId="ds3d-v2-redo" />
        </Ds3dBar>
      </div>

      {/* Top-right */}
      <div className="pointer-events-none absolute right-4 top-3.5 z-30 flex flex-col items-end gap-2 [&>*]:pointer-events-auto">
        <Ds3dBar>
          <Ds3dIconButton icon="center_focus_strong" label={p.tr('resetView')} disabled={!p.canUseTools} onClick={p.onResetView} testId="ds3d-v2-reset-view" />
          <span data-ds3d-popover-trigger="">
            <Ds3dIconButton
              icon="settings"
              label={p.tr('settings')}
              active={popover === 'settings'}
              onClick={() => setPopover((x) => (x === 'settings' ? null : 'settings'))}
              testId="ds3d-v2-settings-toggle"
            />
          </span>
        </Ds3dBar>
        {popover === 'settings' ? (
          <div ref={popRef}>
            <Ds3dSettingsPanel
              tr={p.tr}
              moveSpeed={p.moveSpeed}
              onMoveSpeed={p.onMoveSpeed}
              look={p.look}
              onLook={p.onLook}
              world={p.world}
              onWorld={p.onWorld}
              room={null}
              roomLocked
              onRoom={() => {}}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
