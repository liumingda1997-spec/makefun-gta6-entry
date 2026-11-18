import { CITY } from './config.js';

/** Build Solano City's road grid and seeded block-by-block architecture. */
export function createWorld(random) {
  const roads = [];
  const buildings = [];
  const props = [];
  const span = CITY.blocks * CITY.blockSize;
  for (let z = 0; z < CITY.blocks; z += 1) for (let x = 0; x < CITY.blocks; x += 1) {
    const bx = (x - CITY.blocks / 2) * CITY.blockSize + CITY.blockSize / 2;
    const bz = (z - CITY.blocks / 2) * CITY.blockSize + CITY.blockSize / 2;
    const count = 3 + Math.floor(random() * 4);
    for (let n = 0; n < count; n += 1) {
      const w = 5 + random() * 9;
      const d = 5 + random() * 9;
      const h = 5 + random() * 22;
      const px = bx + 4 + random() * (CITY.blockSize - w - 8);
      const pz = bz + 4 + random() * (CITY.blockSize - d - 8);
      buildings.push({ x: px + w / 2, z: pz + d / 2, w, d, h, color: [0xd8a77b, 0xd1c3a5, 0xb9755b, 0x8caaa4, 0xe2c99a][Math.floor(random() * 5)], seed: random() });
    }
    for (let n = 0; n < 4; n += 1) {
      const offset = n < 2 ? -CITY.blockSize / 2 + 3 : CITY.blockSize / 2 - 3;
      const along = (n % 2 ? 1 : -1) * (CITY.blockSize / 2 - 3);
      props.push({ type: n % 2 ? 'lamp' : 'palm', x: bx + (n < 2 ? offset : along), z: bz + (n < 2 ? along : offset), rotation: random() * Math.PI * 2 });
    }
  }
  for (let i = 0; i <= CITY.blocks; i += 1) {
    const p = (i - CITY.blocks / 2) * CITY.blockSize;
    roads.push({ x: p, z: 0, w: CITY.road, d: span + CITY.blockSize });
    roads.push({ x: 0, z: p, w: span + CITY.blockSize, d: CITY.road });
  }
  return { roads, buildings, props, span: span + CITY.blockSize, start: { x: 0, z: 0 } };
}
