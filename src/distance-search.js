import {language} from './i18n.js';
import {searchPlaces} from './places.js';
import {greatCircleDistance} from './distance.js';
import {fromKilometers, TEXAS} from './units.js';
import {format} from './converter.js';

export function mountDistanceSearch(onSelect) {
  const $ = selector => document.querySelector(selector);
  const copy = (it, en) => language === 'it' ? it : en;
  const mode = $('#search-mode'), first = $('#search'), second = $('#destination');
  const panel = $('#distance-panel'), choices = $('#distance-choices');
  const result = $('#distance-result'), status = $('#distance-status');
  const button = $('#online-search');
  const areaHelp = $('.online-help').innerHTML;
  const areaPlaceholder = first.placeholder, areaLabel = first.getAttribute('aria-label');
  let version = 0, controller;
  function node(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  }
  function invalidate() {
    version++;
    controller?.abort();
    panel.hidden = true;
    panel.setAttribute('aria-busy', 'false');
    choices.replaceChildren();
    result.replaceChildren();
    status.textContent = '';
    button.disabled = false;
    button.textContent = copy('Cerca online', 'Search online');
  }
  mode.previousElementSibling.textContent = copy('Calcola', 'Calculate');
  mode.options[0].textContent = copy('Superficie', 'Area');
  mode.options[1].textContent = copy('Distanza', 'Distance');
  panel.setAttribute('aria-label', copy('Distanza in linea d’aria', 'Straight-line distance'));
  second.placeholder = copy('Seconda città…', 'Second city…');
  second.setAttribute('aria-label', copy('Seconda città', 'Second city'));
  function setMode() {
    invalidate();
    const distance = mode.value === 'distance';
    $('#destination-field').hidden = !distance;
    second.disabled = !distance;
    first.placeholder = distance ? copy('Prima città…', 'First city…') : areaPlaceholder;
    first.setAttribute('aria-label', distance ? copy('Prima città', 'First city') : areaLabel);
    if (distance) $('.online-help').textContent = copy(
      'Distanza in linea d’aria, non su strada. Inserisci due città e premi Cerca online: i nomi vengono inviati a Wikidata. Scegli i luoghi corretti per calcolare la distanza approssimata tra le loro coordinate.',
      'Straight-line distance, not a road route. Enter two cities and press Search online: the names are sent to Wikidata. Choose the correct places to calculate the approximate distance between their coordinates.');
    else $('.online-help').innerHTML = areaHelp;
  }
  first.addEventListener('input', invalidate);
  second.addEventListener('input', invalidate);
  mode.addEventListener('change', setMode);
  setMode();

  $('#online-form').addEventListener('submit', async event => {
    if (mode.value !== 'distance') return;
    event.preventDefault();
    invalidate();
    const requestVersion = version;
    panel.hidden = false;
    const queries = [first.value.trim(), second.value.trim()];
    if (queries.some(q => q.length < 2 || q.length > 80)) {
      status.textContent = copy('Inserisci entrambe le città, da 2 a 80 caratteri ciascuna.', 'Enter both cities, using 2 to 80 characters for each.');
      return;
    }
    controller = new AbortController();
    button.disabled = true;
    button.textContent = copy('Ricerca…', 'Searching…');
    panel.setAttribute('aria-busy', 'true');
    status.textContent = copy('Cerco le due città su Wikidata…', 'Searching Wikidata for both cities…');
    try {
      const lists = await Promise.all(queries.map(query => searchPlaces(query, {language, signal: controller.signal})));
      if (requestVersion !== version) return;
      const selected = [null, null];
      status.textContent = copy('Scegli un luogo per ciascuna città. Controlla le descrizioni per evitare gli omonimi.', 'Choose a place for each city. Check the descriptions to distinguish places with the same name.');
      function renderDistance() {
        result.replaceChildren();
        if (selected.some(p => !p)) return;
        const [a, b] = selected;
        const km = greatCircleDistance(a.coordinates, b.coordinates);
        const unit = language === 'it' ? 'km' : 'mi';
        result.append(node('h3', `${a.name} ↔ ${b.name}`),
          node('p', copy('Distanza approssimata in linea d’aria', 'Approximate straight-line distance')),
          node('strong', `≈ ${format(fromKilometers(km, unit, 'length'), language)} ${unit} ≈ ${format(km / TEXAS.length, language)} Texas`),
          node('p', copy('Tra le coordinate dei luoghi selezionati, seguendo la curvatura terrestre. Non è la distanza su strada.', 'Between the selected places’ coordinates, following Earth’s curvature. This is not a road distance.')));
        const use = node('button', copy('Usa nel convertitore', 'Use in converter'));
        use.type = 'button';
        use.addEventListener('click', () => onSelect(a, b, km));
        result.append(use);
      }
      lists.forEach((places, index) => {
        const group = node('div', '');
        const label = node('label', `${copy(index === 0 ? 'Prima città' : 'Seconda città', index === 0 ? 'First city' : 'Second city')}: ${queries[index]}`);
        const select = node('select', '');
        select.id = `distance-city-${index}`;
        label.htmlFor = select.id;
        const placeholder = node('option', copy('Scegli il luogo…', 'Choose a place…'));
        placeholder.value = '';
        select.append(placeholder);
        places.forEach((place, i) => {
          const option = node('option', `${place.name} — ${place.description}${place.coordinates ? '' : copy(' · coordinate non disponibili', ' · coordinates unavailable')}`);
          option.value = String(i);
          option.disabled = !place.coordinates;
          select.append(option);
        });
        const source = node('p', '');
        select.addEventListener('change', () => {
          selected[index] = select.value === '' ? null : places[Number(select.value)];
          source.replaceChildren();
          if (selected[index]) {
            const place = selected[index];
            const link = node('a', `${place.name} — ${place.description} · Wikidata ↗`);
            link.href = place.source.replace('#P2046', '#P625');
            link.target = '_blank'; link.rel = 'noopener noreferrer';
            source.append(link);
          }
          renderDistance();
        });
        group.append(label, select, source);
        if (!places.some(p => p.coordinates)) {
          select.disabled = true;
          group.append(node('p', copy('Nessun luogo con coordinate utilizzabili. Prova un nome più preciso.', 'No places with usable coordinates. Try a more specific name.')));
        }
        choices.append(group);
      });
    } catch (error) {
      if (requestVersion === version) status.textContent = error.message || copy('Ricerca non disponibile. Riprova.', 'Search is unavailable. Please try again.');
    } finally {
      if (requestVersion === version) {
        button.disabled = false;
        button.textContent = copy('Cerca online', 'Search online');
        panel.setAttribute('aria-busy', 'false');
      }
    }
  });
}
