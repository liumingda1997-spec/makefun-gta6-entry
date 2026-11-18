import { PALETTE } from './config.js';

function windowTexture(seed) {
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 256;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#594e49'; ctx.fillRect(0, 0, 128, 256);
  let value = Math.floor(seed * 2147483647) || 1;
  const rand = () => { value = (value * 16807) % 2147483647; return value / 2147483647; };
  for (let y = 10; y < 256; y += 23) for (let x = 8; x < 128; x += 25) { ctx.fillStyle = rand() > 0.32 ? (rand() > 0.5 ? '#ffd27a' : '#a9d4d2') : '#393e40'; ctx.fillRect(x, y, 12, 14); }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 2); return texture;
}

export function createRenderer(canvas, city) {
  const THREE = window.THREE;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.sky);
  scene.fog = new THREE.Fog(PALETTE.sky, 95, 350);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 700);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
  scene.add(new THREE.HemisphereLight(0xffe8c2, 0x50615a, 1.3));
  const sun = new THREE.DirectionalLight(0xffc17c, 2.1); sun.position.set(-70, 120, 60); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const mat = (color, roughness = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(city.span + 200, city.span + 200), mat(PALETTE.ground)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true; scene.add(ground);
  const roadMat = mat(PALETTE.road); const sidewalkMat = mat(PALETTE.sidewalk);
  for (const road of city.roads) {
    const asphalt = new THREE.Mesh(new THREE.BoxGeometry(road.w, 0.08, road.d), roadMat); asphalt.position.set(road.x, 0, road.z); asphalt.receiveShadow = true; scene.add(asphalt);
    const sw = road.w + 4, sd = road.d + 4;
    const curb = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.12, sd), sidewalkMat); curb.position.set(road.x, -0.09, road.z); scene.add(curb); scene.add(asphalt);
  }
  const buildingMeshes = [];
  for (const b of city.buildings) {
    const texture = windowTexture(b.seed); const material = mat(b.color, 0.82, { map: texture, emissive: 0x38271b, emissiveMap: texture, emissiveIntensity: 0.28 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), material); mesh.position.set(b.x, b.h / 2, b.z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.3, 0.35, b.d + 0.3), mat(0x8b7666)); roof.position.set(b.x, b.h + 0.16, b.z); scene.add(roof);
    buildingMeshes.push({ ...b, mesh });
  }
  for (const prop of city.props) {
    if (prop.type === 'palm') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 5.5, 6), mat(0x85603c)); trunk.position.set(prop.x, 2.75, prop.z); trunk.castShadow = true; scene.add(trunk);
      for (let i = 0; i < 7; i += 1) { const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 3.8), mat(0x356e48)); const a = i * Math.PI * 2 / 7; leaf.position.set(prop.x + Math.sin(a) * 1.4, 5.35, prop.z + Math.cos(a) * 1.4); leaf.rotation.y = a; leaf.rotation.x = -0.22; scene.add(leaf); }
    } else {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 5, 6), mat(0x394346)); pole.position.set(prop.x, 2.5, prop.z); scene.add(pole);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd58a })); bulb.position.set(prop.x, 5.1, prop.z); scene.add(bulb);
    }
  }
  function resize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }
  window.addEventListener('resize', resize); resize();
  return { scene, camera, renderer, buildingMeshes, render() { renderer.render(scene, camera); } };
}
