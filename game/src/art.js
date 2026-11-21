// The scene objects, drawn with canvas shapes only. Each kind has a size (width and height at scale 1, anchored at
// its bottom centre), the palettes its colours come from, and a draw function that paints it at the origin.
// A difference changes an object's colours, scale, position, mirroring or presence, never these functions.

const TAU = Math.PI * 2;

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function disc(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function oval(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function box(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** Shared palettes: a recolour swaps a colour for another of the same palette, so it is fair but not glaring. */
const WARM = ['#e4572e', '#f3a712', '#e8c547', '#c1440e', '#ff8c61'];
const COOL = ['#2e86ab', '#3a7d44', '#6a4c93', '#1b998b', '#4361ee'];
const SOFT = ['#f7f3e3', '#ffd6e0', '#cdeac0', '#d0e1f9', '#fde2b8'];
const WOOD = ['#8d5b3a', '#6f4429', '#a9744f', '#5c3b25'];

export const KINDS = {
  boat: {
    size: [96, 86], palettes: [COOL, SOFT, WARM], mirror: true,
    draw(ctx, c) {
      poly(ctx, [-46, -22, 46, -22, 32, 0, -30, 0], c[0]);
      box(ctx, -46, -26, 92, 5, '#f4efe6');
      line(ctx, 0, -24, 0, -84, '#3b2f2f', 3);
      poly(ctx, [3, -82, 3, -30, 38, -30], c[1]);
      poly(ctx, [-3, -74, -3, -32, -26, -32], c[1]);
      poly(ctx, [0, -84, 16, -79, 0, -74], c[2]);
    },
  },
  lighthouse: {
    size: [44, 160], palettes: [WARM, ['#ffe066', '#9be7ff', '#ff9f1c']], mirror: false,
    draw(ctx, c) {
      poly(ctx, [-20, 0, 20, 0, 13, -118, -13, -118], '#f4efe6');
      for (let i = 0; i < 3; i += 1) poly(ctx, [-19 + i * 2.3, -18 - i * 36, 19 - i * 2.3, -18 - i * 36, 17.5 - i * 2.3, -36 - i * 36, -17.5 + i * 2.3, -36 - i * 36], c[0]);
      box(ctx, -16, -122, 32, 6, '#2d2a32');
      box(ctx, -11, -140, 22, 18, c[1]);
      poly(ctx, [-15, -140, 15, -140, 0, -158], '#2d2a32');
    },
  },
  house: {
    size: [74, 76], palettes: [SOFT, WARM, COOL], mirror: true,
    draw(ctx, c) {
      box(ctx, -32, -46, 64, 46, c[0]);
      poly(ctx, [-38, -44, 38, -44, 0, -76], c[1]);
      box(ctx, -24, -24, 14, 24, c[2]);
      box(ctx, 6, -36, 18, 14, '#ffe9a8');
      line(ctx, 15, -36, 15, -22, '#3b2f2f', 2);
    },
  },
  buoy: {
    size: [22, 30], palettes: [WARM], mirror: false,
    draw(ctx, c) {
      oval(ctx, 0, -12, 11, 12, c[0]);
      box(ctx, -11, -15, 22, 5, '#f4efe6');
      line(ctx, 0, -24, 0, -30, '#2d2a32', 2);
    },
  },
  gull: {
    size: [34, 14], palettes: [['#f4efe6', '#2d2a32', '#c9c9c9']], mirror: true,
    draw(ctx, c) {
      ctx.beginPath();
      ctx.moveTo(-17, -10);
      ctx.quadraticCurveTo(-8, -16, 0, -4);
      ctx.quadraticCurveTo(8, -16, 17, -12);
      ctx.strokeStyle = c[0];
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    },
  },
  cloud: {
    size: [100, 40], palettes: [['#fbe7d4', '#f4efe6', '#e7d3e8', '#ffd9c2']], mirror: true,
    draw(ctx, c) {
      disc(ctx, -28, -14, 14, c[0]);
      disc(ctx, -6, -22, 20, c[0]);
      disc(ctx, 20, -16, 16, c[0]);
      box(ctx, -40, -14, 76, 14, c[0]);
    },
  },
  crate: {
    size: [32, 30], palettes: [WOOD], mirror: false,
    draw(ctx, c) {
      box(ctx, -16, -30, 32, 30, c[0]);
      ctx.strokeStyle = '#3b2615';
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -29, 30, 28);
      line(ctx, -15, -29, 15, -1, '#3b2615', 2);
    },
  },
  fish: {
    size: [34, 16], palettes: [WARM, COOL], mirror: true,
    draw(ctx, c) {
      oval(ctx, -2, -8, 13, 7, c[0]);
      poly(ctx, [10, -8, 18, -15, 18, -1], c[1]);
      disc(ctx, -9, -9, 1.8, '#1b1a24');
    },
  },
  pine: {
    size: [50, 100], palettes: [['#2f6b3a', '#245a35', '#3e7d3a', '#1f4d3a']], mirror: false,
    draw(ctx, c) {
      box(ctx, -5, -16, 10, 16, '#6f4429');
      poly(ctx, [-25, -16, 25, -16, 0, -52], c[0]);
      poly(ctx, [-20, -40, 20, -40, 0, -76], c[0]);
      poly(ctx, [-14, -64, 14, -64, 0, -100], c[0]);
    },
  },
  cabin: {
    size: [100, 92], palettes: [WOOD, WARM, COOL], mirror: true,
    draw(ctx, c) {
      box(ctx, 24, -86, 12, 30, '#7a6a5f');
      box(ctx, -44, -50, 88, 50, c[0]);
      for (let y = -42; y < 0; y += 10) line(ctx, -44, y, 44, y, 'rgba(0,0,0,0.18)', 2);
      poly(ctx, [-52, -48, 52, -48, 0, -84], c[1]);
      box(ctx, -12, -30, 22, 30, c[2]);
      box(ctx, 20, -38, 16, 14, '#ffe9a8');
      box(ctx, -36, -38, 16, 14, '#ffe9a8');
    },
  },
  flower: {
    size: [18, 34], palettes: [WARM, ['#ff6fb5', '#b388eb', '#f7f3e3', '#ffd166']], mirror: false,
    draw(ctx, c) {
      line(ctx, 0, 0, 0, -22, '#3e7d3a', 2.5);
      for (let i = 0; i < 5; i += 1) disc(ctx, Math.cos((i / 5) * TAU) * 6, -26 + Math.sin((i / 5) * TAU) * 6, 4.5, c[1]);
      disc(ctx, 0, -26, 3.5, c[0]);
    },
  },
  mushroom: {
    size: [26, 26], palettes: [['#e4572e', '#c1440e', '#a9744f', '#f3a712']], mirror: false,
    draw(ctx, c) {
      box(ctx, -5, -12, 10, 12, '#f7f3e3');
      ctx.beginPath();
      ctx.arc(0, -12, 13, Math.PI, 0);
      ctx.fillStyle = c[0];
      ctx.fill();
      disc(ctx, -5, -18, 2.4, '#f7f3e3');
      disc(ctx, 5, -16, 2, '#f7f3e3');
    },
  },
  sheep: {
    size: [52, 36], palettes: [['#f7f3e3', '#e9e1cf', '#d8d2c4']], mirror: true,
    draw(ctx, c) {
      box(ctx, -14, -8, 4, 8, '#2d2a32');
      box(ctx, 8, -8, 4, 8, '#2d2a32');
      for (const [x, y] of [[-12, -18], [0, -24], [12, -18], [-4, -14], [8, -12]]) disc(ctx, x, y, 10, c[0]);
      oval(ctx, -22, -20, 6, 8, '#2d2a32');
    },
  },
  balloon: {
    size: [46, 84], palettes: [WARM, COOL], mirror: false,
    draw(ctx, c) {
      oval(ctx, 0, -58, 22, 26, c[0]);
      poly(ctx, [-7, -82, 7, -82, 5, -34, -5, -34], c[1]);
      line(ctx, -12, -38, -5, -12, '#3b2f2f', 1.5);
      line(ctx, 12, -38, 5, -12, '#3b2f2f', 1.5);
      box(ctx, -7, -12, 14, 12, '#8d5b3a');
    },
  },
  butterfly: {
    size: [24, 18], palettes: [WARM, ['#ff6fb5', '#b388eb', '#4cc9f0']], mirror: false,
    draw(ctx, c) {
      oval(ctx, -6, -11, 6, 7, c[1]);
      oval(ctx, 6, -11, 6, 7, c[1]);
      oval(ctx, -5, -4, 4, 4, c[0]);
      oval(ctx, 5, -4, 4, 4, c[0]);
      line(ctx, 0, -16, 0, -1, '#2d2a32', 2);
    },
  },
  fence: {
    size: [66, 32], palettes: [WOOD], mirror: false,
    draw(ctx, c) {
      for (let x = -30; x <= 30; x += 20) poly(ctx, [x - 4, 0, x + 4, 0, x + 4, -26, x, -32, x - 4, -26], c[0]);
      box(ctx, -33, -22, 66, 4, c[0]);
      box(ctx, -33, -10, 66, 4, c[0]);
    },
  },
  lantern: {
    size: [22, 34], palettes: [['#ff6b35', '#ffd23f', '#ee4266', '#3bceac']], mirror: false,
    draw(ctx, c) {
      line(ctx, 0, -34, 0, -28, '#2d2a32', 2);
      disc(ctx, 0, -16, 16, 'rgba(255, 214, 120, 0.18)');
      oval(ctx, 0, -16, 10, 12, c[0]);
      box(ctx, -6, -29, 12, 3, '#2d2a32');
      box(ctx, -6, -5, 12, 3, '#2d2a32');
    },
  },
  stall: {
    size: [130, 116], palettes: [WOOD, ['#e63946', '#2a9d8f', '#f4a261', '#6a4c93'], WARM], mirror: false,
    draw(ctx, c) {
      box(ctx, -58, -96, 6, 96, '#3b2615');
      box(ctx, 52, -96, 6, 96, '#3b2615');
      box(ctx, -62, -40, 124, 40, c[0]);
      box(ctx, -62, -44, 124, 6, '#3b2615');
      for (let i = 0; i < 6; i += 1) {
        poly(ctx, [-65 + i * 21.7, -96, -43.3 + i * 21.7, -96, -43.3 + i * 21.7, -80, -65 + i * 21.7, -80], i % 2 ? '#f4efe6' : c[1]);
        ctx.beginPath();
        ctx.arc(-54.2 + i * 21.7, -80, 10.85, 0, Math.PI);
        ctx.fillStyle = i % 2 ? '#f4efe6' : c[1];
        ctx.fill();
      }
      box(ctx, -18, -30, 36, 16, c[2]);
    },
  },
  fruit: {
    size: [44, 26], palettes: [['#e63946', '#f4a261', '#8ac926', '#ffca3a', '#6a4c93']], mirror: false,
    draw(ctx, c) {
      for (const [x, y] of [[-14, -7], [0, -7], [14, -7], [-7, -18], [7, -18]]) disc(ctx, x, y, 7, c[0]);
      disc(ctx, -9, -20, 2, 'rgba(255,255,255,0.6)');
    },
  },
  cat: {
    size: [42, 34], palettes: [['#2d2a32', '#f3a712', '#c9c9c9', '#8d5b3a'], ['#ffd166', '#4fe3a1', '#7cc7ff']], mirror: true,
    draw(ctx, c) {
      oval(ctx, 4, -10, 15, 10, c[0]);
      disc(ctx, -12, -22, 9, c[0]);
      poly(ctx, [-19, -27, -16, -36, -12, -29], c[0]);
      poly(ctx, [-12, -29, -8, -36, -5, -27], c[0]);
      ctx.beginPath();
      ctx.moveTo(18, -12);
      ctx.quadraticCurveTo(30, -14, 26, -30);
      ctx.strokeStyle = c[0];
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      disc(ctx, -15, -23, 2, c[1]);
      disc(ctx, -9, -23, 2, c[1]);
    },
  },
  sign: {
    size: [46, 50], palettes: [WOOD, WARM], mirror: false,
    draw(ctx, c) {
      box(ctx, -3, -22, 6, 22, '#3b2615');
      box(ctx, -23, -50, 46, 30, c[0]);
      disc(ctx, 0, -35, 9, c[1]);
    },
  },
  star: {
    size: [12, 12], palettes: [['#fff3b0', '#f4efe6', '#ffd6e0']], mirror: false,
    draw(ctx, c) {
      poly(ctx, [0, -12, 2, -8, 6, -6, 2, -4, 0, 0, -2, -4, -6, -6, -2, -8], c[0]);
    },
  },
};

/** Draws one object: its kind's shapes, moved, scaled and mirrored as the object says. */
export function drawObject(ctx, object, variant) {
  const kind = KINDS[object.kind];
  ctx.save();
  ctx.translate(variant.x, variant.y);
  ctx.scale(variant.flip ? -variant.s : variant.s, variant.s);
  kind.draw(ctx, variant.c);
  ctx.restore();
}
