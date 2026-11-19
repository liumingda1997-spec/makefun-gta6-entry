export function shotMode() { return new URLSearchParams(window.location.search).get('shot'); }

export function configureShot(name, player, traffic, parkedCars, camera) {
  if (name === 'end') {
    camera.position.set(0, 255, 275); camera.lookAt(0, 0, 0); return { started: true, aerial: true, reduceFog: true };
  }
  if (name === 'play') {
    player.position.set(-5.4, 0, 4); player.rotation.y = Math.PI / 2;
    const car = parkedCars[0]; car.position.set(-2, 0, 4); car.rotation.y = Math.PI / 2;
    traffic.forEach((t, i) => { t.mesh.position.set(i===0 ? 5 : 70+i*5, 0, i===0 ? 4 : -2.4); t.mesh.rotation.y = i===0 ? Math.PI : Math.PI / 2; });
    return { started: true, aerial: false };
  }
  if (name === 'chase') {
    player.position.set(0, 0, 0); player.rotation.y = 0;
    parkedCars.forEach((c,i)=>c.position.set(180+i*8,0,180));
    traffic.slice(0, 2).forEach((t, i) => { t.mesh.position.set(180+i*8, 0, 180); });
    camera.position.set(0,5.2,18); camera.lookAt(0,1,-12);
    return { started: true, chase: true };
  }
  return { started: false, aerial: false };
}
