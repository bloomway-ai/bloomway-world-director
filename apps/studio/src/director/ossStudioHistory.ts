import type { PrevisPlan } from '@core/previsPlanCore.ts';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';

const STORAGE_KEY = 'bwd-studio-history-v1';
const MAX = 24;

export type StudioHistoryEntry = {
  key: string;
  createdAt: number;
  label: string;
  note: string;
  plan: PrevisPlan | null;
  world: PrevisWorldRef | null;
};

export function loadStudioHistory(): StudioHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudioHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveStudioHistory(entries: StudioHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* quota / private mode */
  }
}

export function pushStudioHistory(entry: Omit<StudioHistoryEntry, 'key' | 'createdAt'> & { key?: string; createdAt?: number }) {
  const list = loadStudioHistory();
  const item: StudioHistoryEntry = {
    key: entry.key ?? `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: entry.createdAt ?? Date.now(),
    label: entry.label,
    note: entry.note,
    plan: entry.plan,
    world: entry.world,
  };
  const next = [item, ...list.filter((x) => x.key !== item.key)].slice(0, MAX);
  saveStudioHistory(next);
  return next;
}

export function worldStyleLabel(ref: PrevisWorldRef): string {
  if (ref.style === 'custom') return ref.styleName || 'Custom';
  const map: Record<string, string> = {
    edo: 'Edo',
    jp_modern: 'Tokyo',
    modern_city: 'Modern city',
    mars: 'Mars',
  };
  return map[ref.style] ?? ref.style;
}
