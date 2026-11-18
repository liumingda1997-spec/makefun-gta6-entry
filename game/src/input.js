export function createInput(target) {
  const down = new Set();
  let pointerLocked = false;
  let dx = 0;
  let dy = 0;
  const pressed = new Set();
  window.addEventListener('keydown', event => { down.add(event.code); if (!event.repeat) pressed.add(event.code); if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault(); });
  window.addEventListener('keyup', event => down.delete(event.code));
  window.addEventListener('blur', () => down.clear());
  target.addEventListener('click', () => { if (document.pointerLockElement === target) return; target.requestPointerLock?.(); });
  document.addEventListener('pointerlockchange', () => { pointerLocked = document.pointerLockElement === target; });
  window.addEventListener('mousemove', event => { if (pointerLocked) { dx += event.movementX; dy += event.movementY; } });
  return {
    held(code) { return down.has(code); },
    take(code) { const yes = pressed.has(code); pressed.delete(code); return yes; },
    axis() { return { x: (down.has('KeyD') ? 1 : 0) - (down.has('KeyA') ? 1 : 0), z: (down.has('KeyS') ? 1 : 0) - (down.has('KeyW') ? 1 : 0) }; },
    takeLook() { const look = { x: dx, y: dy }; dx = 0; dy = 0; return look; },
  };
}
