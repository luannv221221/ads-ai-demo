import { CREATIVE_LIBRARY_KEY } from './constants';
import type { GeneratedCopy, SavedCreative } from './types';

export function combineCreativeText(copy: Pick<GeneratedCopy, 'title' | 'body' | 'cta'>) {
  return [copy.title, copy.body, copy.cta].filter(Boolean).join('\n\n');
}

export function createImagePrompt(copy: Pick<GeneratedCopy, 'title' | 'body' | 'cta'>, product: string, audience: string) {
  return [
    `Facebook ad image for "${product}".`,
    `Target audience: ${audience}.`,
    `Main message: ${copy.title}.`,
    'Style: modern, clear benefit, strong contrast, clean layout, suitable for Facebook and Instagram feed.',
    'Composition: one short headline, realistic customer or tutor image, product benefit highlight, minimal text.',
  ].join(' ');
}

export function createSavedCreative(
  copy: GeneratedCopy,
  source: SavedCreative['source'],
  fallbackImagePrompt: string
): SavedCreative {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    createdAt: new Date().toISOString(),
    source,
    badge: copy.badge,
    title: copy.title,
    body: copy.body,
    cta: copy.cta,
    imagePrompt: copy.imagePrompt || fallbackImagePrompt,
  };
}

export function readCreativeLibrary(): SavedCreative[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(CREATIVE_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCreativeLibrary(items: SavedCreative[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CREATIVE_LIBRARY_KEY, JSON.stringify(items));
}
