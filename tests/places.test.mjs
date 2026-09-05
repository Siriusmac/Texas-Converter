import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extractAreas, extractPlace, searchPlaces} from '../src/places.js';

const snak = value => ({snaktype:'value',datavalue:{value}});
const claim = (amount, unit='Q712226', extra={}) => ({rank:'normal',mainsnak:snak({amount:String(amount),unit:`http://www.wikidata.org/entity/${unit}`}),...extra});
const place = areas => ({id:'Q617',labels:{it:{value:'Padova'}},descriptions:{it:{value:'comune italiano'}},claims:{P625:[{mainsnak:snak({latitude:45,longitude:11})}],P17:[{mainsnak:snak({id:'Q38'})}],P2046:areas}});

test('normalizes square metres and hectares, rejects missing and unsupported units',()=>{
  assert.deepEqual(extractAreas(place([claim(93.03),claim(93030000,'Q25343'),claim(9303,'Q35852')])).map(a=>a.km2),[93.03,93.03,93.03]);
  assert.equal(extractAreas(place([claim(-1),claim('NaN'),claim(0),claim(10,'Q11573'),{mainsnak:{snaktype:'novalue'}}])).length,0);
});
test('preserves dates and alternatives; excludes deprecated and partial areas',()=>{
  const dated=claim(93.03,'Q712226',{qualifiers:{P585:[snak({time:'+2011-10-09T00:00:00Z',precision:11})]},references:[{}]});
  const areas=extractAreas(place([dated,claim(94),claim(95,'Q712226',{rank:'deprecated'}),claim(2,'Q712226',{qualifiers:{P518:[snak({id:'Q15324'})]}})]));
  assert.equal(areas.length,2);assert.equal(areas[0].date,'Dato del 09/10/2011');assert.equal(areas[0].referenced,true);assert.equal(areas[1].date,'Data non indicata');
  assert.deepEqual(extractAreas(place([dated,claim(96,'Q712226',{rank:'preferred'})])).map(a=>a.km2),[96]);
});
test('does not convert people or non-geographic search matches; retains missing area states',()=>{
  assert.equal(extractPlace({id:'Q5',claims:{}}),null);
  const person=place([claim(1)]);person.claims.P31=[{mainsnak:snak({id:'Q5'})}];assert.equal(extractPlace(person),null);
  const missing=place([]);missing.claims.P31=[{mainsnak:snak({id:'Q515'})}];assert.equal(extractPlace(missing).areas.length,0);
  const language=place([]);language.claims.P31=[{mainsnak:snak({id:'Q34770'})}];assert.equal(extractPlace(language),null);
});
test('search batches candidates, omits credentials, and filters unrelated matches',async()=>{
  const calls=[];
  const results=await searchPlaces('Padova test',{fetcher:async(url,options)=>{
    calls.push(url);assert.equal(options.credentials,'omit');assert.equal(url.searchParams.get('origin'),'*');
    return {ok:true,json:async()=>calls.length===1?{search:[{id:'Q617'},{id:'Q5'},{id:'bad-id'}]}:{entities:{Q617:place([claim(93.03)]),Q5:{id:'Q5',claims:{}}}}};
  }});
  assert.equal(calls.length,2);assert.equal(calls[1].searchParams.get('ids'),'Q617|Q5');assert.equal(results.length,1);assert.equal(results[0].areas[0].km2,93.03);
});
test('empty searches and API/network failures are explicit',async()=>{
  assert.deepEqual(await searchPlaces('No match fixture',{fetcher:async()=>({ok:true,json:async()=>({search:[]})})}),[]);
  await assert.rejects(searchPlaces('x'),/2 a 80/);
  await assert.rejects(searchPlaces('API failure fixture',{fetcher:async()=>({ok:false})}),/non è disponibile/);
  await assert.rejects(searchPlaces('Network failure fixture',{fetcher:async()=>{throw new TypeError('network');}}),/connessione/);
});
