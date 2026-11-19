const missions=[
 {name:'The Package',brief:'Marisol: Pick up the package on Ocean Drive and get it across town. Clock is ticking.',target:{x:84,z:-84},time:75,reward:650},
 {name:'Borrowed Wheels',brief:'Marisol: Bring me a specific blue coupe. The garage is marked.',target:{x:-126,z:84},time:90,reward:900},
 {name:'No Witnesses',brief:'Marisol: Pick up the envelope, then lose the three stars before they box you in.',target:{x:126,z:0},time:100,reward:1200,wanted:3},
 {name:'Last Light',brief:'Marisol: Three checkpoints. Make the final run before sunset.',checkpoints:[{x:-84,z:-42},{x:84,z:84},{x:0,z:-168}],time:95,reward:2000},
];
export function createMissions(completed=0){return {completed,active:false,index:completed,remaining:0,checkpoint:0}}
export function currentMission(state){return state.index<missions.length?missions[state.index]:null}
export function startMission(state){const m=currentMission(state);if(m){state.active=true;state.remaining=m.time;state.checkpoint=0;state.pickedUp=false}return m}
export function missionTarget(state){const m=currentMission(state);return m?.checkpoints?m.checkpoints[state.checkpoint]:m?.target}
export function updateMission(state,player,dt,wanted,hasMarkedCar=false){const m=currentMission(state);if(!m||!state.active)return null;state.remaining-=dt;if(state.remaining<=0)return 'failed';const t=missionTarget(state);if(m.wanted){if(!state.pickedUp&&Math.hypot(player.position.x-t.x,player.position.z-t.z)<5){state.pickedUp=true;return 'pickup'}return state.pickedUp&&wanted===0?'complete':null}if(m.name==='Borrowed Wheels'&&!hasMarkedCar)return null;if(Math.hypot(player.position.x-t.x,player.position.z-t.z)<5){if(m.checkpoints&&state.checkpoint<m.checkpoints.length-1){state.checkpoint++;return 'checkpoint'}return 'complete'}return null}
export function finishMission(state){const m=currentMission(state);state.active=false;state.completed++;state.index++;return m?.reward||0}
export function failMission(state){state.active=false;state.index=state.completed}
export function missionBrief(state){return currentMission(state)?.brief||''}
