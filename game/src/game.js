// The rules of a run: levels, finds, misses, hints, streaks and the clock. No drawing here: render.js reads this state.
import { LEVELS, PANEL, RULES, VIEW } from './config.js';
import { createRandom } from './random.js';
import { buildScene } from './scenes.js';
import { differenceAt, makeDifferences } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WON = 'won';

export function createGame(seed) {
  return {
    screen: SCREEN_TITLE,
    seed,
    levelIndex: 0,
    level: buildLevel(seed, 0),
    score: 0,
    hints: RULES.hintsPerRun,
    clock: 0,
    lastFindAt: -99,
    streak: 0,
    stats: { finds: 0, misses: 0 },
    misses: [],
    bursts: [],
    hint: null,
    shake: 0,
    paused: false,
    cursor: { x: VIEW.width / 2, y: PANEL.top + PANEL.height / 2, shownAt: -99 },
    summary: null,
  };
}

/** One level of a run, built from the run's seed and the level's place: its scene, its differences and its clock. */
export function buildLevel(seed, index) {
  const def = LEVELS[index];
  const rng = createRandom(seed * 7919 + index * 104729 + 17);
  const objects = buildScene(def.theme, rng);
  const differences = makeDifferences(rng, def.theme, objects, def.diffs, def.subtle);
  objects.sort((a, b) => a.left.y - b.left.y);
  return { def, objects, differences, timeLeft: def.time };
}

export function startLevel(game, index) {
  game.levelIndex = index;
  game.level = buildLevel(game.seed, index);
  game.screen = SCREEN_PLAY;
  game.misses = [];
  game.bursts = [];
  game.hint = null;
  game.streak = 0;
  game.lastFindAt = -99;
  game.summary = null;
  game.paused = false;
}

export function startRun(game) {
  game.score = 0;
  game.hints = RULES.hintsPerRun;
  game.stats = { finds: 0, misses: 0 };
  startLevel(game, 0);
}

export function remaining(game) {
  return game.level.differences.filter((d) => !d.found).length;
}

/** Which picture a canvas point falls in, and where in it; null outside both. */
export function panelPoint(x, y) {
  const py = y - PANEL.top;
  if (py < 0 || py > PANEL.height) return null;
  if (x >= PANEL.left && x <= PANEL.left + PANEL.width) return { side: 'left', px: x - PANEL.left, py };
  if (x >= PANEL.right && x <= PANEL.right + PANEL.width) return { side: 'right', px: x - PANEL.right, py };
  return null;
}

export function findDifference(game, difference) {
  difference.found = true;
  difference.foundAt = game.clock;
  game.streak = game.clock - game.lastFindAt <= RULES.streakWindow ? game.streak + 1 : 0;
  game.lastFindAt = game.clock;
  const points = RULES.findPoints + game.streak * RULES.streakPoints;
  game.score += points;
  game.stats.finds += 1;
  game.bursts.push({ box: difference.box, points, streak: game.streak, t: game.clock });
  if (game.hint && game.hint.difference === difference) game.hint = null;
  if (remaining(game) === 0) clearLevel(game);
}

export function missAt(game, point) {
  game.level.timeLeft = Math.max(0, game.level.timeLeft - RULES.missPenalty);
  game.misses.push({ ...point, t: game.clock });
  game.stats.misses += 1;
  game.streak = 0;
  game.shake = 0.35;
}

/** A click (or Enter at the keyboard cursor) on the canvas, in logical units. */
export function clickAt(game, x, y) {
  if (game.screen !== SCREEN_PLAY || game.paused) return;
  const point = panelPoint(x, y);
  if (!point) return;
  const difference = differenceAt(game.level.differences, point.px, point.py);
  if (difference) findDifference(game, difference);
  else missAt(game, point);
}

/** Rings an area around one unfound difference for a few seconds: near it, never exactly on it. */
export function useHint(game) {
  if (game.screen !== SCREEN_PLAY || game.paused || game.hints <= 0 || game.hint) return false;
  const difference = game.level.differences.find((d) => !d.found);
  if (!difference) return false;
  game.hints -= 1;
  const offset = ((difference.id % 3) - 1) * 22;
  game.hint = {
    difference,
    x: difference.box.x + difference.box.w / 2 + offset,
    y: difference.box.y + difference.box.h / 2 - offset / 2,
    r: Math.max(difference.box.w, difference.box.h) / 2 + 46,
    t: game.clock,
  };
  return true;
}

function clearLevel(game) {
  const seconds = Math.floor(game.level.timeLeft);
  const bonus = seconds * RULES.timeBonus;
  game.score += bonus;
  const clicks = game.stats.finds + game.stats.misses;
  game.summary = {
    seconds,
    bonus,
    accuracy: clicks ? Math.round((game.stats.finds / clicks) * 100) : 100,
  };
  game.screen = game.levelIndex === LEVELS.length - 1 ? SCREEN_WON : SCREEN_CLEAR;
}

/** Moves the run on by dt seconds: the clock, the hint, and the effects fading out. */
export function updateGame(game, dt) {
  game.clock += dt;
  game.shake = Math.max(0, game.shake - dt);
  game.misses = game.misses.filter((m) => game.clock - m.t < 1.4);
  game.bursts = game.bursts.filter((b) => game.clock - b.t < 1.2);
  if (game.screen !== SCREEN_PLAY || game.paused) return;
  game.level.timeLeft -= dt;
  if (game.hint && game.clock - game.hint.t > RULES.hintSeconds) game.hint = null;
  if (game.level.timeLeft <= 0) {
    game.level.timeLeft = 0;
    game.hint = null;
    game.screen = SCREEN_OVER;
  }
}

/** The keyboard: Enter or Space starts, goes on and taps at the cursor; H hint, P pause, R restart. */
export function pressKey(game, key) {
  if (key === 'Enter' || key === ' ') {
    if (game.screen === SCREEN_TITLE || game.screen === SCREEN_OVER || game.screen === SCREEN_WON) startRun(game);
    else if (game.screen === SCREEN_CLEAR) startLevel(game, game.levelIndex + 1);
    else clickAt(game, game.cursor.x, game.cursor.y);
  } else if (key === 'h' || key === 'H') useHint(game);
  else if ((key === 'p' || key === 'P') && game.screen === SCREEN_PLAY) game.paused = !game.paused;
  else if (key === 'r' || key === 'R') startRun(game);
}

/** Moves the keyboard cursor, kept inside the two pictures. */
export function moveCursor(game, dx, dy) {
  const c = game.cursor;
  c.x = Math.min(PANEL.right + PANEL.width - 2, Math.max(PANEL.left + 2, c.x + dx));
  c.y = Math.min(PANEL.top + PANEL.height - 2, Math.max(PANEL.top + 2, c.y + dy));
  c.shownAt = game.clock;
}
