// Public Wikidata API; only explicit searches leave the browser.
const ENDPOINT = 'https://www.wikidata.org/w/api.php';
const UNIT_KM2 = { Q712226: 1, Q25343: 1e-6, Q35852: 0.01 };
const cache = new Map();
const valueOf = snak => snak?.snaktype === 'value' ? snak.datavalue?.value : undefined;

function dateLabel(snak) {
  const value = valueOf(snak);
  const match = value?.time?.match(/^\+(\d{4})-(\d{2})-(\d{2})T/);
  if (!match || value.precision < 9) return '';
  return value.precision >= 11 ? `${match[3]}/${match[2]}/${match[1]}` : value.precision === 10 ? `${match[2]}/${match[1]}` : match[1];
}

export function extractAreas(entity) {
  const claims = (entity.claims?.P2046 || []).filter(c => c.rank !== 'deprecated');
  const preferred = claims.some(c => c.rank === 'preferred');
  return claims.filter(c => !preferred || c.rank === 'preferred').flatMap(c => {
    // Never silently present a part, a water-only area, or another qualified
    // measurement as the whole place. Dates are retained and displayed.
    const qualifiers = c.qualifiers || {};
    if (Object.keys(qualifiers).some(p => !['P585', 'P580', 'P582'].includes(p))) return [];
    const quantity = valueOf(c.mainsnak);
    const unit = quantity?.unit?.match(/^https?:\/\/www\.wikidata\.org\/entity\/(Q\d+)$/)?.[1];
    if (!Object.hasOwn(UNIT_KM2, unit)) return [];
    const km2 = Number(quantity.amount) * UNIT_KM2[unit];
    if (!Number.isFinite(km2) || km2 <= 0) return [];
    const dates = [['P585', 'Dato del'], ['P580', 'Dal'], ['P582', 'Fino al']].flatMap(([p, label]) => (qualifiers[p] || []).map(s => dateLabel(s)).filter(Boolean).map(d => `${label} ${d}`));
    return [{ km2, date: dates.join(' · ') || 'Data non indicata', referenced: Boolean(c.references?.length) }];
  });
}

export function extractPlace(entity) {
  const claims = entity.claims || {};
  if (!/^Q\d+$/.test(entity.id) || !claims.P625?.some(c => valueOf(c.mainsnak)) || !(claims.P17?.length || claims.P131?.length)) return null;
  if (claims.P31?.some(c => valueOf(c.mainsnak)?.id === 'Q5')) return null;
  const settlementTypes = new Set(['Q515', 'Q3957', 'Q532', 'Q486972', 'Q15284', 'Q747074']);
  const geographicEvidence = ['P2046', 'P1082', 'P150', 'P36', 'P47'].some(p => claims[p]?.length)
    || claims.P31?.some(c => settlementTypes.has(valueOf(c.mainsnak)?.id));
  if (!geographicEvidence) return null;
  return {
    id: entity.id,
    name: entity.labels?.it?.value || entity.labels?.en?.value || entity.id,
    description: entity.descriptions?.it?.value || entity.descriptions?.en?.value || 'Luogo geografico; verifica la scheda per identificarlo.',
    source: `https://www.wikidata.org/wiki/${entity.id}#P2046`,
    areas: extractAreas(entity),
  };
}

export async function searchPlaces(query, {signal, fetcher = fetch} = {}) {
  const text = query.trim();
  if (text.length < 2 || text.length > 80) throw new Error('Inserisci da 2 a 80 caratteri, per esempio “Padova” o “Veneto”.');
  const key = text.toLocaleLowerCase('it');
  const saved = cache.get(key);
  if (saved && saved.expires > Date.now()) return saved.results;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, {once: true});
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 15000);
  async function request(params) {
    const url = new URL(ENDPOINT);
    url.search = new URLSearchParams({format: 'json', origin: '*', ...params});
    const response = await fetcher(url, {signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'});
    if (!response.ok) throw new Error('La ricerca online non è disponibile adesso. Riprova tra poco.');
    const data = await response.json();
    if (data.error) throw new Error('Wikidata non riesce a completare la ricerca. Riprova tra poco.');
    return data;
  }
  try {
    const found = await request({action: 'wbsearchentities', search: text, language: 'it', uselang: 'it', type: 'item', limit: '8'});
    const ids = (found.search || []).map(e => e.id).filter(id => /^Q\d+$/.test(id));
    if (!ids.length) return [];
    const data = await request({action: 'wbgetentities', ids: ids.join('|'), props: 'labels|descriptions|claims', languages: 'it|en'});
    const results = ids.map(id => data.entities?.[id]).filter(Boolean).map(extractPlace).filter(Boolean);
    if (cache.size >= 20) cache.delete(cache.keys().next().value);
    cache.set(key, {results, expires: Date.now() + 300000});
    return results;
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) throw new Error('La ricerca sta impiegando troppo tempo. Riprova.');
    if (signal?.aborted) throw error;
    if (error instanceof TypeError || error instanceof SyntaxError) throw new Error('Impossibile leggere la risposta di Wikidata. Controlla la connessione e riprova.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
