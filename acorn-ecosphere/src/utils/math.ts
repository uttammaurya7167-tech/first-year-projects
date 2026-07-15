// =============================================
// ECOSPHERE — Math & Utility Helpers
// =============================================

import type { Vec2 } from '../types';

// Clamp a value between min and max
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// Linear interpolation
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp(t, 0, 1);

// Map a value from one range to another
export const mapRange = (
  value: number, inMin: number, inMax: number,
  outMin: number, outMax: number
): number => {
  if (inMin === inMax) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
};

// Random float in [min, max)
export const randFloat = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

// Random int in [min, max]
export const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Random boolean with probability p (0–1)
export const randBool = (p: number = 0.5): boolean =>
  Math.random() < p;

// Distance between two Vec2
export const distance = (a: Vec2, b: Vec2): number =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// Normalized direction from a to b
export const direction = (from: Vec2, to: Vec2): Vec2 => {
  const dist = distance(from, to);
  if (dist === 0) return { x: 0, y: 0 };
  return { x: (to.x - from.x) / dist, y: (to.y - from.y) / dist };
};

// Multiply Vec2 by scalar
export const vecScale = (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s });

// Add two Vec2
export const vecAdd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });

// Generate a unique ID
export const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Format a number nicely
export const formatNumber = (n: number, decimals: number = 0): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(decimals);
};

// Format simulation time (ticks → years, days)
export const formatSimTime = (year: number): string => {
  if (year < 1) return `${Math.floor(year * 365)} Days`;
  if (year < 10) return `${year.toFixed(1)} Years`;
  return `${Math.floor(year)} Years`;
};

// Get color between two hex colors at ratio t
export const lerpColor = (colorA: string, colorB: string, t: number): string => {
  const parseHex = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = parseHex(colorA);
  const [r2, g2, b2] = parseHex(colorB);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r}, ${g}, ${b})`;
};

// Smoothstep easing
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

// Get a random point inside a circle
export const randomPointInCircle = (cx: number, cy: number, radius: number): Vec2 => {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number): T => {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
};

// Color with alpha
export const colorWithAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Environment suitability score for a species
export const getEnvScore = (
  value: number,
  preferredRange: [number, number],
  hardMin: number,
  hardMax: number
): number => {
  if (value < hardMin || value > hardMax) return 0;
  const [min, max] = preferredRange;
  if (value >= min && value <= max) return 1;
  if (value < min) return (value - hardMin) / (min - hardMin);
  return (hardMax - value) / (hardMax - max);
};
