import {language} from './i18n.js';
import {format} from './converter.js';
const productionOrigin='https://siriusmac.github.io';
// Local development always uses a separate local database.
const endpoint=location.origin===productionOrigin?'https://texas-converter-counter.siriusmac.workers.dev':'http://localhost:8787';
export function formatTotal(value){
 const number=Number(value);if(Number.isFinite(number))return format(number,language);
 const digits=value.split('.')[0];return `${format(Number(digits.slice(0,4))/1000,language)} × 10^${digits.length-1}`;
}
export function mountCounter(){
 const line=document.querySelector('#global-counter');let totals;let refreshVersion=0;let queue=Promise.resolve();
 const offline=()=>{line.textContent=language==='it'?'Il contatore globale è temporaneamente non disponibile.':'The global counter is temporarily unavailable.';};
 function render(){if(!totals)return;line.textContent=language==='it'?`Finora sono stati misurati ${formatTotal(totals.length.total)} Texas di lunghezza e ${formatTotal(totals.area.total)} Texas di superficie con questa app.`:`So far, this app has measured ${formatTotal(totals.length.total)} Texas in length and ${formatTotal(totals.area.total)} Texas in area.`;}
 async function request(path,options){const response=await fetch(endpoint+path,{...options,signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Counter unavailable');return response.json();}
 async function refresh(){const version=++refreshVersion;try{const next=await request('/totals');if(version!==refreshVersion)return;totals=next;render();}catch{if(version===refreshVersion)offline();}}
 refresh();
 return measurement=>{
  const event={...measurement,id:crypto.randomUUID(),at:Date.now()};
  queue=queue.then(async()=>{
   try{try{await request('/measurements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),keepalive:true});}catch{await request('/measurements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),keepalive:true});}
    // Read both partitions after the acknowledged write; retries share the same event ID.
    await refresh();
   }catch{offline();}
  });
 };
}
