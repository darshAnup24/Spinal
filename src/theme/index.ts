import { Easing } from 'react-native';
import type { Priority } from '../native/UnreadProblem';

/**
 * Design tokens mirrored 1:1 from the Brain-Overflow web theme
 * (frontend/src/index.css @theme block).
 *
 * Surfaces, hairlines, text hierarchy, status voices, the magenta dither
 * accent, motion curves and the mono/pixel font pairing are all identical.
 */
export const color = {
  /* Page surfaces — true void, slight warmth on elevation */
  void: '#04050a',
  deep: '#0a0c12',
  surface: '#11141c',

  /* Edges — barely-there hairlines */
  edge: 'rgba(220, 224, 230, 0.06)',
  edgeGlow: 'rgba(220, 224, 230, 0.16)',

  /* Text — bone-white hierarchy, NO accent color */
  text: '#e4e6eb',
  textMute: '#7a8290',
  textDim: '#3f4651',

  /* Status — the only chromatic voices besides the magenta dither */
  strong: '#88c9a1',
  weak: '#c97070',
  pivot: '#d4a574',
  refine: '#c9b870',

  /* Magenta dither sampling */
  dither: 'hsl(320, 100%, 70%)',
  ditherHex: '#ff66cc',
  ditherDim: '#cc3399',

  /* Composite helpers (RN has no color-mix) */
  surface60: 'rgba(17, 20, 28, 0.6)',
  deep80: 'rgba(10, 12, 18, 0.8)',
  void50: 'rgba(4, 5, 10, 0.5)',
} as const;

/**
 * Font families. Static TTFs live in assets/fonts and are linked through
 * react-native.config.js; the family name equals the file / PostScript name on
 * both Android and iOS (e.g. JetBrainsMono-Regular).
 */
export const font = {
  mono: {
    regular: 'JetBrainsMono-Regular',
    medium: 'JetBrainsMono-Medium',
    bold: 'JetBrainsMono-Bold',
    extraBold: 'JetBrainsMono-ExtraBold',
  },
  pixel: {
    regular: 'PixelifySans-Regular',
    medium: 'PixelifySans-Medium',
    semiBold: 'PixelifySans-SemiBold',
  },
} as const;

/** Motion — matches --ease-os / --ease-snap / durations. */
export const motion = {
  easeOs: Easing.bezier(0.32, 0.72, 0, 1),
  easeSnap: Easing.bezier(0.16, 1, 0.3, 1),
  durFast: 120,
  durBase: 240,
  durSlow: 480,
  durAtmos: 1200,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 3,
  md: 6,
  lg: 12,
} as const;

/** Status voice per unread priority — HIGH→weak, MEDIUM→pivot, LOW→strong. */
export const priorityMeta: Record<
  Priority,
  { tone: string; label: string }
> = {
  HIGH: { tone: color.weak, label: 'HIGH' },
  MEDIUM: { tone: color.pivot, label: 'MEDIUM' },
  LOW: { tone: color.strong, label: 'LOW' },
};

export const priorityTone = (p: Priority) => priorityMeta[p].tone;

export const theme = { color, font, motion, space, radius, priorityMeta, priorityTone };
export default theme;
