const KEY='palm-heat-save';
export function loadSave(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
export function storeSave(state){localStorage.setItem(KEY,JSON.stringify(state))}
export function clearSave(){localStorage.removeItem(KEY)}
