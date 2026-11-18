import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createPlayer, movePlayer } from './player.js';
import { createCar, createTraffic, updateDrive, updateTraffic } from './vehicles.js';
import { createHud } from './hud.js';
import { configureShot, shotMode } from './shots.js';

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
    if (enteredCar) player.visible = false;
  }
}
function updateCamera(look) {
  if (shot === 'end') return;
  yaw -= look.x * 0.003;
  pitch = Math.max(-0.25, Math.min(0.65, pitch + look.y * 0.002));
  const focus = enteredCar || player;
  const distance = enteredCar ? 10 : 8;
  const height = enteredCar ? 4.2 : 3.7;
  renderer.camera.position.set(focus.position.x + Math.sin(yaw) * distance, focus.position.y + height + pitch * 4, focus.position.z + Math.cos(yaw) * distance);
  renderer.camera.lookAt(focus.position.x, focus.position.y + 1.3, focus.position.z);
}
function startGame() { title = false; paused = false; hud.setPlaying(true); }
function tick(dt) {
  const look = input.takeLook();
  updateCamera(look);
  if (title || paused || shot) return;
  if (input.take('KeyE')) enterExitCar();
  updateTraffic(traffic, dt, city);
  if (enteredCar) updateDrive(enteredCar, input, dt);
  else movePlayer(player, input.axis(), input, dt, city.buildings);
  const close = nearestCar();
  hud.setHint(enteredCar ? 'WASD drive · E exit vehicle · Mouse look' : close ? 'WASD move · Shift run · E enter vehicle · Mouse look' : 'WASD move · Shift run · E enter vehicle · Mouse look');
}
function render() {
  updateCamera({ x: 0, y: 0 });
  renderer.render();
  hud.update(player, traffic, enteredCar);
  frameCount += 1;
  if (shot && frameCount > 2) window.__shotReady = true;
}
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  if (shot === 'play') updateTraffic(traffic, dt, city);
  if (!shot) {
    if (title && (input.take('Space') || input.take('Enter'))) startGame();
    else if (title && hud.start.matches(':hover') && input.take('Mouse')) startGame();
    if (!title && input.take('Escape')) paused = !paused;
    tick(dt);
  }
  render();
}
hud.start.addEventListener('click', startGame);
document.addEventListener('visibilitychange', () => { if (document.hidden) paused = true; });
requestAnimationFrame(loop);
