// The screenshot scenes behind ?shot=play|hint|title|clear: each plays the real rules from a fresh run, finding
// differences through the same calls a click makes, so the frame is a true state of the game for a given seed.
import { clickAt, createGame, findDifference, missAt, startLevel, startRun, updateGame, useHint } from './game.js';
import { PANEL } from './config.js';

function advance(game, seconds) {
  for (let t = 0; t < seconds; t += 0.05) updateGame(game, 0.05);
}

function clickDifference(game, difference) {
  const side = difference.id % 2 ? PANEL.right : PANEL.left;
  clickAt(game, side + difference.box.x + difference.box.w / 2, PANEL.top + difference.box.y + difference.box.h / 2);
}

export function buildShot(name, seed) {
  const game = createGame(seed);
  if (name === 'title') return game;
  startRun(game);
  if (name === 'play') {
    startLevel(game, 1);
    const [a, b, c] = game.level.differences;
    advance(game, 9);
    clickDifference(game, a);
    advance(game, 7);
    clickDifference(game, b);
    advance(game, 3);
    clickDifference(game, c);
    advance(game, 0.3);
    missAt(game, { side: 'right', px: 300, py: 210 });
    advance(game, 0.35);
    return game;
  }
  if (name === 'hint') {
    startLevel(game, 2);
    const [a, b] = game.level.differences;
    advance(game, 20);
    clickDifference(game, a);
    advance(game, 25);
    clickDifference(game, b);
    advance(game, 23);
    useHint(game);
    advance(game, 0.6);
    return game;
  }
  if (name === 'clear') {
    advance(game, 4);
    for (const difference of game.level.differences.slice()) {
      advance(game, 3.2);
      if (!difference.found) findDifference(game, difference);
    }
    advance(game, 1.5);
    return game;
  }
  return game;
}
