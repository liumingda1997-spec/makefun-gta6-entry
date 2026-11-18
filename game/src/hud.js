export function createHud(city) {
  const root = document.createElement('div');
  root.id = 'hud';
  root.innerHTML = '<div class="top"><div class="brand">PALM HEAT <small>SOLANO CITY</small></div><div class="stats"><span class="health"><i></i></span><span id="cash">$ 2,450</span><span class="stars">☆ ☆ ☆ ☆ ☆</span></div></div><div class="hint" id="hint">WASD move · Shift run · E enter vehicle · Mouse look</div><canvas id="map" width="180" height="180"></canvas><div id="start"><div class="start-card"><div class="eyebrow">SOLANO CITY · 1986</div><h1>PALM HEAT</h1><p>Every street has a story.<br>Make yours count.</p><button>CLICK TO PLAY</button></div></div>';
  document.body.append(root);
  const map = root.querySelector('#map');
  const ctx = map.getContext('2d');
  const start = root.querySelector('#start');
  return {
    root, start,
    setPlaying(playing) { start.classList.toggle('hidden', playing); },
    setHint(value) { root.querySelector('#hint').textContent = value; },
    update(player, traffic, driving) {
      ctx.clearRect(0, 0, 180, 180);
      ctx.fillStyle = '#142329'; ctx.fillRect(0, 0, 180, 180);
      const scale = 170 / city.span;
      ctx.save(); ctx.translate(90, 90); ctx.scale(scale, scale);
      ctx.fillStyle = '#535a59';
      for (const road of city.roads) ctx.fillRect(road.x - road.w / 2, road.z - road.d / 2, road.w, road.d);
      ctx.fillStyle = '#f06b42';
      for (const car of traffic) { ctx.beginPath(); ctx.arc(car.mesh.position.x, car.mesh.position.z, 2.8, 0, Math.PI * 2); ctx.fill(); }
      const p = driving || player;
      ctx.rotate(-p.rotation.y); ctx.fillStyle = '#ffe7a0'; ctx.beginPath(); ctx.moveTo(p.position.x, p.position.z - 5); ctx.lineTo(p.position.x - 3, p.position.z + 3); ctx.lineTo(p.position.x + 3, p.position.z + 3); ctx.fill();
      ctx.restore();
    },
  };
}
