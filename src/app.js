import {TEXAS,parseMetric,convert,format,fraction,scaled} from './converter.js';
import {catalog} from './catalog.js';
const $=s=>document.querySelector(s);
let mode='length',category='Tutti',limit=8;
function update(){
 const parsed=parseMetric($('#value').value);let error=parsed.error;let ratio;
 if(!error){ratio=convert(parsed.value,$('#unit').value,mode);if(!Number.isFinite(ratio)||(parsed.value>0&&ratio===0))error='Valore fuori intervallo. Prova un’altra misura.';}
 $('#error').textContent=error||'';$('#value').setAttribute('aria-invalid',String(Boolean(error)));
 $('#answer').replaceChildren(document.createTextNode(error?'—':format(ratio)),Object.assign(document.createElement('span'),{textContent:' Texas'}));
 $('#fraction').textContent=error?'Il Texas ti aspetta.':`≈ ${fraction(ratio)} ${mode==='length'?'in larghezza':'di superficie'}`;
 $('#scaled').textContent=error?'':`Equivale a ${scaled(ratio)}`;
 $('#reference').textContent=mode==='length'?'↔  1 Texas ≈ 1.244,02 km di larghezza':'▧  1 Texas = 695.662 km² di superficie';
}
function setMode(next){mode=next;for(const m of ['length','area'])$('#'+m).setAttribute('aria-pressed',String(m===mode));for(const option of $('#unit').options)option.textContent=option.value==='m'?(mode==='area'?'m²':'metri'):option.value+(mode==='area'?'²':'');update();}
for(const m of ['length','area'])$('#'+m).addEventListener('click',()=>setMode(m));
$('#value').addEventListener('input',update);$('#unit').addEventListener('change',update);
function renderCatalog(){
 const query=$('#search').value.trim().toLocaleLowerCase('it');
 const items=catalog.filter(i=>(category==='Tutti'||i.group===category)&&`${i.name} ${i.detail}`.toLocaleLowerCase('it').includes(query));
 $('#count').textContent=`${items.length} confronti`;$('#rows').replaceChildren();
 for(const item of items.slice(0,limit)){
  const tr=document.createElement('tr');const cell=document.createElement('td');const btn=document.createElement('button');btn.className='item';btn.textContent=item.name;btn.setAttribute('aria-label',`Converti ${item.name}: ${item.detail}`);
  btn.addEventListener('click',()=>{$('#unit').value='km';$('#value').value=String(item.value);setMode(item.mode);$('#convertitore').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});$('#value').focus({preventScroll:true});});
  cell.append(btn);const mobile=document.createElement('span');mobile.className='mobile-detail';mobile.textContent=`${item.detail} · ${format(item.value)} ${item.mode==='area'?'km²':'km'}`;cell.append(mobile);tr.append(cell);
  for(const [text,cls] of [[`${format(item.value/TEXAS[item.mode])} Texas`,'texas-value'],[item.detail,'detail'],[`${format(item.value)} ${item.mode==='area'?'km²':'km'}`,'metric']]){const td=document.createElement('td');td.className=cls;td.textContent=text;tr.append(td);}
  const source=document.createElement('td');const link=document.createElement('a');link.href=item.source;link.textContent='↗';link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`Fonte: ${item.name}, ${item.detail}`);source.append(link);tr.append(source);$('#rows').append(tr);
 }
 $('#empty').hidden=items.length!==0;$('#more').hidden=items.length<=limit;
}
for(const btn of $('#filters').children)btn.addEventListener('click',()=>{category=btn.textContent;limit=8;for(const b of $('#filters').children)b.setAttribute('aria-pressed',String(b===btn));renderCatalog();});
$('#search').addEventListener('input',()=>{limit=8;renderCatalog();});$('#more').addEventListener('click',()=>{limit+=12;renderCatalog();});
update();renderCatalog();
