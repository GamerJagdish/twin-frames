// The scenes: for each theme, a backdrop drawn the same in both pictures, and the objects placed over it.
// A scene is built from a seed alone, so the same level and seed always give the same picture.
import { PANEL } from './config.js';
import { KINDS } from './art.js';

const W = PANEL.width;
const H = PANEL.height;

function gradient(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((color, i) => g.addColorStop(i / (stops.length - 1), color));
  return g;
}

/** Each theme: its backdrop, the objects it places (kind, how many, where), and the small kinds a difference may add. */
export const THEMES = {
  harbour: {
    backdrop(ctx) {
      ctx.fillStyle = gradient(ctx, 0, 240, ['#3d2c6b', '#b9496e', '#ff9e5e']);
      ctx.fillRect(0, 0, W, 240);
      ctx.beginPath();
      ctx.arc(330, 236, 54, Math.PI, 0);
      ctx.fillStyle = '#ffd27a';
      ctx.fill();
      ctx.fillStyle = gradient(ctx, 236, H, ['#2f5d8a', '#1d3c63', '#142a47']);
      ctx.fillRect(0, 236, W, H - 236);
      for (let i = 0; i < 9; i += 1) {
        ctx.fillStyle = 'rgba(255, 210, 122, 0.35)';
        ctx.fillRect(300 - i * 4, 246 + i * 12, 60 + i * 8, 3);
      }
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.quadraticCurveTo(150, 170, 300, 240);
      ctx.fillStyle = '#3d5a40';
      ctx.fill();
      ctx.fillStyle = '#6f4429';
      ctx.fillRect(360, 412, 240, 14);
      for (let x = 372; x < W; x += 44) ctx.fillRect(x, 426, 8, 14);
    },
    spawns: [
      { kind: 'cloud', count: 3, x: [0, W], y: [50, 120] },
      { kind: 'gull', count: 3, x: [0, W], y: [70, 180] },
      { kind: 'lighthouse', count: 1, x: [470, 580], y: [238, 240] },
      { kind: 'house', count: 3, x: [20, 280], y: [214, 234] },
      { kind: 'boat', count: 3, x: [0, 360], y: [300, 400] },
      { kind: 'buoy', count: 3, x: [0, W], y: [276, 400] },
      { kind: 'crate', count: 3, x: [370, 590], y: [412, 412] },
      { kind: 'fish', count: 2, x: [0, 350], y: [380, 432] },
    ],
    extras: ['gull', 'buoy', 'fish', 'crate'],
  },
  meadow: {
    backdrop(ctx) {
      ctx.fillStyle = gradient(ctx, 0, 260, ['#7cc7ff', '#bfe6ff', '#fff4d6']);
      ctx.fillRect(0, 0, W, 260);
      const ridge = (points, fill) => {
        ctx.beginPath();
        ctx.moveTo(0, 260);
        for (let i = 0; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
        ctx.lineTo(W, 260);
        ctx.fillStyle = fill;
        ctx.fill();
      };
      ridge([60, 120, 160, 200, 260, 90, 380, 210, 470, 110, 600, 190], '#8aa0c8');
      ridge([0, 220, 120, 170, 240, 230, 360, 160, 520, 230, 600, 200], '#6c86b0');
      ctx.fillStyle = '#f7f3e3';
      for (const [x, y] of [[260, 90], [470, 110]]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 22, y + 24);
        ctx.lineTo(x + 20, y + 26);
        ctx.fill();
      }
      ctx.fillStyle = gradient(ctx, 240, H, ['#8fcf6a', '#5fa64a', '#3f7d3a']);
      ctx.fillRect(0, 240, W, H - 240);
    },
    spawns: [
      { kind: 'cloud', count: 2, x: [0, W], y: [40, 100] },
      { kind: 'balloon', count: 1, x: [40, 560], y: [110, 170] },
      { kind: 'pine', count: 4, x: [0, W], y: [250, 300] },
      { kind: 'cabin', count: 1, x: [140, 460], y: [290, 310] },
      { kind: 'fence', count: 2, x: [0, W], y: [330, 390] },
      { kind: 'sheep', count: 3, x: [0, W], y: [330, 420] },
      { kind: 'flower', count: 6, x: [0, W], y: [340, 436] },
      { kind: 'mushroom', count: 3, x: [0, W], y: [370, 436] },
      { kind: 'butterfly', count: 3, x: [0, W], y: [200, 360] },
    ],
    extras: ['flower', 'mushroom', 'butterfly', 'sheep'],
  },
  market: {
    backdrop(ctx) {
      ctx.fillStyle = gradient(ctx, 0, 300, ['#0d0b26', '#24204f', '#463a73']);
      ctx.fillRect(0, 0, W, 300);
      ctx.beginPath();
      ctx.arc(500, 70, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#fff3c4';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(512, 62, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#1d1844';
      ctx.fill();
      for (let i = 0; i < 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 60 + i * 50);
        ctx.quadraticCurveTo(W / 2, 120 + i * 50, W, 60 + i * 50);
        ctx.strokeStyle = 'rgba(255, 236, 190, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = gradient(ctx, 296, H, ['#4a3b52', '#3a2e40', '#2a2130']);
      ctx.fillRect(0, 296, W, H - 296);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 2;
      for (let y = 316; y < H; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    },
    spawns: [
      { kind: 'star', count: 7, x: [0, 440], y: [16, 60] },
      { kind: 'lantern', count: 5, x: [20, 580], y: [100, 150] },
      { kind: 'stall', count: 3, x: [0, W], y: [318, 330] },
      { kind: 'sign', count: 2, x: [0, W], y: [350, 420] },
      { kind: 'fruit', count: 3, x: [0, W], y: [360, 436] },
      { kind: 'crate', count: 3, x: [0, W], y: [380, 436] },
      { kind: 'cat', count: 1, x: [0, W], y: [400, 436] },
    ],
    extras: ['star', 'fruit', 'crate', 'lantern'],
  },
};

/** The box an object covers in panel units, from its kind's size, its scale and its anchor at the bottom centre. */
export function boundsOf(kind, v) {
  const [w, h] = KINDS[kind].size;
  return { x: v.x - (w * v.s) / 2, y: v.y - h * v.s, w: w * v.s, h: h * v.s };
}

export function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export function insidePanel(b) {
  return b.x >= 4 && b.y >= 4 && b.x + b.w <= W - 4 && b.y + b.h <= H - 2;
}

/** Tries to place one object of a kind in a range, clear of the ones placed already; null when there is no room. */
export function placeObject(rng, kind, spawn, placed, id) {
  const [w] = KINDS[kind].size;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const s = rng.range(0.85, 1.15);
    const half = (w * s) / 2;
    if (spawn.x[1] - spawn.x[0] < half * 2) return null;
    const v = { x: rng.range(spawn.x[0] + half, spawn.x[1] - half), y: rng.range(spawn.y[0], spawn.y[1]), s, flip: KINDS[kind].mirror && rng.chance(0.5) };
    const b = boundsOf(kind, v);
    if (!insidePanel(b)) continue;
    const crowded = placed.some((o) => {
      const ob = boundsOf(o.kind, o.left);
      return overlapArea(b, ob) > 0.2 * Math.min(b.w * b.h, ob.w * ob.h);
    });
    if (crowded) continue;
    v.c = KINDS[kind].palettes.map((p) => rng.pick(p));
    return { id, kind, left: v, right: { ...v, c: v.c.slice() } };
  }
  return null;
}

/** Builds a theme's objects from a seeded random source; both pictures start identical. */
export function buildScene(themeName, rng) {
  const theme = THEMES[themeName];
  const objects = [];
  for (const spawn of theme.spawns) {
    for (let i = 0; i < spawn.count; i += 1) {
      const object = placeObject(rng, spawn.kind, spawn, objects, objects.length);
      if (object) objects.push(object);
    }
  }
  return objects;
}
