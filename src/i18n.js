export function detectLanguage(languages) {
  const first = Array.isArray(languages) ? languages[0] : languages;
  return /^it(?:-|$)/i.test(first || '') ? 'it' : 'en';
}
export const language = typeof location === 'undefined' ? 'it' :
  (['it', 'en'].includes(new URLSearchParams(location.search).get('lang'))
    ? new URLSearchParams(location.search).get('lang')
    : detectLanguage(navigator.languages?.length ? navigator.languages : navigator.language));
export const localeFor = lang => lang === 'it' ? 'it-IT' : 'en-US';

const english = {
  'Inserisci una misura per cominciare.': 'Enter a measurement to get started.',
  'Usa un numero positivo, con punto o virgola decimale. Senza separatori delle migliaia.': 'Use a positive number with a decimal point or comma. No thousands separators.',
  'Questo numero è troppo grande. Prova un valore più piccolo.': 'This number is too large. Try a smaller value.',
  'Questo numero è troppo piccolo per essere rappresentato.': 'This number is too small to represent.',
  'Valore fuori intervallo. Prova un’altra misura.': 'Value out of range. Try another measurement.',
  'Il Texas ti aspetta.': 'Texas is waiting for you.',
  'Cerca online': 'Search online',
  'Ricerca…': 'Searching…',
  'Inserisci da 2 a 80 caratteri per cercare una città o una regione.': 'Enter 2 to 80 characters to search for a city or region.',
  'Inserisci da 2 a 80 caratteri, per esempio “Padova” o “Veneto”.': 'Enter 2 to 80 characters, such as “London” or “Tuscany”.',
  'Scheda e fonti su Wikidata ↗': 'Details and sources on Wikidata ↗',
  'Superficie utilizzabile non disponibile. Nessuna conversione stimata.': 'No usable area available. No estimated conversion.',
  'La fonte riporta più valori: scegli quello da usare.': 'The source lists multiple values. Choose the one to use.',
  'Con riferimenti nella scheda': 'References provided in the entry',
  'Senza riferimenti nella scheda': 'No references provided in the entry',
  'Usa nel convertitore': 'Use in converter',
  'Ricerca non disponibile. Riprova.': 'Search is unavailable. Please try again.',
  'Data non indicata': 'Date not provided',
  'Dato del': 'As of', 'Dal': 'From', 'Fino al': 'Until',
  'Luogo geografico; verifica la scheda per identificarlo.': 'Geographic place; check the entry to identify it.',
  'La ricerca online non è disponibile adesso. Riprova tra poco.': 'Online search is unavailable right now. Try again shortly.',
  'Wikidata non riesce a completare la ricerca. Riprova tra poco.': 'Wikidata could not complete the search. Try again shortly.',
  'La ricerca sta impiegando troppo tempo. Riprova.': 'The search is taking too long. Please try again.',
  'Impossibile leggere la risposta di Wikidata. Controlla la connessione e riprova.': 'Could not read the Wikidata response. Check your connection and try again.',
  'Stati USA': 'US states', 'Continenti': 'Continents', 'Spazio': 'Space', 'Tutti': 'All',
  'Area totale · terre e acque': 'Total area · land and water',
  'Area geografica approssimata': 'Approximate geographic area',
  'Diametro approssimato': 'Approximate diameter', 'Diametro equatoriale': 'Equatorial diameter',
  'Superficie sferica stimata · π × diametro²': 'Estimated spherical surface · π × diameter²',
  'Distanza media': 'Mean distance', '1 au · definizione esatta': '1 au · exact definition',
  'Anno giuliano · 365,25 giorni': 'Julian year · 365.25 days', '1 pc · 648.000/π au': '1 pc · 648,000/π au',
  'Distanza percorsa dalla luce in 1 s': 'Distance travelled by light in 1 s',
  'America del Nord': 'North America', 'America del Sud': 'South America', 'Antartide': 'Antarctica', 'Europa': 'Europe',
  'Mercurio': 'Mercury', 'Venere': 'Venus', 'Terra': 'Earth', 'Marte': 'Mars', 'Giove': 'Jupiter', 'Saturno': 'Saturn', 'Urano': 'Uranus', 'Nettuno': 'Neptune',
  'Luna': 'Moon', 'Sole': 'Sun', 'Terra → Luna': 'Earth → Moon', 'Unità astronomica': 'Astronomical unit', 'Anno luce': 'Light-year', 'Secondo luce': 'Light-second',
};
export const t = (text, lang = language) => lang === 'it' ? text : english[text] || text;
export function localizeCatalog(items, lang = language) {
  return items.map(item => ({...item, name:t(item.name,lang), detail:t(item.detail,lang)}));
}

export function localizePage() {
  document.documentElement.lang = language;
  // Category identities stay stable when the visible labels change.
  document.querySelectorAll('#filters button').forEach(b => {b.dataset.category = b.textContent; b.textContent = t(b.textContent);});
  const select = document.querySelector('#language');
  select.value = language;
  select.addEventListener('change', () => {
    const url = new URL(location.href); url.searchParams.set('lang', select.value); location.assign(url);
  });
  if (language === 'it') return;
  document.title = 'Texas Converter — Everything is measured in Texas';
  const text = {
    '.skip':'Skip to converter', 'nav a[href="#convertitore"]':'Converter', 'nav a[href="#atlante"]':'Atlas', 'nav a[href="#texas"]':'About Texas',
    '#length':'↔  Length', '#area':'▧  Area', 'label[for="value"]':'Your measurement', 'label[for="unit"]':'Unit',
    '#unit option[value="m"]':'meters', '#input-help':'Decimal point or comma, without thousands separators.',
    '.result-caption':'IN TEXAN UNITS', '.atlas-heading h2':'A world of Texas.', '.atlas-heading p':'From next door to the edge of the solar system.',
    '#online-search':'Search online', '.atlas-hint':'Each row identifies the measurement being compared. Select it to convert.',
    '#empty':'No matches in the atlas. For a city or region, try “Search online”.', '#more':'Show more comparisons ↓',
    'th:nth-child(1)':'PLACE / OBJECT', 'th:nth-child(2)':'IN TEXAS', 'th:nth-child(3)':'MEASUREMENT', 'th:nth-child(4)':'METRIC VALUE', 'th .sr-only':'Source',
    '#global-counter':'Loading the global counter…', '#counter-help':'Totals since September 5, 2026. Count a measurement by pressing Enter or leaving the field, or by selecting a comparison. Lengths and areas are added separately.', '.method h3':'One state. Two units.', 'footer span':'★  Serious measurements. Not-so-humble units.', 'footer a':'Texas Converter on GitHub ↗',
  };
  for (const [selector,value] of Object.entries(text)) document.querySelector(selector).textContent = value;
  const html = {
    '.hero h1':'Everything is bigger<br>in Texas.',
    '.hero p':'Meters, kilometers, planets.<br class="mobile-break"> Everything is measured in Texas here.',
    '.online-help':'Filter the atlas as you type. For cities and regions not listed, press <strong>Search online</strong>: the name is sent to Wikidata to find its area. Check the place boundaries and the date of the measurement.',
    'summary':'How we do the math <span aria-hidden="true">＋</span>',
  };
  // These strings are application-owned constants, never search/API content.
  for (const [selector,value] of Object.entries(html)) document.querySelector(selector).innerHTML = value;
  const paragraphs = [
    'For lengths, 1 Texas is the maximum east–west extent: approximately 773 miles, converted to <strong>1,244.022912 km</strong>. This is an approximate geographic reference, not a measurement accurate to the millimeter. <a href="https://texashistory.unt.edu/ark:/67531/metapth279642/m1/78/" target="_blank" rel="noopener noreferrer">Texas Almanac ↗</a>',
    'For areas, 1 Texas is <strong>695,662 km²</strong>, the total area including water in the Census 2010 reference. It is not the square of the state’s width. <a href="https://www.census.gov/geographies/reference-files/2010/geo/state-area.html" target="_blank" rel="noopener noreferrer">U.S. Census Bureau ↗</a>',
    'We divide km or km² by the corresponding reference. Fractions are approximate (within 1% when small denominators are used). MilliTexas = one thousandth of Texas; megaTexas = one million Texas. These playful prefixes are not official units.',
    'For planets we use NASA’s equatorial diameters; for the Moon and Sun, rounded diameters. Surface areas are spherical estimates, π × diameter²: they do not account for flattening or terrain. For gas giants and the Sun, these do not represent a solid surface. Continents follow a seven-continent model with indicative areas and conventional boundaries; Oceania includes Australia and Pacific islands.',
    'Sources for each comparison are available through the ↗ links in the table. Conversions run locally. Only pressing “Search online” sends the search text to Wikidata. Online search is independent of atlas filters and uses the area of the selected geographic entity, not its width. Data or references may be missing: we do not assume they are current or official. Deprecated values, partial areas and unknown units are excluded; available dates remain visible.',
  ];
  document.querySelectorAll('.method p').forEach((p,i) => {p.innerHTML = paragraphs[i];});
  const attributes = [
    ['nav','aria-label','Main navigation'], ['#language','aria-label','Language'], ['#convertitore','aria-label','Measurement converter'],
    ['.tabs','aria-label','Measurement type'], ['#filters','aria-label','Atlas categories'], ['#online-panel','aria-label','Places found online'],
    ['#search','aria-label','Search the atlas or online'], ['#search','placeholder','Find a place or a planet…'],
    ['.hero img','alt','Western engraving with longhorn horns, cacti and Texas mountains'],
    ['meta[name="description"]','content','Convert metric lengths and areas into Texas. A western converter, from microscopic to astronomical.'],
    ['link[rel="manifest"]','href','./public/site-en.webmanifest'],
  ];
  for (const [selector,attribute,value] of attributes) document.querySelector(selector).setAttribute(attribute,value);
}
