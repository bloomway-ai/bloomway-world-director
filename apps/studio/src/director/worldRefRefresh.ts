import type { PrevisPlan } from '@core/previsPlanCore.ts';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';

export type World3dSourceLike = PrevisPlan | { world: PrevisWorldRef };

export type WorldRefreshKind = 'none' | 'atmosphere' | 'geometry';

export function worldRefFromSource(source: World3dSourceLike | null): PrevisWorldRef | null {
  if (!source) return null;
  if ('stage' in source) return source.set?.world ?? null;
  return source.world;
}

/** Sky / precip only — neon and wet materials need a geometry pass. */
const ATMOSPHERE_KEYS = new Set(['timeOfDay', 'weather']);

/** Identity of generated city layout (excludes weather / time / neon). */
export function worldRefGeometryKey(ref: PrevisWorldRef | null): string {
  if (!ref) return '';
  const o = { ...ref } as Record<string, unknown>;
  for (const k of ATMOSPHERE_KEYS) delete o[k];
  return JSON.stringify(o);
}

export function classifyWorldRefChange(prev: PrevisWorldRef | null, next: PrevisWorldRef | null): WorldRefreshKind {
  if (!next) return 'geometry';
  if (!prev) return 'geometry';
  if (worldRefGeometryKey(prev) !== worldRefGeometryKey(next)) return 'geometry';
  if (prev.timeOfDay !== next.timeOfDay || prev.weather !== next.weather) return 'atmosphere';
  return 'none';
}

export function classifyPlanWorldChange(prev: PrevisPlan | null, next: PrevisPlan | null): WorldRefreshKind {
  const a = prev?.set?.world ?? null;
  const b = next?.set?.world ?? null;
  if (a && b) {
    const w = classifyWorldRefChange(a, b);
    if (w !== 'none') return w;
  }
  if (!prev || !next) return 'geometry';
  const strip = (p: PrevisPlan) => {
    const c = JSON.parse(JSON.stringify(p)) as PrevisPlan;
    if (c.set) delete (c.set as { world?: unknown }).world;
    return JSON.stringify(c);
  };
  return strip(prev) === strip(next) ? 'none' : 'geometry';
}
