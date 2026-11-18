export function shotMode() { return new URLSearchParams(window.location.search).get('shot'); }

export function configureShot(name, player, traffic, parkedCars, camera) {
  if (name === 'end') {
    camera.position.set(0, 190, 225); camera.lookAt(0, 0, 0); return { started: true, aerial: true };
  }
  if (name === 'play') {
    player.position.set(-3, 0, 0); player.rotation.y = Math.PI / 2;
    const car = parkedCars[0]; car.position.set(-1, 0, 0); car.rotation.y = Math.PI / 2;
    traffic.forEach((t, i) => { t.mesh.position.x += i * 0.7; });
    return { started: true, aerial: false };
  }
  return { started: false, aerial: false };
}
