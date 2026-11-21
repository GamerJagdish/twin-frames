// Mouse and keyboard: turns window events into the game's actions, in logical canvas units.
import { clickAt, moveCursor, pressKey, SCREEN_CLEAR, SCREEN_OVER, SCREEN_TITLE, SCREEN_WON, startLevel, startRun } from './game.js';

const CURSOR_SPEED = 420;
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

export function attachInput(canvas, game, toLogical) {
  const held = new Set();
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toLogical(event.clientX, event.clientY);
    if (game.screen === SCREEN_TITLE || game.screen === SCREEN_OVER || game.screen === SCREEN_WON) startRun(game);
    else if (game.screen === SCREEN_CLEAR) startLevel(game, game.levelIndex + 1);
    else clickAt(game, x, y);
  });
  window.addEventListener('keydown', (event) => {
    if (ARROWS[event.key]) {
      held.add(event.key);
      event.preventDefault();
      return;
    }
    if (event.key === ' ') event.preventDefault();
    if (!event.repeat) pressKey(game, event.key);
  });
  window.addEventListener('keyup', (event) => held.delete(event.key));
  window.addEventListener('blur', () => held.clear());
  /** Called each frame: glides the keyboard cursor while arrow keys are held. */
  return function steer(dt) {
    let dx = 0;
    let dy = 0;
    for (const key of held) {
      dx += ARROWS[key][0];
      dy += ARROWS[key][1];
    }
    if (dx || dy) moveCursor(game, dx * CURSOR_SPEED * dt, dy * CURSOR_SPEED * dt);
  };
}
