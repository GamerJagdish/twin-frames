// Twin Frames: every fixed number the game runs on, in one place.

/** The logical canvas: everything is drawn in these units and scaled to the window. */
export const VIEW = { width: 1280, height: 720 };

/** The two pictures, side by side: the original on the left, the copy on the right. */
export const PANEL = { width: 600, height: 440, top: 150, gap: 28 };
PANEL.left = (VIEW.width - PANEL.width * 2 - PANEL.gap) / 2;
PANEL.right = PANEL.left + PANEL.width + PANEL.gap;

/** The levels of a run: each one a scene, more differences, less time and subtler changes. */
export const LEVELS = [
  { name: 'Harbour at Dusk', theme: 'harbour', diffs: 5, time: 90, subtle: 0 },
  { name: 'Alpine Meadow', theme: 'meadow', diffs: 6, time: 85, subtle: 1 },
  { name: 'Night Market', theme: 'market', diffs: 7, time: 80, subtle: 2 },
  { name: 'Harbour at First Light', theme: 'harbour', diffs: 8, time: 80, subtle: 3 },
  { name: 'Meadow in Autumn', theme: 'meadow', diffs: 8, time: 75, subtle: 4 },
  { name: 'Market at Midnight', theme: 'market', diffs: 9, time: 75, subtle: 5 },
];

export const RULES = {
  hintsPerRun: 3,
  /** Seconds taken off the clock by a click on no difference. */
  missPenalty: 4,
  findPoints: 100,
  /** Each find within this many seconds of the last one raises the streak bonus. */
  streakWindow: 6,
  streakPoints: 25,
  /** Points per whole second left on the clock when a level is cleared. */
  timeBonus: 10,
  /** How far outside a difference's box a click still counts, in pixels. */
  hitPad: 10,
  /** The smallest box a difference is given, so a tiny change is still fair to click. */
  minHit: 34,
  /** Seconds the hint ring stays up. */
  hintSeconds: 4,
  /** Under this many seconds the clock turns red and pulses. */
  hurrySeconds: 15,
};

export const COLORS = {
  ink: '#f4efe6',
  dim: '#a9a294',
  backdrop: '#1b1a24',
  frame: '#2c2a38',
  found: '#4fe3a1',
  miss: '#ff5d6c',
  hint: '#ffd166',
  hurry: '#ff7a59',
  accent: '#7cc7ff',
};
