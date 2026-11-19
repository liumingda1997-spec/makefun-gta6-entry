import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const screenshotLimit = 256 * 1024;

const shotsPath = join(here, 'shots.json');
const shots: unknown = JSON.parse(readFileSync(shotsPath, 'utf8'));
if (!Array.isArray(shots)) {
  throw new Error(`Invalid shots.json: expected an array of screenshot entries`);
}

const screenshotSizes: Array<{ name: string; bytes: number }> = [];
for (const shot of shots) {
  const name = shot && typeof shot === 'object' ? (shot as { name?: unknown }).name : undefined;
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Invalid shots.json: each screenshot entry must have a name');
  }
  if (name === '.' || name === '..' || name.includes('/') || name.includes('\\')) {
    throw new Error(`Invalid screenshot name in shots.json: ${name}`);
  }

  const screenshotPath = join(here, 'screenshots', name);
  if (!existsSync(screenshotPath) || !statSync(screenshotPath).isFile()) {
    throw new Error(`Missing screenshot file: screenshots/${name}`);
  }
  const bytes = statSync(screenshotPath).size;
  if (bytes > screenshotLimit) {
    throw new Error(`Screenshot is oversized (maximum 256 KiB): screenshots/${name} (${bytes} bytes)`);
  }
  screenshotSizes.push({ name, bytes });
}

const gameIndex = join(here, 'game', 'index.html');
if (!existsSync(gameIndex) || !statSync(gameIndex).isFile()) {
  throw new Error('Missing game entrypoint: game/index.html');
}

function countFiles(directory: string): number {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) count += countFiles(path);
    else if (entry.isFile()) count++;
  }
  return count;
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

for (const { name, bytes } of screenshotSizes) {
  console.log(`Screenshot ${name}: ${bytes} bytes`);
}
console.log(`PALM HEAT: ${countFiles(join(here, 'game', 'src'))} game source files`);
