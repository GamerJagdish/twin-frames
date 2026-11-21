// Twin Frames hand-in (Node 22, standard library only). The game itself is the static game/ folder; this program
// copies game/ and screenshots/ to the output directory and writes dossier.json, the summary the judge reads,
// with the kit's vendored buildDossier. Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** The gate's caps, as reference/gate.json states them: the dossier text limit, and what the scorer refuses. */
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
const shots = join(repoRoot, 'screenshots');
if (existsSync(shots)) cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, GATE_CAPS));
