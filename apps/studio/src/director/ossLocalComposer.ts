/**
 * Offline stand-in for product Composer (no LLM). Parses short commands into world / plan edits.
 */
import { createManualPrevisPlan } from '@edit/previsV2Edit.ts';
import { generatePrevisWorld, normalizePrevisWorldRef, type PrevisWorldOverride, type PrevisWorldRef } from '@core/previsWorldGen.ts';
import { normalizePrevisPlan, type PrevisPlan } from '@core/previsPlanCore.ts';
import { DS3D_WORLD_PRESETS } from './v2/ds3dPresetWorlds';

export type OssComposerPick = { kind: string; id: string; sub?: string } | null;

export type OssComposerOutcome =
  | {
      ok: true;
      reply: string;
      plan?: PrevisPlan | null;
      world?: PrevisWorldRef | null;
      grow?: boolean;
      /** Fetch plan JSON from this URL (e.g. bundled examples). */
      fetchPlanUrl?: string;
    }
  | { ok: false; reply: string };

const t = (s: string) => s.trim().toLowerCase();

function appendOverride(ref: PrevisWorldRef, ov: PrevisWorldOverride): PrevisWorldRef {
  const overrides = [...(ref.overrides ?? []), ov];
  return normalizePrevisWorldRef({ ...ref, overrides });
}

function patchRef(ref: PrevisWorldRef, patch: Record<string, unknown>): PrevisWorldRef {
  return normalizePrevisWorldRef({ ...ref, ...patch });
}

function applyPhrasePatches(world: PrevisWorldRef, s: string): { next: PrevisWorldRef; notes: string[] } {
  let next = world;
  const notes: string[] = [];

  if (/(rain|rainy)/.test(s)) {
    next = patchRef(next, { weather: 'rain' });
    notes.push('rain');
  }
  if (/(snow|snowy)/.test(s)) {
    next = patchRef(next, { weather: 'snow' });
    notes.push('snow');
  }
  if (/(clear weather|sunny|clear sky)/.test(s)) {
    const { weather: _w, ...rest } = next as PrevisWorldRef & { weather?: string };
    next = normalizePrevisWorldRef(rest);
    notes.push('clear');
  }
  if (/(night|nighttime)/.test(s)) {
    next = patchRef(next, { timeOfDay: 'night' });
    notes.push('night');
  }
  if (/(daytime|dawn|day\b)/.test(s)) {
    next = patchRef(next, { timeOfDay: /dawn/.test(s) ? 'dawn' : 'day' });
    notes.push('day');
  }
  if (/(neon)/.test(s)) {
    next = patchRef(next, { neon: !/(off|disable|no neon)/.test(s) });
    notes.push('neon');
  }
  if (/(high density|dense)/.test(s)) next = patchRef(next, { density: 'high' });
  if (/(low density|sparse)/.test(s)) next = patchRef(next, { density: 'low' });
  if (/(edo)/.test(s)) next = patchRef(next, { style: 'edo' });
  if (/(tokyo|jp_modern|japan)/.test(s)) next = patchRef(next, { style: 'jp_modern' });
  if (/(manhattan|modern city)/.test(s)) next = patchRef(next, { style: 'modern_city' });
  if (/(cyberpunk)/.test(s)) {
    const cyber = DS3D_WORLD_PRESETS.find((p) => p.id === 'cyberpunk');
    if (cyber) next = normalizePrevisWorldRef({ ...cyber.ref, ...next, theme: 'cyberpunk' });
    notes.push('cyberpunk');
  }

  return { next, notes };
}

function presetIdFromPhrase(s: string): string {
  if (/(cyberpunk|blade runner)/.test(s)) return 'cyberpunk';
  if (/(manhattan|skyscraper|downtown)/.test(s)) return 'manhattan';
  if (/(paris|boulevard|eiffel)/.test(s)) return 'paris';
  if (/(tokyo|shibuya|japan)/.test(s)) return 'tokyo';
  if (/(edo|samurai)/.test(s)) return 'edo';
  if (/(mars|colony|red planet)/.test(s)) return 'marsBase';
  if (/(seaside|waterfront)/.test(s)) return 'seaside';
  if (/(canal|venice)/.test(s)) return 'canal';
  if (/(wild west|western)/.test(s)) return 'wildWest';
  if (/(space station|orbital)/.test(s)) return 'spaceStation';
  if (/(future|utopia)/.test(s)) return 'future';
  if (/(crossroad|intersection)/.test(s)) return 'crossroad';
  if (/(rain.*night|rainy night)/.test(s) && /(city|street|neon)/.test(s)) return 'rainNight';
  if (/(city|street|urban|build|town|world|neon|skyline)/.test(s)) return 'modern';
  return '';
}

function createWorldFromPhrase(raw: string): { world: PrevisWorldRef; label: string } | null {
  const s = t(raw);
  const id = presetIdFromPhrase(s);
  if (!id) return null;
  const preset = DS3D_WORLD_PRESETS.find((p) => p.id === id);
  if (!preset) return null;
  const base = normalizePrevisWorldRef(JSON.parse(JSON.stringify(preset.ref)) as PrevisWorldRef);
  const { next, notes } = applyPhrasePatches(base, s);
  const suffix = notes.length ? ` · ${notes.join(', ')}` : '';
  return { world: next, label: `${id}${suffix}` };
}

function isDramaPhrase(s: string): boolean {
  return /(rivals meet|confrontation|chase scene|standoff|two rivals|meet in the street|剧情|对峙|雨夜.*遇见|街头对峙)/.test(s);
}

export function runOssComposerCommand(
  raw: string,
  ctx: { plan: PrevisPlan | null; world: PrevisWorldRef | null; pick: OssComposerPick },
): OssComposerOutcome {
  const text = raw.trim();
  if (text.length < 2) {
    return { ok: false, reply: 'Type at least 2 characters (e.g. rainy night, remove building, new plan).' };
  }

  if (text.startsWith('{')) {
    try {
      const json = JSON.parse(text) as unknown;
      if (json && typeof json === 'object' && 'durationSec' in (json as object)) {
        const plan = normalizePrevisPlan(json);
        return {
          ok: true,
          reply: `Loaded plan "${plan.title ?? 'plan'}".`,
          plan,
          world: plan.set?.world ? normalizePrevisWorldRef(plan.set.world) : ctx.world,
          grow: true,
        };
      }
      const world = normalizePrevisWorldRef(json);
      return { ok: true, reply: 'Applied world JSON.', plan: null, world, grow: true };
    } catch {
      return { ok: false, reply: 'Invalid JSON — check plan or world-ref format.' };
    }
  }

  const s = t(text);

  if (/^(new world|blank)$/.test(s)) {
    return { ok: true, reply: 'Back to home — pick a preset or describe a world.', plan: null, world: null };
  }

  if (/^(load example|edo example)$/.test(s)) {
    return {
      ok: true,
      reply: 'Loading Edo rainy night example…',
      fetchPlanUrl: '/examples/edo-rainy-night/plan.json',
    };
  }

  if (/^(load drama|street drama|drama example)$/.test(s)) {
    return {
      ok: true,
      reply: 'Loading street drama scene…',
      fetchPlanUrl: '/examples/street-drama/plan.json',
    };
  }

  if (!ctx.plan && !ctx.world && isDramaPhrase(s)) {
    return {
      ok: true,
      reply: 'Story line recognized — loading blocking and camera plan.',
      fetchPlanUrl: '/examples/street-drama/plan.json',
    };
  }

  if (/^(new plan|manual plan)$/.test(s)) {
    if (!ctx.world) return { ok: false, reply: 'Enter or load a world first, then run "new plan".' };
    const plan = createManualPrevisPlan(ctx.world, 12);
    return {
      ok: true,
      reply: 'Created blank 12s plan — pause, explore with WASD, add camera keys.',
      plan,
      world: ctx.world,
      grow: false,
    };
  }

  const world = ctx.world ?? ctx.plan?.set?.world ?? null;
  if (!world) {
    const built = createWorldFromPhrase(text);
    if (built) {
      return {
        ok: true,
        reply: `Built city from your line: ${built.label} (offline rules — full AI composer is on Bloomway).`,
        world: built.world,
        plan: null,
        grow: true,
      };
    }
    return {
      ok: false,
      reply:
        'Describe a city in one line (e.g. neon cyberpunk city at night in the rain), pick a preset, or load street drama / load example.',
    };
  }

  let next = world;
  const notes: string[] = [];
  const patched = applyPhrasePatches(next, s);
  next = patched.next;
  notes.push(...patched.notes);

  if (/(remove|delete).*(building)|remove building/.test(s)) {
    if (!ctx.pick || ctx.pick.kind !== 'building') {
      return { ok: false, reply: 'Pick a building in the viewport first, then say "remove building".' };
    }
    next = appendOverride(next, { op: 'remove', id: ctx.pick.id });
    notes.push(`remove ${ctx.pick.id}`);
  }

  if (/(taller|add floor|raise)/.test(s)) {
    if (!ctx.pick || ctx.pick.kind !== 'building') {
      return { ok: false, reply: 'Pick a building first, then say "taller" or "add floor".' };
    }
    const gen = generatePrevisWorld(next);
    const b = gen.buildings.find((x) => x.id === ctx.pick!.id);
    const h = (b?.h ?? 12) + 3;
    next = appendOverride(next, { op: 'resize', id: ctx.pick.id, h });
    notes.push(`height ~${h}m`);
  }

  if (notes.length === 0) {
    return {
      ok: false,
      reply:
        'Offline rules only — try: rainy night, neon on, remove building (pick first), taller, new plan, or paste plan/world JSON. Full AI chat is on Bloomway product.',
    };
  }

  let plan = ctx.plan;
  if (plan?.set) plan = { ...plan, set: { ...plan.set, world: next } };

  const structural = notes.some((n) => !['rain', 'snow', 'clear', 'night', 'day'].includes(n));

  return {
    ok: true,
    reply: `Applied locally: ${notes.join(', ')} (rule parser, no AI).`,
    plan,
    world: next,
    grow: structural,
  };
}
