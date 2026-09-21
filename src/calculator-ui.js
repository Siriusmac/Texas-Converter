import {language} from './i18n.js';
import {availableUnits, unitLabel} from './units.js';

export function mountCalculatorUI() {
  const $ = s => document.querySelector(s);
  const it = language === 'it';
  // Move the localized content, retaining the exact quote and subtitle copy.
  const quote = $('.movie-quote'), subtitle = $('.hero > div > p');
  const marker = document.createComment('subtitle');
  subtitle.replaceWith(marker);
  quote.replaceWith(subtitle);
  subtitle.classList.add('atlas-subtitle');
  marker.replaceWith(quote);

  const root = $('#convertitore');
  const shell = document.createElement('div'); shell.className = 'calculator-shell';
  const tabs = $('.tabs'); tabs.replaceChildren(); tabs.setAttribute('role','tablist');
  tabs.setAttribute('aria-label',it?'Modalità del calcolatore':'Calculator mode');
  const manual = document.createElement('div'); manual.id='manual-panel'; manual.setAttribute('role','tabpanel'); manual.setAttribute('aria-labelledby','tab-manual');
  manual.append($('.converter'),$('#reference'),$('#selected-place'));
  const online = document.createElement('div'); online.id='search-panel'; online.setAttribute('role','tabpanel');
  online.append($('#online-form'),$('.online-help'),$('#online-panel'),$('#distance-panel'));
  shell.append(tabs,manual,online); root.append(shell);
  $('.search-kind').hidden=true;
  const areaHelp = it?'Cerca una città o una regione su Wikidata, poi scegli la superficie da convertire. Il nome viene inviato solo premendo Cerca online. Controlla i confini del luogo e la data del dato.':'Search Wikidata for a city or region, then choose the area to convert. The name is sent only when you press Search online. Check the place boundaries and the measurement date.';
  $('.online-help').textContent=areaHelp;
  $('#search').placeholder=it?'Città o regione…':'City or region…';
  $('#search').setAttribute('aria-label',it?'Città o regione':'City or region');
  const atlasLabel=document.createElement('label');atlasLabel.className='search';
  const atlasInput=document.createElement('input');atlasInput.id='atlas-search';atlasInput.type='search';atlasInput.placeholder=it?'Filtra i confronti…':'Filter comparisons…';atlasInput.setAttribute('aria-label',it?'Filtra i confronti':'Filter comparisons');
  atlasLabel.append(atlasInput);$('.filterbar').append(atlasLabel);
  $('#empty').textContent=it?'Nessun confronto nell’atlante. Per altri luoghi, usa Cerca area nel calcolatore.':'No comparisons in the atlas. For other places, use Find area in the calculator.';
  $('#unit').replaceChildren();
  for (const dimension of ['length','area']) {
    const group=document.createElement('optgroup');group.label=dimension==='length'?(it?'Lunghezza':'Length'):(it?'Superficie':'Area');
    for(const unit of availableUnits(language)){
      const option=document.createElement('option');option.value=unit+(dimension==='area'?'²':'');option.dataset.unit=unit;option.dataset.mode=dimension;option.textContent=unitLabel(unit,dimension,language);group.append(option);
    }
    $('#unit').append(group);
  }
  $('#unit').value=it?'km':'mi';
  const buttons=[];
  const select = key => {
    manual.hidden=key!=='manual';online.hidden=key==='manual';
    for(const b of buttons){const active=b.dataset.section===key;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}
    if(key!=='manual')online.setAttribute('aria-labelledby',`tab-${key}`);
    $('#search-mode').value=key==='distance'?'distance':'area';
    $('#search-mode').dispatchEvent(new Event('change'));
  };
  for(const [key,label] of [['manual',it?'Inserimento manuale':'Manual entry'],['area',it?'Cerca area':'Find area'],['distance',it?'Calcola distanza':'Calculate distance']]){
    const b=document.createElement('button');b.type='button';b.id=`tab-${key}`;b.dataset.section=key;b.textContent=label;b.setAttribute('role','tab');b.setAttribute('aria-controls',key==='manual'?'manual-panel':'search-panel');b.addEventListener('click',()=>select(key));
    b.addEventListener('keydown',event=>{let index=buttons.indexOf(b);if(event.key==='ArrowRight')index=(index+1)%3;else if(event.key==='ArrowLeft')index=(index+2)%3;else if(event.key==='Home')index=0;else if(event.key==='End')index=2;else return;event.preventDefault();buttons[index].click();buttons[index].focus();});
    tabs.append(b);buttons.push(b);
  }
  select('manual');
  return select;
}
