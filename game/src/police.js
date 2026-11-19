import { createCar } from './vehicles.js';
export function createPoliceCar(THREE, x, z) {
  const mesh = createCar(THREE, 0xf2f0e8, x, z);
  mesh.children[0].material.color.setHex(0xeeeeea); mesh.children[1].material.color.setHex(0x202b32);
  for(const side of [-1,1]) { const stripe = new THREE.Mesh(new THREE.BoxGeometry(.055,.22,2.8), new THREE.MeshStandardMaterial({color:0x111a20})); stripe.position.set(side*1.06,.82,0); mesh.add(stripe); }
  const bar = new THREE.Group();
  for(const [x,color] of [[-.34,0xff172c],[.34,0x168bff]]) { const lamp=new THREE.Mesh(new THREE.BoxGeometry(.55,.2,.42),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2.4}));lamp.position.x=x;bar.add(lamp); }
  bar.position.set(0,1.86,-.12); mesh.add(bar);
  mesh.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  return { mesh, siren: bar, phase: 0 };
}
export function updatePolice(units, player, wanted, dt) {
  while (units.length < Math.max(0, wanted - 1)) { const i=units.length; const u=createPoliceCar(window.THREE, player.position.x+(i?5:-5), player.position.z+24+i*7); document.dispatchEvent(new CustomEvent('police-spawn',{detail:u})); units.push(u); }
  for (const u of units) { u.phase+=dt*9;u.siren.children.forEach((l,i)=>{l.visible=(Math.floor(u.phase)%2===i);});const dx=player.position.x-u.mesh.position.x,dz=player.position.z-u.mesh.position.z; const distance=Math.hypot(dx,dz); const target=Math.atan2(-dx,-dz); let delta=((target-u.mesh.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI; u.mesh.rotation.y+=Math.max(-dt*1.25,Math.min(dt*1.25,delta)); u.mesh.position.x-=Math.sin(u.mesh.rotation.y)*Math.min(14,distance*.65)*dt; u.mesh.position.z-=Math.cos(u.mesh.rotation.y)*Math.min(14,distance*.65)*dt; }
}
