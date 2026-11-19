export function createAudio() {
  let ctx=null, engine=null, oscillator=null;
  function start(){ if(ctx)return; ctx=new AudioContext(); oscillator=ctx.createOscillator(); engine=ctx.createGain(); oscillator.type='sawtooth'; engine.gain.value=0; oscillator.connect(engine).connect(ctx.destination); oscillator.start(); }
  function tone(freq,duration=.08,type='sine'){ if(!ctx)return; const o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.value=freq;o.type=type;g.gain.setValueAtTime(.08,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration); }
  return {start,click(){tone(900,.04)},thud(){tone(100,.12,'triangle')},success(){tone(520,.14);setTimeout(()=>tone(760,.2),120)},update(speed,siren){if(!ctx)return;engine.gain.setTargetAtTime(Math.min(.035,Math.abs(speed)*.0015),ctx.currentTime,.08);oscillator.frequency.setTargetAtTime(48+Math.abs(speed)*9+(siren?30*Math.sin(ctx.currentTime*7):0),ctx.currentTime,.08)}};
}
