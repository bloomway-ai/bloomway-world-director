/**
 * Ready-made worlds for the empty 3D Director: picked from the strip above the composer and entered without an
 * assistant round (free). Refs go through the shared normalizer, so they are the same as worlds made by chat.
 */
import { normalizePrevisWorldRef, type PrevisWorldRef } from '@core/previsWorldGen.ts';

export interface Ds3dWorldPreset {
  id: string;
  /** `directorStudio.v2.presets.<id>` (name) and `…<id>Note` (one line). */
  labelKey: string;
  ref: PrevisWorldRef;
}

const MANHATTAN = {
  roadHalfM: 7,
  sidewalkM: 4.5,
  roadSurface: 'asphalt',
  markings: true,
  lotWidthM: [12, 26],
  lotDepthM: [14, 26],
  floors: [6, 48],
  floorHeightM: 3.6,
  gapM: [1.5, 4],
  vacancy: 0.05,
  roofs: { flat: 1, gable: 0, hip: 0 },
  shopRatio: 0.85,
  shopFront: 'glass',
  tints: { plain: 0.4, blue: 0.3, warm: 0.3 },
  props: { lamp: 6, tree: 4, bench: 1, car: 18 },
  towerSetback: 0.5,
};

const BOULEVARD = {
  roadHalfM: 13,
  sidewalkM: 9,
  roadSurface: 'asphalt',
  markings: true,
  lotWidthM: [14, 24],
  lotDepthM: [16, 24],
  floors: [6, 7],
  floorHeightM: 3.4,
  gapM: [1, 2],
  vacancy: 0.03,
  roofs: { flat: 0.2, gable: 0, hip: 0.8 },
  roofPitchDeg: 40,
  shopRatio: 0.7,
  shopFront: 'glass',
  tints: { plain: 0.7, blue: 0, warm: 0.3 },
  props: { lamp: 6, tree: 11, bench: 2, car: 8 },
};

const CYBERPUNK = {
  roadHalfM: 6,
  sidewalkM: 3,
  roadSurface: 'asphalt',
  markings: true,
  lotWidthM: [10, 20],
  lotDepthM: [12, 22],
  floors: [12, 48],
  floorHeightM: 3.4,
  gapM: [4, 9],
  vacancy: 0.12,
  roofs: { flat: 1, gable: 0, hip: 0 },
  shopRatio: 0.95,
  shopFront: 'glass',
  tints: { plain: 0.3, blue: 0.55, warm: 0.15 },
  props: { lamp: 8, tree: 1, bench: 1, car: 14 },
  towerSetback: 0.35,
};

const WILD_WEST = {
  roadHalfM: 7,
  sidewalkM: 2.2,
  roadSurface: 'dirt',
  markings: false,
  lotWidthM: [8, 14],
  lotDepthM: [10, 16],
  floors: [1, 2],
  floorHeightM: 3.8,
  gapM: [1.5, 5],
  vacancy: 0.18,
  roofs: { flat: 0.7, gable: 0.3, hip: 0 },
  roofPitchDeg: 22,
  shopRatio: 0.6,
  shopFront: 'open',
  tints: { plain: 0.3, blue: 0, warm: 0.7 },
  props: { lamp: 0, tree: 1, bench: 2, barrel: 6, car: 0 },
};

const FUTURE = {
  roadHalfM: 10,
  sidewalkM: 6,
  roadSurface: 'asphalt',
  markings: true,
  lotWidthM: [18, 28],
  lotDepthM: [18, 28],
  floors: [18, 75],
  floorHeightM: 3.8,
  gapM: [12, 22],
  vacancy: 0.3,
  roofs: { flat: 1, gable: 0, hip: 0 },
  shopRatio: 0.5,
  shopFront: 'glass',
  tints: { plain: 0.45, blue: 0.55, warm: 0 },
  props: { lamp: 2, tree: 3, bench: 1, car: 3 },
  towerSetback: 0.7,
};

const SPACE_STATION = {
  roadHalfM: 4,
  sidewalkM: 2,
  roadSurface: 'stone',
  markings: false,
  lotWidthM: [10, 18],
  lotDepthM: [10, 18],
  floors: [3, 12],
  floorHeightM: 3.2,
  gapM: [1, 3],
  vacancy: 0.05,
  roofs: { flat: 1, gable: 0, hip: 0 },
  shopRatio: 0.4,
  shopFront: 'none',
  tints: { plain: 0.5, blue: 0.5, warm: 0 },
  props: { lamp: 0, tree: 0, bench: 0, car: 0 },
};

const MARS_BASE = {
  roadHalfM: 5,
  sidewalkM: 0,
  roadSurface: 'dirt',
  markings: false,
  lotWidthM: [9, 18],
  lotDepthM: [6, 13],
  floors: [1, 2],
  floorHeightM: 3.2,
  gapM: [5, 12],
  vacancy: 0.3,
  roofs: { flat: 1, gable: 0, hip: 0 },
  shopRatio: 0,
  shopFront: 'none',
  tints: { plain: 0.6, blue: 0, warm: 0.4 },
  props: { lamp: 2, tree: 0, bench: 0, car: 0 },
};

const RAW: Array<{ id: string; ref: Record<string, unknown> }> = [
  { id: 'modern', ref: { style: 'modern_city', layout: 'street', seed: 101 } },
  { id: 'crossroad', ref: { style: 'modern_city', layout: 'crossroad', density: 'high', timeOfDay: 'dusk', seed: 102 } },
  {
    id: 'manhattan',
    ref: {
      style: 'custom',
      styleName: 'Manhattan',
      styleParams: MANHATTAN,
      layout: 'crossroad',
      density: 'high',
      seed: 103,
      landmarks: [
        { kind: 'skyscraper', spot: 'far_north' },
        { kind: 'skyscraper', spot: 'far_east' },
      ],
    },
  },
  {
    id: 'paris',
    ref: {
      style: 'custom',
      styleName: 'Paris',
      styleParams: BOULEVARD,
      layout: 'street',
      seed: 104,
      landmarks: [
        { kind: 'triumphal_arch', spot: 'far_east', approach: true },
        { kind: 'lattice_tower', spot: 'far_north' },
      ],
    },
  },
  { id: 'tokyo', ref: { style: 'jp_modern', layout: 'street', seed: 105, landmarks: [{ kind: 'tv_tower', spot: 'far_north' }] } },
  { id: 'edo', ref: { style: 'edo', layout: 'street', seed: 106, landmarks: [{ kind: 'castle_keep', spot: 'far_north' }] } },
  { id: 'canal', ref: { style: 'modern_city', layout: 'street', seed: 107, water: { kind: 'canal' } } },
  { id: 'seaside', ref: { style: 'modern_city', layout: 'street', seed: 108, water: { kind: 'waterfront' } } },
  { id: 'rainNight', ref: { style: 'modern_city', layout: 'street', seed: 109, timeOfDay: 'night', weather: 'rain', neon: true } },
  { id: 'hillside', ref: { style: 'jp_modern', layout: 'street', seed: 110, slope: 0.08 } },
  { id: 'snowPlaza', ref: { style: 'modern_city', layout: 'plaza', seed: 111, weather: 'snow' } },
  {
    id: 'cyberpunk',
    ref: { style: 'custom', styleName: 'Cyberpunk', styleParams: CYBERPUNK, theme: 'cyberpunk', layout: 'crossroad', density: 'high', timeOfDay: 'night', neon: true, seed: 112 },
  },
  {
    id: 'wildWest',
    ref: { style: 'custom', styleName: 'Wild West', styleParams: WILD_WEST, layout: 'street', density: 'low', seed: 113, landmarks: [{ kind: 'mountain', spot: 'far_north' }] },
  },
  {
    id: 'future',
    ref: {
      style: 'custom',
      styleName: 'Future city',
      styleParams: FUTURE,
      theme: 'future',
      layout: 'crossroad',
      seed: 114,
      landmarks: [{ kind: 'tv_tower', spot: 'far_north' }],
    },
  },
  {
    id: 'spaceStation',
    ref: {
      style: 'custom',
      styleName: 'Space station',
      styleParams: SPACE_STATION,
      theme: 'orbital',
      layout: 'crossroad',
      timeOfDay: 'night',
      seed: 115,
    },
  },
  {
    id: 'marsBase',
    ref: {
      style: 'custom',
      styleName: 'Mars base',
      styleParams: MARS_BASE,
      theme: 'mars',
      layout: 'street',
      density: 'low',
      seed: 116,
      landmarks: [
        { kind: 'mountain', spot: 'far_north' },
        { kind: 'mountain', spot: 'far_east' },
      ],
    },
  },
];

/** Room between buildings per preset (default 0.3): towers stand further apart, old towns a little closer. */
const SPACING: Record<string, number> = { cyberpunk: 0.42, manhattan: 0.32, wildWest: 0.35, edo: 0.45 };

export const DS3D_WORLD_PRESETS: Ds3dWorldPreset[] = RAW.map(({ id, ref }) => ({
  id,
  labelKey: `presets.${id}`,
  ref: normalizePrevisWorldRef({
    schemaVersion: 1,
    extentM: [200, 200],
    density: 'medium',
    timeOfDay: 'day',
    stageAnchor: { x: 0, y: 0, headingDeg: 270 },
    spacing: SPACING[id] ?? 0.3,
    ...ref,
  }),
}));
