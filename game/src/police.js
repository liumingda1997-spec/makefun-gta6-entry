import { createCar } from './vehicles.js';
export function createPoliceCar(THREE, x, z) {
  const mesh = createCar(THREE, 0xf2f0e8, x, z);
  mesh.children[0].material.color.setHex(0xeeeeea); mesh.children[1].material.color.setHex(0x202b32);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.12,.22,2.1), new THREE.MeshStandardMaterial({color:0x18232b})); stripe.position.set(0,.8,0); mesh.add(stripe);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.05,.18,.38), new THREE.MeshStandardMaterial({color:0xff263a, emissive:0xff1626, emissiveIntensity:1.5})); bar.position.set(0,1.85,-.12); mesh.add(bar);
  return { mesh, siren: bar };
}
export function updatePolice(units, player, wanted, dt) {
  while (units.length < Math.max(0, wanted - 1)) { const i=units.length; const u=createPoliceCar(window.THREE, player.position.x+(i?5:-5), player.position.z+24+i*7); document.dispatchEvent(new CustomEvent('police-spawn',{detail:u})); units.push(u); }
  for (const u of units) { const dx=player.position.x-u.mesh.position.x,dz=player.position.z-u.mesh.position.z; const distance=Math.hypot(dx,dz); const target=Math.atan2(-dx,-dz); let delta=((target-u.mesh.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI; u.mesh.rotation.y+=Math.max(-dt*1.25,Math.min(dt*1.25,delta)); u.mesh.position.x-=Math.sin(u.mesh.rotation.y)*Math.min(14,distance*.65)*dt; u.mesh.position.z-=Math.cos(u.mesh.rotation.y)*Math.min(14,distance*.65)*dt; }
}
