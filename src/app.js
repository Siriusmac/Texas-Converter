import {language, t, localizePage, localizeCatalog} from './i18n.js';
import {mountPlaceSearch} from './place-search.js';
import {TEXAS,parseMetric,convert,format,fraction,scaled} from './converter.js';
import {catalog} from './catalog.js';
localizePage();
const localizedCatalog=localizeCatalog(catalog);
const $=s=>document.querySelector(s);
let mode='length',category='Tutti',limit=8;
function clearPlace(){$('#selected-place').hidden=true;$('#selected-place').replaceChildren();}
function loadMeasure(value,nextMode){clearPlace();$('#unit').value='km';$('#value').value=String(value);setMode(nextMode);$('#convertitore').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});$('#value').focus({preventScroll:true});}
mountPlaceSearch((place,area)=>{loadMeasure(area.km2,'area');const note=$('#selected-place');const link=document.createElement('a');link.href=place.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Wikidata ↗';note.append(document.createTextNode(`${place.name} · ${place.description} · ${area.date} · `),link);note.hidden=false;});
function update(){
 const parsed=parseMetric($('#value').value,language);let error=parsed.error;let ratio;
 if(!error){ratio=convert(parsed.value,$('#unit').value,mode);if(!Number.isFinite(ratio)||(parsed.value>0&&ratio===0))error=t('Valore fuori intervallo. Prova un’altra misura.');}
 $('#error').textContent=error||'';$('#value').setAttribute('aria-invalid',String(Boolean(error)));
 $('#answer').replaceChildren(document.createTextNode(error?'—':format(ratio,language)),Object.assign(document.createElement('span'),{textContent:' Texas'}));
 $('#fraction').textContent=error?t('Il Texas ti aspetta.'):`≈ ${fraction(ratio,language)} ${language==='it'?(mode==='length'?'in larghezza':'di superficie'):(mode==='length'?'in width':'in area')}`;
 $('#scaled').textContent=error?'':`${language==='it'?'Equivale a':'Equivalent to'} ${scaled(ratio,language)}`;
 $('#reference').textContent=language==='en'?(mode==='length'?'↔  1 Texas ≈ 1,244.02 km wide':'▧  1 Texas = 695,662 km² in area'):mode==='length'?'↔  1 Texas ≈ 1.244,02 km di larghezza':'▧  1 Texas = 695.662 km² di superficie';
}
function setMode(next){mode=next;for(const m of ['length','area'])$('#'+m).setAttribute('aria-pressed',String(m===mode));for(const option of $('#unit').options)option.textContent=option.value==='m'?(mode==='area'?'m²':language==='it'?'metri':'meters'):option.value+(mode==='area'?'²':'');update();}
for(const m of ['length','area'])$('#'+m).addEventListener('click',()=>{clearPlace();setMode(m);});
$('#value').addEventListener('input',()=>{clearPlace();update();});$('#unit').addEventListener('change',()=>{clearPlace();update();});
function renderCatalog(){
 const query=$('#search').value.trim().toLocaleLowerCase(language);
 const items=localizedCatalog.filter(i=>(category==='Tutti'||i.group===category)&&`${i.name} ${i.detail}`.toLocaleLowerCase(language).includes(query));
 $('#count').textContent=`${items.length} ${language==='it'?'confronti':'comparisons'}`;$('#rows').replaceChildren();
 for(const item of items.slice(0,limit)){
  const tr=document.createElement('tr');const cell=document.createElement('td');const btn=document.createElement('button');btn.className='item';btn.textContent=item.name;btn.setAttribute('aria-label',`${language==='it'?'Converti':'Convert'} ${item.name}: ${item.detail}`);
  btn.addEventListener('click',()=>loadMeasure(item.value,item.mode));
  cell.append(btn);const mobile=document.createElement('span');mobile.className='mobile-detail';mobile.textContent=`${item.detail} · ${format(item.value,language)} ${item.mode==='area'?'km²':'km'}`;cell.append(mobile);tr.append(cell);
  for(const [text,cls] of [[`${format(item.value/TEXAS[item.mode],language)} Texas`,'texas-value'],[item.detail,'detail'],[`${format(item.value,language)} ${item.mode==='area'?'km²':'km'}`,'metric']]){const td=document.createElement('td');td.className=cls;td.textContent=text;tr.append(td);}
  const source=document.createElement('td');const link=document.createElement('a');link.href=item.source;link.textContent='↗';link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${language==='it'?'Fonte':'Source'}: ${item.name}, ${item.detail}`);source.append(link);tr.append(source);$('#rows').append(tr);
 }
 $('#empty').hidden=items.length!==0;$('#more').hidden=items.length<=limit;
}
for(const btn of $('#filters').children)btn.addEventListener('click',()=>{category=btn.dataset.category;limit=8;for(const b of $('#filters').children)b.setAttribute('aria-pressed',String(b===btn));renderCatalog();});
$('#search').addEventListener('input',()=>{limit=8;renderCatalog();});$('#more').addEventListener('click',()=>{limit+=12;renderCatalog();});
update();renderCatalog();
