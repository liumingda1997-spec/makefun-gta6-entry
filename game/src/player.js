import { PLAYER } from './config.js';

export function createPlayer(THREE, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const shirt = new THREE.MeshStandardMaterial({ color: 0xe35d42, roughness: 0.9 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x344957, roughness: 1 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xb97c55, roughness: 1 });
  function box(w, h, d, y, material, xoff = 0) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(xoff, y, 0); group.add(mesh); return mesh; }
  box(0.72, 0.82, 0.38, 1.03, shirt);
  box(0.55, 0.63, 0.34, 0.32, pants);
  box(0.42, 0.42, 0.42, 1.72, skin);
  box(0.18, 0.68, 0.2, 0.98, shirt, -0.48);
  box(0.18, 0.68, 0.2, 0.98, shirt, 0.48);
  group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  group.userData.velocity = 0;
  group.userData.radius = PLAYER.radius;
  return group;
}

export function movePlayer(player, axis, input, dt, buildings) {
  const speed = input.held('ShiftLeft') || input.held('ShiftRight') ? PLAYER.runSpeed : PLAYER.speed;
  const length = Math.hypot(axis.x, axis.z) || 1;
  const dx = axis.x / length * speed * dt;
  const dz = axis.z / length * speed * dt;
  const collides = (x, z) => buildings.some(b => x + PLAYER.radius > b.x - b.w / 2 && x - PLAYER.radius < b.x + b.w / 2 && z + PLAYER.radius > b.z - b.d / 2 && z - PLAYER.radius < b.z + b.d / 2);
  if (!collides(player.position.x + dx, player.position.z)) player.position.x += dx;
  if (!collides(player.position.x, player.position.z + dz)) player.position.z += dz;
  if (Math.abs(dx) + Math.abs(dz) > 0.001) player.rotation.y = Math.atan2(-dx, -dz);
}
