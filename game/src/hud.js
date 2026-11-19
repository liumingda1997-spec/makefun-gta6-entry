export function createHud(city) {
  const root = document.createElement('div');
  root.id = 'hud';
  root.innerHTML = '<div class="top"><div class="brand">PALM HEAT <small>SOLANO CITY</small></div><div class="stats"><span class="health"><i id="health-fill"></i></span><span id="cash">$ 2,450</span><span class="stars">☆☆☆☆☆</span></div></div><div id="objective" style="position:absolute;top:82px;left:30px;font-weight:800"></div><div id="busted" style="display:none;position:absolute;top:115px;left:30px;width:190px;height:12px;background:#142329;border:1px solid #fff"><i style="display:block;height:100%;width:0;background:#ed4a42"></i></div><div id="mission-box" style="display:none;position:absolute;left:50%;top:70%;transform:translate(-50%,-50%);padding:18px 24px;background:#172629dd;border:1px solid #ffc978;max-width:440px"></div><div id="banner" style="position:absolute;top:24%;left:50%;transform:translateX(-50%);font-size:26px;font-weight:900;color:#ffd36f"></div><div id="hint" class="hint">WASD move · Shift run · E enter vehicle · F punch · M mission</div><canvas id="map" width="180" height="180"></canvas><div id="start"><div class="start-card"><div class="eyebrow">SOLANO CITY · 1986</div><h1>PALM HEAT</h1><p>Every street has a story.<br>Make yours count.</p><button id="new-game">NEW GAME</button> <button id="continue" style="display:none">CONTINUE</button></div></div>';
  document.body.append(root);
  const map = root.querySelector('#map');
  const ctx = map.getContext('2d');
  const start = root.querySelector('#start');
  return {
    root, start,
    setCash(value) { root.querySelector('#cash').textContent = '$ ' + Math.floor(value).toLocaleString(); },
    setWanted(value) { root.querySelector('.stars').textContent = '★'.repeat(value) + '☆'.repeat(5 - value); },
    setHealth(value) { root.querySelector('#health-fill').style.width = Math.max(0, value) + '%'; },
    setBusted(value) { const el=root.querySelector('#busted');el.style.display=value>0?'block':'none';el.firstElementChild.style.width=Math.min(100,value*100)+'%'; },
    setObjective(value) { root.querySelector('#objective').textContent = value || ''; },
    setBriefing(value) { const el = root.querySelector('#mission-box'); el.textContent = value; el.style.display = value ? 'block' : 'none'; },
    setBanner(value) { root.querySelector('#banner').textContent = value; setTimeout(() => { root.querySelector('#banner').textContent = ''; }, 2200); },
    setContinue(callback, exists) { const button = root.querySelector('#continue'); button.style.display = exists ? 'inline-block' : 'none'; button.onclick = callback; },
    setPlaying(playing) { start.classList.toggle('hidden', playing); },
    setHint(value) { root.querySelector('#hint').textContent = value; },
    update(player, traffic, driving, police = [], target = null) {
      ctx.clearRect(0, 0, 180, 180);
      ctx.fillStyle = '#142329'; ctx.fillRect(0, 0, 180, 180);
      const scale = 170 / city.span;
      ctx.save(); ctx.translate(90, 90); ctx.scale(scale, scale);
      ctx.fillStyle = '#89918b';
      for (const road of city.roads) ctx.fillRect(road.x - road.w / 2, road.z - road.d / 2, road.w, road.d);
      ctx.fillStyle = '#f06b42';
      for (const car of traffic) { ctx.beginPath(); ctx.arc(car.mesh.position.x, car.mesh.position.z, 2.8, 0, Math.PI * 2); ctx.fill(); }
      for (const cruiser of police) { ctx.fillStyle = '#5fc9ff'; ctx.beginPath(); ctx.arc(cruiser.mesh.position.x, cruiser.mesh.position.z, 3.6, 0, Math.PI * 2); ctx.fill(); }
      if (target) { ctx.fillStyle = '#ffe05f'; ctx.beginPath(); ctx.arc(target.x, target.z, 3.5, 0, Math.PI * 2); ctx.fill(); }
      const p = driving || player;
      ctx.rotate(-p.rotation.y); ctx.fillStyle = '#ffe7a0'; ctx.beginPath(); ctx.moveTo(p.position.x, p.position.z - 5); ctx.lineTo(p.position.x - 3, p.position.z + 3); ctx.lineTo(p.position.x + 3, p.position.z + 3); ctx.fill();
      ctx.restore();
    },
  };
}
