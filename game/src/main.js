// Boots Twin Frames: sizes the canvas to the window, runs the frame loop, and wires the input. With ?shot=<name>
// it draws one fixed scene of the game instead (shots.js) for the screenshots.
import { VIEW } from './config.js';
import { createGame, updateGame } from './game.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { buildShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : Math.floor(Math.random() * 1e6) + 1;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

/** Fits the 1280x720 logical view in the window, letterboxed, sharp on high-density screens. */
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  scale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
  offsetX = (canvas.width - VIEW.width * scale) / 2;
  offsetY = (canvas.height - VIEW.height * scale) / 2;
}

function toLogical(clientX, clientY) {
  const dpr = window.devicePixelRatio || 1;
  return { x: (clientX * dpr - offsetX) / scale, y: (clientY * dpr - offsetY) / scale };
}

function draw(game) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#11101a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  render(ctx, game);
}

resize();
const shot = params.get('shot');
const game = shot ? buildShot(shot, seed) : createGame(seed);
// Resizing clears the canvas, so a still shot is drawn again; a live game redraws on its next frame anyway.
window.addEventListener('resize', () => {
  resize();
  draw(game);
});

if (shot) {
  draw(game);
  document.body.dataset.ready = 'true';
} else {
  const steer = attachInput(canvas, game, toLogical);
  let last = performance.now();
  let announced = '';
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    steer(dt);
    updateGame(game, dt);
    draw(game);
    const line = `${game.level.def.name}: ${game.level.differences.filter((d) => !d.found).length} differences left, score ${game.score}`;
    if (line !== announced) {
      status.textContent = line;
      announced = line;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
