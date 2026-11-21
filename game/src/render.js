// Draws a frame of the game from its state, in logical units (config.VIEW): the two pictures with their markers,
// the counter, the clock, the score and hints, and the title, clear, game-over and pause cards.
import { COLORS, LEVELS, PANEL, RULES, VIEW } from './config.js';
import { drawObject } from './art.js';
import { THEMES } from './scenes.js';
import { remaining, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './game.js';

const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

function text(ctx, value, x, y, size, color, align = 'left', weight = '700') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The ring a found difference wears in both pictures, popping in when found. */
function drawFoundMarker(ctx, difference, clock) {
  const age = clock - difference.foundAt;
  const pop = age < 0.25 ? 1.35 - age * 1.4 : 1;
  const { x, y, w, h } = difference.box;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(pop, pop);
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2 + 10, h / 2 + 10, 0, 0, Math.PI * 2);
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(10, 30, 20, 0.55)';
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.found;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2 + 6, -h / 2 - 6, 11, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.found;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w / 2 + 1, -h / 2 - 6);
  ctx.lineTo(w / 2 + 5, -h / 2 - 2);
  ctx.lineTo(w / 2 + 12, -h / 2 - 11);
  ctx.strokeStyle = '#0f2a1d';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/** The dashed ring the game shows on a lost level around each difference left unfound. */
function drawMissedMarker(ctx, difference) {
  const { x, y, w, h } = difference.box;
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 + 10, h / 2 + 10, 0, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.miss;
  ctx.stroke();
  ctx.restore();
}

function drawHintRing(ctx, hint, clock) {
  const pulse = 1 + Math.sin((clock - hint.t) * 7) * 0.06;
  ctx.save();
  ctx.setLineDash([12, 8]);
  ctx.lineDashOffset = -(clock - hint.t) * 40;
  ctx.beginPath();
  ctx.arc(hint.x, hint.y, hint.r * pulse, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.hint;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 209, 102, 0.12)';
  ctx.fill();
  ctx.restore();
}

function drawMissCross(ctx, miss, clock) {
  const age = clock - miss.t;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - age / 1.4);
  ctx.translate(miss.px, miss.py);
  ctx.strokeStyle = COLORS.miss;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, -11);
  ctx.lineTo(11, 11);
  ctx.moveTo(11, -11);
  ctx.lineTo(-11, 11);
  ctx.stroke();
  text(ctx, `-${RULES.missPenalty}s`, 0, -24 - age * 20, 16, COLORS.miss, 'center');
  ctx.restore();
}

function drawBurst(ctx, burst, clock) {
  const age = clock - burst.t;
  const cx = burst.box.x + burst.box.w / 2;
  const cy = burst.box.y + burst.box.h / 2;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - age / 1.2);
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const r = 20 + age * 120;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4 - age * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? COLORS.found : COLORS.hint;
    ctx.fill();
  }
  const label = burst.streak > 0 ? `+${burst.points}  streak x${burst.streak + 1}` : `+${burst.points}`;
  text(ctx, label, cx, cy - burst.box.h / 2 - 22 - age * 30, 20, '#ffffff', 'center', '800');
  ctx.restore();
}

/** One picture: the backdrop, its objects as this side has them, then the markers on top. */
function drawPanel(ctx, game, side) {
  const level = game.level;
  const x = side === 'left' ? PANEL.left : PANEL.right;
  const shake = game.shake > 0 ? Math.sin(game.clock * 80) * game.shake * 14 : 0;
  ctx.save();
  ctx.translate(x + shake, PANEL.top);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  roundRect(ctx, 6, 10, PANEL.width, PANEL.height, 14);
  ctx.fill();
  roundRect(ctx, 0, 0, PANEL.width, PANEL.height, 14);
  ctx.save();
  ctx.clip();
  THEMES[level.def.theme].backdrop(ctx);
  for (const object of level.objects) {
    const variant = side === 'left' ? object.left : object.right;
    if (!variant.hidden) drawObject(ctx, object, variant);
  }
  for (const difference of level.differences) {
    if (difference.found) drawFoundMarker(ctx, difference, game.clock);
    else if (game.screen === SCREEN_OVER) drawMissedMarker(ctx, difference);
  }
  if (game.hint) drawHintRing(ctx, game.hint, game.clock);
  for (const miss of game.misses) if (miss.side === side) drawMissCross(ctx, miss, game.clock);
  for (const burst of game.bursts) drawBurst(ctx, burst, game.clock);
  ctx.restore();
  roundRect(ctx, 0, 0, PANEL.width, PANEL.height, 14);
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.frame;
  ctx.stroke();
  roundRect(ctx, 14, -14, 110, 28, 8);
  ctx.fillStyle = side === 'left' ? COLORS.accent : COLORS.hint;
  ctx.fill();
  text(ctx, side === 'left' ? 'ORIGINAL' : 'THE COPY', 69, 0, 14, '#1b1a24', 'center', '800');
  ctx.restore();
}

/** The counter: how many differences are left, as a number and a row of pips. */
function drawCounter(ctx, game) {
  const total = game.level.differences.length;
  const left = remaining(game);
  const cx = VIEW.width / 2;
  roundRect(ctx, cx - 150, 18, 300, 84, 18);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  text(ctx, `${left}`, cx - 70, 52, 50, left ? COLORS.hint : COLORS.found, 'center', '900');
  text(ctx, left === 1 ? 'DIFFERENCE LEFT' : 'DIFFERENCES LEFT', cx + 30, 42, 15, COLORS.ink, 'center', '800');
  const pipGap = Math.min(24, 180 / total);
  const start = cx + 30 - ((total - 1) * pipGap) / 2;
  for (let i = 0; i < total; i += 1) {
    ctx.beginPath();
    ctx.arc(start + i * pipGap, 68, 7, 0, Math.PI * 2);
    ctx.fillStyle = i < total - left ? COLORS.found : 'rgba(255, 255, 255, 0.18)';
    ctx.fill();
  }
  text(ctx, `Level ${game.levelIndex + 1} of ${LEVELS.length}`, cx, 92, 12, COLORS.dim, 'center', '700');
}

/** The clock, a bar across the top that drains, turning red and pulsing in the last seconds. */
function drawClock(ctx, game) {
  const { timeLeft, def } = game.level;
  const share = Math.max(0, timeLeft / def.time);
  const hurry = timeLeft <= RULES.hurrySeconds;
  const x = PANEL.left;
  const w = PANEL.right + PANEL.width - PANEL.left;
  roundRect(ctx, x, 116, w, 14, 7);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  const pulse = hurry ? 0.75 + Math.abs(Math.sin(game.clock * 6)) * 0.25 : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  roundRect(ctx, x, 116, Math.max(14, w * share), 14, 7);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, hurry ? COLORS.miss : COLORS.found);
  g.addColorStop(1, hurry ? COLORS.hurry : COLORS.accent);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  text(ctx, `${Math.ceil(timeLeft)}s`, x + w - 6, 104, hurry ? 22 : 18, hurry ? COLORS.miss : COLORS.ink, 'right', '900');
}

function drawHeader(ctx, game) {
  text(ctx, 'TWIN', PANEL.left, 42, 34, COLORS.accent, 'left', '900');
  text(ctx, 'FRAMES', PANEL.left + 92, 42, 34, COLORS.hint, 'left', '900');
  text(ctx, game.level.def.name, PANEL.left, 80, 18, COLORS.ink, 'left', '700');
  const rx = PANEL.right + PANEL.width;
  text(ctx, `${game.score}`, rx, 42, 32, COLORS.ink, 'right', '900');
  text(ctx, 'SCORE', rx - 6 - ctx.measureText(`${game.score}`).width - 8, 46, 13, COLORS.dim, 'right', '800');
  for (let i = 0; i < RULES.hintsPerRun; i += 1) {
    const hx = rx - 10 - i * 26;
    ctx.beginPath();
    ctx.arc(hx, 80, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < game.hints ? COLORS.hint : 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    text(ctx, '?', hx, 81, 12, '#1b1a24', 'center', '900');
  }
  text(ctx, 'HINTS (H)', rx - 10 - RULES.hintsPerRun * 26, 81, 13, COLORS.dim, 'right', '800');
}

function drawFooter(ctx, game) {
  const streak = game.screen === SCREEN_PLAY && game.streak > 0 && game.clock - game.lastFindAt < RULES.streakWindow;
  const message = streak
    ? `Streak x${game.streak + 1}! Find the next one within ${RULES.streakWindow}s for a bigger bonus`
    : 'Click a difference in either picture   ·   Arrows + Enter to search by keyboard   ·   H hint   ·   P pause';
  text(ctx, message, VIEW.width / 2, 628, 16, streak ? COLORS.hint : COLORS.dim, 'center', '700');
}

function drawCursor(ctx, game) {
  if (game.clock - game.cursor.shownAt > 3 || game.screen !== SCREEN_PLAY) return;
  const { x, y } = game.cursor;
  for (const offset of [0, PANEL.right - PANEL.left]) {
    const cx = x < PANEL.right ? x + offset : x - offset;
    ctx.save();
    ctx.globalAlpha = offset ? 0.45 : 1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, y, 16, 0, Math.PI * 2);
    ctx.moveTo(cx - 24, y);
    ctx.lineTo(cx - 8, y);
    ctx.moveTo(cx + 8, y);
    ctx.lineTo(cx + 24, y);
    ctx.moveTo(cx, y - 24);
    ctx.lineTo(cx, y - 8);
    ctx.moveTo(cx, y + 8);
    ctx.lineTo(cx, y + 24);
    ctx.stroke();
    ctx.restore();
  }
}

/** A card over the pictures: a title, lines beneath it and a prompt. */
function drawCard(ctx, title, color, lines, prompt) {
  ctx.fillStyle = 'rgba(14, 13, 22, 0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const w = 560;
  const h = 150 + lines.length * 34;
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2;
  roundRect(ctx, x, y, w, h, 22);
  ctx.fillStyle = '#26243a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
  text(ctx, title, VIEW.width / 2, y + 52, 40, color, 'center', '900');
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, y + 102 + i * 34, 20, COLORS.ink, 'center', '700'));
  text(ctx, prompt, VIEW.width / 2, y + h - 30, 17, COLORS.dim, 'center', '800');
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(14, 13, 22, 0.7)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'TWIN', VIEW.width / 2 - 120, 250, 96, COLORS.accent, 'center', '900');
  text(ctx, 'FRAMES', VIEW.width / 2 + 150, 250, 96, COLORS.hint, 'center', '900');
  text(ctx, 'Two pictures. One is a copy with a few things changed. Find every change before the clock runs out.', VIEW.width / 2, 330, 20, COLORS.ink, 'center', '700');
  const steps = [
    ['Click', 'a change in either picture'],
    ['-4s', 'for a click on nothing'],
    ['H', 'rings the area of one change'],
    ['Streak', 'quick finds score more'],
  ];
  steps.forEach(([key, what], i) => {
    const x = VIEW.width / 2 - 450 + i * 240;
    roundRect(ctx, x, 380, 180, 90, 16);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    text(ctx, key, x + 90, 410, 26, i % 2 ? COLORS.hint : COLORS.found, 'center', '900');
    text(ctx, what, x + 90, 446, 14, COLORS.ink, 'center', '700');
  });
  text(ctx, `${LEVELS.length} scenes: harbour, meadow and night market, each with more and subtler changes`, VIEW.width / 2, 510, 16, COLORS.dim, 'center', '700');
  text(ctx, 'Click or press Enter to start', VIEW.width / 2, 570, 24, '#ffffff', 'center', '900');
}

export function render(ctx, game) {
  ctx.fillStyle = COLORS.backdrop;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const glow = ctx.createRadialGradient(VIEW.width / 2, 380, 100, VIEW.width / 2, 380, 760);
  glow.addColorStop(0, '#2a2840');
  glow.addColorStop(1, COLORS.backdrop);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawHeader(ctx, game);
  drawCounter(ctx, game);
  drawClock(ctx, game);
  drawPanel(ctx, game, 'left');
  drawPanel(ctx, game, 'right');
  drawFooter(ctx, game);
  drawCursor(ctx, game);
  if (game.screen === SCREEN_TITLE) drawTitle(ctx);
  else if (game.screen === SCREEN_CLEAR) {
    const s = game.summary;
    drawCard(ctx, 'Level clear!', COLORS.found, [`Time bonus: ${s.seconds}s x ${RULES.timeBonus} = +${s.bonus}`, `Accuracy: ${s.accuracy}%`, `Next: ${LEVELS[game.levelIndex + 1].name}`], 'Click or press Enter for the next scene');
  } else if (game.screen === SCREEN_OVER) {
    drawCard(ctx, "Time's up", COLORS.miss, [`${remaining(game)} differences got away (ringed in red)`, `Final score: ${game.score}`], 'Click or press Enter to try again');
  } else if (game.screen === SCREEN_WON) {
    drawCard(ctx, 'Every frame solved!', COLORS.hint, [`Final score: ${game.score}`, `Accuracy: ${game.summary.accuracy}%`], 'Click or press Enter to play again');
  } else if (game.paused) {
    drawCard(ctx, 'Paused', COLORS.accent, ['The clock is stopped.'], 'Press P to carry on');
  }
}
