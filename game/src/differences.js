// The differences: picks objects that sit apart from one another and changes each in one picture, so every
// difference is a fair find. Later levels choose subtler changes: smaller moves, smaller size changes.
import { PANEL, RULES } from './config.js';
import { KINDS } from './art.js';
import { boundsOf, insidePanel, overlapArea, placeObject, THEMES } from './scenes.js';

/** The ways a difference can change an object, the obvious ones first. */
const CHANGES = ['remove', 'add', 'recolor', 'resize', 'flip', 'move'];

function weightsFor(subtle) {
  return {
    remove: Math.max(1, 4 - subtle),
    add: Math.max(1, 4 - subtle),
    recolor: 3,
    resize: 2,
    flip: 2,
    move: 1 + subtle,
  };
}

function chooseChange(rng, subtle) {
  const weights = weightsFor(subtle);
  const total = CHANGES.reduce((sum, c) => sum + weights[c], 0);
  let roll = rng.next() * total;
  for (const change of CHANGES) {
    roll -= weights[change];
    if (roll < 0) return change;
  }
  return 'recolor';
}

function recolor(rng, object) {
  const palettes = KINDS[object.kind].palettes;
  const options = palettes.map((p, i) => i).filter((i) => palettes[i].length > 1);
  if (!options.length) return false;
  const i = rng.pick(options);
  const others = palettes[i].filter((color) => color !== object.right.c[i]);
  object.right.c[i] = rng.pick(others);
  return true;
}

/** Applies one change to an object's right-hand picture; false when the change does not fit this object. */
function applyChange(rng, object, change, subtle) {
  const big = KINDS[object.kind].size[0] * KINDS[object.kind].size[1] > 6000;
  if (big && change !== 'recolor') return recolor(rng, object);
  const r = object.right;
  if (change === 'remove') {
    r.hidden = true;
    return true;
  }
  if (change === 'recolor') return recolor(rng, object);
  if (change === 'flip') {
    if (!KINDS[object.kind].mirror) return false;
    r.flip = !r.flip;
    return true;
  }
  if (change === 'resize') {
    r.s = object.left.s * (1.45 - subtle * 0.04);
    return insidePanel(boundsOf(object.kind, r));
  }
  if (change === 'move') {
    const step = Math.max(14, 34 - subtle * 3) * (rng.chance(0.5) ? 1 : -1);
    r.x = object.left.x + step;
    return insidePanel(boundsOf(object.kind, r));
  }
  return false;
}

/** The click box of a difference: both pictures' boxes together, never smaller than RULES.minHit. */
function hitBox(object) {
  const boxes = [object.left, object.right].filter((v) => !v.hidden).map((v) => boundsOf(object.kind, v));
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));
  const w = Math.max(RULES.minHit, x1 - x0);
  const h = Math.max(RULES.minHit, y1 - y0);
  return {
    x: Math.max(0, (x0 + x1) / 2 - w / 2),
    y: Math.max(0, (y0 + y1) / 2 - h / 2),
    w: Math.min(w, PANEL.width),
    h: Math.min(h, PANEL.height),
  };
}

function clearOf(box, chosen) {
  return chosen.every((d) => overlapArea(box, d.box) === 0);
}

/** Changes `count` objects of the scene (adding new ones where the copy gains an object) and returns the differences. */
export function makeDifferences(rng, themeName, objects, count, subtle) {
  const differences = [];
  for (const object of rng.shuffle(objects)) {
    if (differences.length >= count) break;
    const change = chooseChange(rng, subtle);
    if (change === 'add') {
      const kind = rng.pick(THEMES[themeName].extras);
      const spawn = THEMES[themeName].spawns.find((s) => s.kind === kind) ?? { x: [0, PANEL.width], y: [200, 430] };
      const added = placeObject(rng, kind, spawn, objects, objects.length);
      if (!added) continue;
      added.left.hidden = true;
      const box = hitBox(added);
      if (!clearOf(box, differences)) continue;
      objects.push(added);
      differences.push({ id: added.id, change: 'add', box, found: false, foundAt: 0 });
      continue;
    }
    const before = JSON.stringify(object.right);
    if (!applyChange(rng, object, change, subtle)) {
      object.right = JSON.parse(before);
      continue;
    }
    const box = hitBox(object);
    if (!clearOf(box, differences)) {
      object.right = JSON.parse(before);
      continue;
    }
    differences.push({ id: object.id, change, box, found: false, foundAt: 0 });
  }
  return differences;
}

/** The difference under a point of either picture (panel units), unfound ones only; null on a miss. */
export function differenceAt(differences, x, y) {
  const pad = RULES.hitPad;
  return (
    differences.find((d) => !d.found && x >= d.box.x - pad && x <= d.box.x + d.box.w + pad && y >= d.box.y - pad && y <= d.box.y + d.box.h + pad) ??
    null
  );
}
