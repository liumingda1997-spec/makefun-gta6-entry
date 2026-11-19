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
    // The X=0 road is a north/south avenue in the 42-unit city grid.
    // Stage a car model at the player position; the on-foot avatar is hidden.
    player.position.set(0, 0, 0); player.rotation.y = 0; player.visible = false;
    parkedCars.forEach((c, i) => {
      if (i === 0) { c.position.set(0, 0, 0); c.rotation.y = 0; c.visible = true; }
      else c.visible = false;
    });
    traffic.forEach(t => { t.mesh.visible = false; });
    const scene = player.parent;
    scene?.traverse(o => {
      if (o.userData?.legs && Math.abs(o.position.x) <= 10 && o.position.z >= -30 && o.position.z <= 25) o.visible = false;
    });
    camera.position.set(0, 3.2, -23); camera.lookAt(0, 1, 4);
    return { started: true, chase: true };
  }
  return { started: false, aerial: false };
}
