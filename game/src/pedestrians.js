export function createPedestrians(THREE, city, random) {
  const walkers = [];
  const skin = new THREE.MeshStandardMaterial({ color: 0xb77e5b });
  for (let i = 0; i < 36; i += 1) {
    const group = new THREE.Group();
    const shirt = new THREE.MeshStandardMaterial({ color: [0x397b78, 0xc45e42, 0xd0b04e, 0x566e9a][i % 4] });
    const body = new THREE.Mesh(new THREE.BoxGeometry(.48, .78, .32), shirt); body.position.y = 1.05; group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.34, .34, .34), skin); head.position.y = 1.62; group.add(head);
    const legs = [];
    for (const x of [-.14, .14]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.16, .65, .18), shirt); leg.position.set(x, .38, 0); group.add(leg); legs.push(leg); }
    const alongX = random() < .5; const block = Math.floor(random() * 9 - 4) * 42; const walk = random() < .5 ? 1 : -1;
    group.position.set(alongX ? (random() - .5) * 360 : block + (walk > 0 ? 8 : -8), 0, alongX ? block + (walk > 0 ? 8 : -8) : (random() - .5) * 360);
    group.userData = { alongX, walk, legs, phase: random() * 6, fleeing: 0 };
    walkers.push(group);
  }
  return walkers;
}
export function scatterPedestrians(walkers, x, z) { for (const p of walkers) if (Math.hypot(p.position.x - x, p.position.z - z) < 13) p.userData.fleeing = 2.8; }
export function updatePedestrians(walkers, dt) {
  for (const p of walkers) { const d = p.userData; d.phase += dt * (d.fleeing > 0 ? 15 : 7); if (d.fleeing > 0) d.fleeing -= dt;
    const speed = d.fleeing > 0 ? 6 : 1.15; p.position[d.alongX ? 'x' : 'z'] += d.walk * speed * dt; p.rotation.y = d.alongX ? (d.walk > 0 ? Math.PI / 2 : -Math.PI / 2) : (d.walk > 0 ? Math.PI : 0);
    d.legs[0].rotation.x = Math.sin(d.phase) * .55; d.legs[1].rotation.x = -Math.sin(d.phase) * .55;
  }
}
