const COLORS = [0xe33d31, 0x087f91, 0xf0bd28, 0xe9e6dc, 0x28965c, 0x583f9e, 0xed7134, 0x263947];

export function createCar(THREE, color, x, z, heading = 0) {
  const car = new THREE.Group();
  car.position.set(x, 0, z);
  car.rotation.y = heading;
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 4), new THREE.MeshStandardMaterial({ color }));
  body.position.y = 0.65;
  car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.8, 2), new THREE.MeshStandardMaterial({ color: 0x9bc3c7, roughness: 0.28, metalness: 0.18 }));
  cabin.position.set(0, 1.38, -0.15);
  cabin.material.color.setHex(0x263c46);
  car.add(cabin);
  const tires = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.42, 0.72), new THREE.MeshStandardMaterial({ color: 0x202326 }));
  for (const zoff of [-1.3, 1.3]) { const wheel = tires.clone(); wheel.position.set(0, 0.34, zoff); car.add(wheel); }
  const addLamp=(x,y,z,color)=>{const lamp=new THREE.Mesh(new THREE.BoxGeometry(.34,.16,.08),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.2}));lamp.position.set(x,y,z);car.add(lamp);};
  addLamp(-.68,.62,-2.02,0xffe6a2); addLamp(.68,.62,-2.02,0xffe6a2);
  addLamp(-.72,.62,2.02,0xff352d); addLamp(.72,.62,2.02,0xff352d);
  const variant = Math.abs(Math.floor((x * 13 + z * 7 + color) % 4));
  if (variant === 1) { cabin.scale.set(1.02,.86,.78); cabin.position.z=-.34; }
  if (variant === 2) { cabin.scale.set(1.08,1.25,1.12); cabin.position.set(0,1.52,-.05); }
  if (variant === 3) { const bed=new THREE.Mesh(new THREE.BoxGeometry(1.8,.36,1.12),new THREE.MeshStandardMaterial({color})); bed.position.set(0,1.05,1.12);car.add(bed); }
  car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  car.userData.speed = 0;
  return car;
}

function roadLine(position, city) {
  const size = 42;
  const nearest = Math.round((position + city.span / 2) / size);
  return (nearest - Math.floor(city.span / size / 2)) * size;
}

export function createTraffic(THREE, city, random) {
  const cars = [];
  const colors = [...COLORS];
  for (let i = 0; i < 18; i += 1) {
    const vertical = random() < 0.5;
    const lane = (Math.floor(random() * 11) - 5) * 42;
    const direction = random() < 0.5 ? 1 : -1;
    const coordinate = (random() - 0.5) * city.span;
    const x = vertical ? lane + (direction > 0 ? -2.3 : 2.3) : coordinate;
    const z = vertical ? coordinate : lane + (direction > 0 ? 2.3 : -2.3);
    const heading = vertical ? (direction > 0 ? 0 : Math.PI) : (direction > 0 ? Math.PI / 2 : -Math.PI / 2);
    const mesh = createCar(THREE, colors[i % colors.length], x, z, heading);
    cars.push({ mesh, vertical, direction, lane, speed: 4 + random() * 3, turnAt: null, intersections: Math.floor(random() * 4) + 2 });
  }
  return cars;
}

export function updateTraffic(traffic, dt, city) {
  for (const car of traffic) {
    const axis = car.vertical ? 'z' : 'x';
    car.mesh.position[axis] += car.direction * car.speed * dt;
    const crossing = Math.round(car.mesh.position[axis] / 42) * 42;
    if (Math.abs(car.mesh.position[axis] - crossing) < car.speed * dt && Math.floor(crossing / 42) % car.intersections === 0) {
      car.vertical = !car.vertical;
      car.direction *= -1;
      car.mesh.rotation.y += Math.PI / 2;
    }
    if (Math.abs(car.mesh.position[axis]) > city.span / 2) car.mesh.position[axis] *= -1;
  }
}

export function updateDrive(car, input, dt) {
  const throttle = (input.held('KeyW') ? 1 : 0) - (input.held('KeyS') ? 1 : 0);
  const steer = (input.held('KeyD') ? 1 : 0) - (input.held('KeyA') ? 1 : 0);
  car.userData.speed = Math.max(-8, Math.min(24, car.userData.speed + throttle * 15 * dt));
  car.userData.speed *= Math.pow(0.985, dt * 60);
  car.rotation.y -= steer * Math.sign(car.userData.speed || 1) * Math.min(1, Math.abs(car.userData.speed) / 7) * dt * 1.7;
  car.position.x -= Math.sin(car.rotation.y) * car.userData.speed * dt;
  car.position.z -= Math.cos(car.rotation.y) * car.userData.speed * dt;
}

export { COLORS };
