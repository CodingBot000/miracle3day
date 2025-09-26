// sample-data.ts
// Example: import JSON files (generated previously) and export strongly typed data.

import type { Category } from './types';

// If your bundler supports JSON imports (Vite/Next.js/Webpack with resolve.json):
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import liftingFirming from './raw-datas-json/lifting_firming.json';
// @ts-ignore
import bodyContouring from './raw-datas-json/body_contouring.json';
// @ts-ignore
import wrinkleAntiAging from './raw-datas-json/wrinkle_antiaging.json';
// @ts-ignore
import toneTexture from './raw-datas-json/tone_texture.json';
// @ts-ignore
import acneScars from './raw-datas-json/acne_scars.json';
// @ts-ignore
import poresSebum from './raw-datas-json/pores_sebum.json';
// @ts-ignore
import pigmentationSpots from './raw-datas-json/pigmentation_spots.json';
// @ts-ignore
import hairRemoval from './raw-datas-json/hair_removal.json';
// @ts-ignore
import skinCare from './raw-datas-json/skin_care.json';
// @ts-ignore
import fillerVolume from './raw-datas-json/filler_volume.json';
// @ts-ignore
import hairScalp from './raw-datas-json/hair_scalp.json';

export const categories: Category[] = [
  liftingFirming,
  bodyContouring,
  wrinkleAntiAging,
  toneTexture,
  acneScars,
  poresSebum,
  pigmentationSpots,
  hairRemoval,
  skinCare,
  fillerVolume,
  hairScalp,
] as Category[];

// Quick lookup by id across all categories
export const getTreatmentById = (id: string) => {
  for (const cat of categories) {
    const found = cat.treatments.find(t => t.id === id);
    if (found) return { category: cat, treatment: found };
  }
  return null;
};

// Example: build card-ready rows for a given category (locale aware)
export const getCardRows = (categoryKey: string, locale: 'ko'|'en' = 'ko') => {
  const cat = categories.find(c => c.category_key === categoryKey);
  if (!cat) return [];
  return cat.treatments.map(t => ({
    id: t.id,
    title: t.name[locale],
    subtitle: t.summary[locale],
    tags: t.tags.map(tag => tag[locale]),
    infoLine: t ? undefined : undefined // placeholder; filled by helpers in your UI layer
  }));
};