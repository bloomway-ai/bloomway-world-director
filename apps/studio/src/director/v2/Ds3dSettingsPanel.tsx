/** Settings popover behind the gear button (navigation, world and controls help; the camera has its own panel, the take length sits on the composer). */
import React, { useEffect, useState } from 'react';
import type { PrevisWorldDensity, PrevisWorldRef, PrevisWorldTimeOfDay } from '@core/previsWorldGen.ts';
import { DS3D_GLASS, Ds3dSegmented } from './ds3dChrome';
import { PREVIS_ROOM_TYPES, type PrevisRoomSpec, type PrevisRoomType } from '@core/previsRoom.ts';

export type Ds3dLookSensitivity = 'low' | 'medium' | 'high';
export const DS3D_LOOK_MULT: Record<Ds3dLookSensitivity, number> = { low: 0.6, medium: 1, high: 1.6 };

export type Ds3dSettingsPanelProps = {
  tr: (k: string, p?: Record<string, string | number>) => string;
  moveSpeed: number;
  onMoveSpeed: (v: number) => void;
  look: Ds3dLookSensitivity;
  onLook: (v: Ds3dLookSensitivity) => void;
  /** Current world (world settings are rebuilt locally, free). */
  world: PrevisWorldRef | null;
  onWorld: (patch: Ds3dWorldPatch) => void;
  /** Shown room (an interior), or null; editable while no one is placed in it. */
  room: PrevisRoomSpec | null;
  roomLocked: boolean;
  /** A building's interior: its size is the building's. */
  roomSizeLocked?: boolean;
  onRoom: (patch: { type?: PrevisRoomType; widthM?: number; depthM?: number }) => void;
};

export type Ds3dWater = 'none' | 'river' | 'river_along' | 'canal' | 'waterfront';
export type Ds3dWeather = 'clear' | 'rain' | 'snow';
/** Slope presets: flat, gentle (6 %), steep (15 %), and rolling hills. */
export const DS3D_SLOPES = { flat: 0, gentle: 0.06, steep: 0.15 } as const;
export type Ds3dSlope = keyof typeof DS3D_SLOPES | 'hilly';
export type Ds3dWorldPatch = {
  extent?: number;
  density?: PrevisWorldDensity;
  time?: PrevisWorldTimeOfDay;
  weather?: Ds3dWeather;
  neon?: boolean;
  water?: Ds3dWater;
  slope?: Ds3dSlope;
};

function slopeOf(grade: number | undefined, hills?: boolean): Ds3dSlope {
  if (hills) return 'hilly';
  if (!grade) return 'flat';
  return grade >= 0.1 ? 'steep' : 'gentle';
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-white/10 pt-3">
      <span className="text-[10.5px] font-bold tracking-[0.12em] text-zinc-500">{title}</span>
      {children}
    </div>
  );
}

function Row({ label, children, value }: { label: string; children: React.ReactNode; value?: string }) {
  return (
    <div className={`grid items-center gap-2.5 ${value != null ? 'grid-cols-[76px_1fr_58px]' : 'grid-cols-[76px_1fr]'}`}>
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
      {value != null ? <span className="text-right text-xs font-semibold tabular-nums text-primary">{value}</span> : null}
    </div>
  );
}

export function Ds3dSettingsPanel(p: Ds3dSettingsPanelProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      role="dialog"
      aria-label={p.tr('settings')}
      data-testid="ds3d-v2-settings"
      className={`pointer-events-auto flex max-h-[calc(100dvh-84px)] w-[340px] origin-top-right flex-col gap-3 overflow-y-auto overscroll-contain rounded-[14px] px-3.5 pb-3.5 pt-3 transition-[opacity,transform] duration-150 ease-out [scrollbar-width:thin] motion-reduce:transition-none ${DS3D_GLASS} ${
        shown ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'
      }`}
    >
      <h3 className="text-[13px] font-semibold text-zinc-100">{p.tr('settings')}</h3>
      <Group title={p.tr('settingsBrowse')}>
        <Row label={p.tr('moveSpeed')} value={p.tr('speedValue', { v: p.moveSpeed.toFixed(1) })}>
          <input
            type="range"
            min={0.5}
            max={15}
            step={0.5}
            value={p.moveSpeed}
            onChange={(e) => p.onMoveSpeed(Number(e.target.value))}
            aria-label={p.tr('moveSpeed')}
            data-testid="ds3d-v2-speed"
            style={{ accentColor: '#a3e635' }}
            className="h-1 w-full cursor-pointer"
          />
        </Row>
        <Row label={p.tr('lookSensitivity')}>
          <Ds3dSegmented<Ds3dLookSensitivity>
            value={p.look}
            onChange={p.onLook}
            options={(['low', 'medium', 'high'] as const).map((v) => ({ value: v, label: p.tr(`levels.${v}`) }))}
          />
        </Row>
      </Group>
      {p.room ? (
        <Group title={p.tr('settingsRoom')}>
          <Row label={p.tr('roomType')}>
            <select
              value={p.room.type}
              disabled={p.roomLocked}
              onChange={(e) => p.onRoom({ type: e.target.value as PrevisRoomType })}
              data-testid="ds3d-v2-room-type"
              aria-label={p.tr('roomType')}
              className="h-8 w-full cursor-pointer rounded-[10px] border border-white/10 bg-white/[0.04] px-2.5 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {PREVIS_ROOM_TYPES.map((t) => (
                <option key={t} value={t} className="bg-zinc-900">
                  {p.tr(`roomTypes.${t}`)}
                </option>
              ))}
            </select>
          </Row>
          {(p.roomSizeLocked ? [] : (['widthM', 'depthM'] as const)).map((k) => (
            <Row key={k} label={p.tr(k === 'widthM' ? 'roomWidth' : 'roomDepth')} value={p.tr('extentValue', { m: p.room![k] })}>
              <input
                type="range"
                min={4}
                max={24}
                step={0.5}
                defaultValue={p.room![k]}
                key={`${p.room!.type}-${k}-${p.room![k]}`}
                disabled={p.roomLocked}
                onPointerUp={(e) => p.onRoom({ [k]: Number((e.target as HTMLInputElement).value) })}
                onKeyUp={(e) => p.onRoom({ [k]: Number((e.target as HTMLInputElement).value) })}
                aria-label={p.tr(k === 'widthM' ? 'roomWidth' : 'roomDepth')}
                data-testid={`ds3d-v2-room-${k}`}
                style={{ accentColor: '#a3e635' }}
                className="h-1 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Row>
          ))}
          {p.roomLocked ? <p className="pl-[86px] text-[11px] leading-relaxed text-zinc-500">{p.tr('roomLockedHint')}</p> : null}
        </Group>
      ) : p.world ? (
        <Group title={p.tr('settingsWorld')}>
          <Row label={p.tr('extent')} value={p.tr('extentValue', { m: p.world.extentM[0] })}>
            <input
              type="range"
              min={60}
              max={200}
              step={10}
              defaultValue={p.world.extentM[0]}
              key={`${p.world.seed}-${p.world.extentM[0]}`}
              onPointerUp={(e) => p.onWorld({ extent: Number((e.target as HTMLInputElement).value) })}
              onKeyUp={(e) => p.onWorld({ extent: Number((e.target as HTMLInputElement).value) })}
              aria-label={p.tr('extent')}
              style={{ accentColor: '#a3e635' }}
              className="h-1 w-full cursor-pointer"
            />
          </Row>
          <Row label={p.tr('density')}>
            <Ds3dSegmented<PrevisWorldDensity>
              value={p.world.density}
              onChange={(v) => p.onWorld({ density: v })}
              options={(['low', 'medium', 'high'] as const).map((v) => ({ value: v, label: p.tr(`densities.${v}`) }))}
            />
          </Row>
          <Row label={p.tr('timeOfDay')}>
            <Ds3dSegmented<PrevisWorldTimeOfDay>
              value={p.world.timeOfDay ?? 'day'}
              onChange={(v) => p.onWorld({ time: v })}
              testId="ds3d-v2-world-time"
              options={(['day', 'dusk', 'night'] as const).map((v) => ({ value: v, label: p.tr(`times.${v}`) }))}
            />
          </Row>
          <Row label={p.tr('weather')}>
            <Ds3dSegmented<Ds3dWeather>
              value={p.world.weather ?? 'clear'}
              onChange={(v) => p.onWorld({ weather: v })}
              testId="ds3d-v2-world-weather"
              options={(['clear', 'rain', 'snow'] as const).map((v) => ({ value: v, label: p.tr(`weathers.${v}`) }))}
            />
          </Row>
          <Row label={p.tr('neon')}>
            <Ds3dSegmented<'off' | 'on'>
              value={p.world.neon ? 'on' : 'off'}
              onChange={(v) => p.onWorld({ neon: v === 'on' })}
              testId="ds3d-v2-world-neon"
              options={(['off', 'on'] as const).map((v) => ({ value: v, label: p.tr(`neonStates.${v}`) }))}
            />
          </Row>
          <Row label={p.tr('water')}>
            <Ds3dSegmented<Ds3dWater>
              value={p.world.water?.kind ?? 'none'}
              onChange={(v) => p.onWorld({ water: v })}
              testId="ds3d-v2-world-water"
              options={(['none', 'river', 'river_along', 'canal', 'waterfront'] as const).map((v) => ({ value: v, label: p.tr(`waters.${v}`) }))}
            />
          </Row>
          <Row label={p.tr('slope')}>
            <Ds3dSegmented<Ds3dSlope>
              value={slopeOf(p.world.slope, p.world.hills)}
              onChange={(v) => p.onWorld({ slope: v })}
              testId="ds3d-v2-world-slope"
              options={(['flat', 'gentle', 'steep', 'hilly'] as const).map((v) => ({ value: v, label: p.tr(`slopes.${v}`) }))}
            />
          </Row>
        </Group>
      ) : null}
      <Group title={p.tr('settingsControls')}>
        <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-zinc-400">
          {(['controlsPan', 'controlsLook', 'controlsMove', 'controlsTouch', 'controlsPlay'] as const).map((k) => (
            <li key={k}>{p.tr(k)}</li>
          ))}
        </ul>
      </Group>
    </div>
  );
}
