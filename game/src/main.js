import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createPlayer, movePlayer } from './player.js';
import { createCar, createTraffic, updateDrive, updateTraffic } from './vehicles.js';
import { createHud } from './hud.js';
import { configureShot, shotMode } from './shots.js';
import { createPedestrians, updatePedestrians, scatterPedestrians } from './pedestrians.js';
import { createPoliceCar, updatePolice } from './police.js';
import { createMissions, startMission, currentMission, missionTarget, updateMission, finishMission, failMission, missionBrief } from './missions.js';
import { createAudio } from './audio.js';
import { loadSave, storeSave, clearSave } from './save.js';

const params = new URLSearchParams(window.location.search);
const requestedSeed = Number.parseInt(params.get('seed') || '', 10);
const random = createRandom(Number.isInteger(requestedSeed) ? requestedSeed : 827361);
const canvas = document.getElementById('game');
const city = createWorld(random);
const renderer = createRenderer(canvas, city);
const THREE = window.THREE;
const player = createPlayer(THREE, -3, 0);
renderer.scene.add(player);
const traffic = createTraffic(THREE, city, random);
traffic.forEach(car => renderer.scene.add(car.mesh));
const parkedCars = [];
for (let i = 0; i < 14; i += 1) {
  const side = i % 2 ? -1 : 1;
  const car = createCar(THREE, [0xd94734, 0x2b6684, 0xe6c84a, 0xeeeeea, 0x4e9a66][i % 5], (i - 6) * 5, side * 4.2, Math.PI / 2);
  renderer.scene.add(car); parkedCars.push(car);
}
const hud = createHud(city);
const pedestrians = createPedestrians(THREE, city, random); pedestrians.forEach(p => renderer.scene.add(p));
const police = [];
const audio = createAudio();
let save = loadSave();
let cash = save?.cash ?? 2450;
let health = 100;
let wanted = 0;
let wantedTimer = 0;
let busted = 0;
let bustedOut = false;
let mission = createMissions(save?.completed || 0);
let missionPillar = null;
hud.setCash(cash);
hud.setContinue(() => { title=false; player.position.set(save.x,0,save.z); hud.setPlaying(true); audio.start(); }, !!save);
const input = createInput(canvas);
let enteredCar = null;
let title = true;
let paused = false;
let yaw = Math.PI;
let pitch = 0.2;
let frameCount = 0;
const shot = shotMode();
if (shot) {
  const state = configureShot(shot, player, traffic, parkedCars, renderer.camera);
  if (state.reduceFog) renderer.scene.fog = new THREE.Fog(0xf5b778, 500, 1100);
  if (shot === 'start') { player.position.set(0,0,12); renderer.camera.position.set(0,24,78); renderer.camera.lookAt(0,5,-55); }
  if (shot === 'chase') { wanted=3; hud.setWanted(wanted); traffic.slice(0,2).forEach((t,i)=>{ const u=createPoliceCar(THREE, i?4:-4, 13+i*5); u.mesh.rotation.y=i?-.18:.18;u.siren.children.forEach(l=>l.visible=true);police.push(u);renderer.scene.add(u.mesh); }); }
  if (shot === 'play') { if(pedestrians[0]) pedestrians[0].position.set(0,0,1.3); if(pedestrians[1]) pedestrians[1].position.set(15,0,18); hud.setObjective('MISSION · FIND MARISOL'); }
  title = !state.started;
  hud.setPlaying(state.started);
}

function nearestCar() {
  let closest = null; let distance = 4.2;
  for (const car of parkedCars) {
    const d = player.position.distanceTo(car.position);
    if (d < distance) { distance = d; closest = car; }
  }
  return closest;
}
function enterExitCar() {
  if (enteredCar) {
    enteredCar.position.x += Math.cos(enteredCar.rotation.y) * 2.5;
    enteredCar.position.z -= Math.sin(enteredCar.rotation.y) * 2.5;
    player.position.copy(enteredCar.position); enteredCar = null;
  } else {
    enteredCar = nearestCar();
    if (enteredCar) { player.visible = false; setWanted(wanted + 1); }
  }
}
function updateCamera(look) {
  if (shot === 'chase') return;
  if (shot === 'end' || shot === 'start') return;
  yaw -= look.x * 0.003;
  pitch = Math.max(-0.25, Math.min(0.65, pitch + look.y * 0.002));
  const focus = enteredCar || player;
  const distance = enteredCar ? 10 : 6;
  const height = enteredCar ? 4.2 : 2.25;
  renderer.camera.position.set(focus.position.x + Math.sin(yaw) * distance, focus.position.y + height + pitch * 4, focus.position.z + Math.cos(yaw) * distance);
  renderer.camera.lookAt(focus.position.x, focus.position.y + 1.3, focus.position.z);
}
function startGame() { title = false; paused = false; hud.setPlaying(true); audio.start(); audio.click(); }
function setWanted(value) { wanted=Math.max(0,Math.min(5,value)); hud.setWanted(wanted); wantedTimer=0; }
function bustedRespawn() { bustedOut=true; cash=Math.max(0,cash-500); player.position.set(42,0,42); if(enteredCar){enteredCar.userData.speed=0;enteredCar=null;player.visible=true;} setWanted(0); busted=0; if(mission.active)failMission(mission); hud.setBanner('BUSTED · $500 BAIL'); }
function wasted() { health=100; cash=Math.max(0,cash-300); player.position.set(-42,0,-42); setWanted(0); hud.setBanner('WASTED · $300 FEE'); }
function updateMarker() { const target=mission.active?missionTarget(mission):null; if(target&&!missionPillar){missionPillar=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,12,8),new THREE.MeshBasicMaterial({color:0xffd454,transparent:true,opacity:.48}));renderer.scene.add(missionPillar);} if(missionPillar){missionPillar.visible=!!target;if(target)missionPillar.position.set(target.x,6,target.z);}return target; }
function tick(dt) {
  const look = input.takeLook();
  updateCamera(look);
  if (title || paused || shot) return;
  if (input.take('KeyE')) enterExitCar();
  updateTraffic(traffic, dt, city);
  updatePedestrians(pedestrians,dt);
  const oldPos=(enteredCar||player).position.clone();
  if (enteredCar) updateDrive(enteredCar, input, dt);
  else movePlayer(player, input.axis(), input, dt, city.buildings);
  const controlled=enteredCar||player;
  for(const p of pedestrians) if(p.userData.fleeing>0){} else if(Math.hypot(p.position.x-controlled.position.x,p.position.z-controlled.position.z)<12 && enteredCar && Math.abs(enteredCar.userData.speed)>10)scatterPedestrians(pedestrians,controlled.position.x,controlled.position.z);
  const collision=traffic.find(t=>Math.hypot(t.mesh.position.x-controlled.position.x,t.mesh.position.z-controlled.position.z)<2.6);
  if(collision){audio.thud();health-=enteredCar?6:10;if(enteredCar){enteredCar.userData.speed*=-.3;setWanted(wanted+1);}else player.position.copy(oldPos);}
  if(input.take('KeyF')&&!enteredCar){const victim=pedestrians.find(p=>Math.hypot(p.position.x-player.position.x,p.position.z-player.position.z)<2.2);if(victim){victim.userData.fleeing=4;scatterPedestrians(pedestrians,victim.position.x,victim.position.z);setWanted(wanted+1);audio.thud();}}
  if(wanted>0){updatePolice(police,controlled,wanted,dt);for(const u of police)if(!u.mesh.parent)renderer.scene.add(u.mesh);const near=police.some(u=>Math.hypot(u.mesh.position.x-controlled.position.x,u.mesh.position.z-controlled.position.z)<7);if(near&&(!enteredCar||Math.abs(enteredCar.userData.speed)<2)){busted+=dt/8;if(busted>=1)bustedRespawn();}else busted=Math.max(0,busted-dt*.15);wantedTimer+=dt;if(!near)wantedTimer+=dt*.4;if(wantedTimer>35){setWanted(wanted-1);wantedTimer=0;}}
  const missionResult=updateMission(mission,controlled,dt,wanted,enteredCar===parkedCars[1]);if(missionResult==='pickup'){setWanted(3);hud.setBanner('PICKUP SECURED · LOSE THE COPS');}if(missionResult==='failed'){failMission(mission);hud.setBanner('MISSION FAILED · RETURN TO MARISOL');hud.setBriefing('');}if(missionResult==='complete'){cash+=finishMission(mission);hud.setCash(cash);audio.success();hud.setBanner('MISSION COMPLETE · CASH ADDED');hud.setBriefing('');}
  if(input.take('KeyM')&&!mission.active){const m=startMission(mission);if(m)hud.setBriefing(m.brief);}
  if(currentMission(mission)&&!mission.active&&input.take('KeyR')){startMission(mission);hud.setBriefing(missionBrief(mission));}
  if(health<=0)wasted();
  hud.setHealth(health);hud.setWanted(wanted);hud.setBusted(busted);audio.update(enteredCar?.userData.speed||0,wanted>0);storeSave({cash,completed:mission.completed,x:controlled.position.x,z:controlled.position.z});
  const close = nearestCar();
  hud.setHint(enteredCar ? 'WASD drive · E exit vehicle · Mouse look' : close ? 'WASD move · Shift run · E enter vehicle · Mouse look' : 'WASD move · Shift run · E enter vehicle · Mouse look');
}
function render() {
  updateCamera({ x: 0, y: 0 });
  renderer.updateShadows(shot === 'chase' ? player.position : (enteredCar || player).position);
  renderer.render();
  hud.update(player, traffic, enteredCar, police, updateMarker());
  frameCount += 1;
  if (shot && frameCount > 2) window.__shotReady = true;
}
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  if (shot === 'play' || shot === 'chase') updateTraffic(traffic, dt, city);
  if (!shot) {
    if (title && (input.take('Space') || input.take('Enter'))) startGame();
    else if (title && hud.start.matches(':hover') && input.take('Mouse')) startGame();
    if (!title && input.take('Escape')) paused = !paused;
    tick(dt);
  }
  render();
}
hud.start.addEventListener('click', startGame);
hud.root.querySelector('#new-game').addEventListener('click',()=>{clearSave();cash=2450;mission=createMissions();startGame();});
document.addEventListener('click',()=>{if(!title)audio.start();},{once:true});
document.addEventListener('visibilitychange', () => { if (document.hidden) paused = true; });
requestAnimationFrame(loop);
