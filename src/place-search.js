import {searchPlaces} from './places.js';
import {TEXAS, format} from './converter.js';

export function mountPlaceSearch(onSelect) {
  const input = document.querySelector('#search');
  const form = document.querySelector('#online-form');
  const button = document.querySelector('#online-search');
  const status = document.querySelector('#online-status');
  const results = document.querySelector('#online-results');
  const panel = document.querySelector('#online-panel');
  let current;
  let version = 0;
  const element = (tag, text, cls) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  function invalidate() {
    version++;
    current?.abort();
    button.disabled = false;
    button.textContent = 'Cerca online';
    panel.hidden = true;
    panel.setAttribute('aria-busy', 'false');
    status.textContent = '';
    results.replaceChildren();
  }
  input.addEventListener('input', invalidate);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    invalidate();
    const requestVersion = version;
    const query = input.value.trim();
    panel.hidden = false;
    if (query.length < 2 || query.length > 80) {
      status.textContent = 'Inserisci da 2 a 80 caratteri per cercare una città o una regione.';
      return;
    }
    current = new AbortController();
    button.disabled = true;
    button.textContent = 'Ricerca…';
    panel.setAttribute('aria-busy', 'true');
    status.textContent = `Cerco “${query}” su Wikidata…`;
    try {
      const places = await searchPlaces(query, {signal: current.signal});
      if (requestVersion !== version) return;
      status.textContent = places.length ? `${places.length} luoghi trovati per “${query}”. Controlla la descrizione e scegli la superficie.` : `Nessun luogo trovato per “${query}”. Prova il nome completo o una grafia diversa.`;
      for (const place of places) {
        const row = element('li', '', 'place-result');
        const identity = element('div', '', 'place-identity');
        identity.append(element('h3', place.name), element('p', place.description));
        const source = element('a', 'Scheda e fonti su Wikidata ↗');
        source.href = place.source;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        identity.append(source);
        row.append(identity);
        const measurements = element('div', '', 'place-measurements');
        if (!place.areas.length) measurements.append(element('p', 'Superficie utilizzabile non disponibile. Nessuna conversione stimata.', 'place-missing'));
        if (place.areas.length > 1) measurements.append(element('p', 'La fonte riporta più valori: scegli quello da usare.'));
        for (const area of place.areas) {
          const measurement = element('div', '', 'place-measurement');
          const metric = new Intl.NumberFormat('it-IT', {maximumSignificantDigits:10}).format(area.km2);
          measurement.append(element('strong', `${metric} km² ≈ ${format(area.km2 / TEXAS.area)} Texas`));
          measurement.append(element('small', `${area.date} · ${area.referenced ? 'Con riferimenti nella scheda' : 'Senza riferimenti nella scheda'}`));
          const use = element('button', 'Usa nel convertitore');
          use.type = 'button';
          use.setAttribute('aria-label', `Converti ${place.name}, ${metric} km²`);
          use.addEventListener('click', () => onSelect(place, area));
          measurement.append(use);
          measurements.append(measurement);
        }
        row.append(measurements);
        results.append(row);
      }
    } catch (error) {
      if (requestVersion === version) status.textContent = error.message || 'Ricerca non disponibile. Riprova.';
    } finally {
      if (requestVersion === version) {
        button.disabled = false;
        button.textContent = 'Cerca online';
        panel.setAttribute('aria-busy', 'false');
      }
    }
  });
}
