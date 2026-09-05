import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectLanguage,localizeCatalog} from '../src/i18n.js';
import {catalog} from '../src/catalog.js';
import {parseMetric,format,fraction,scaled} from '../src/converter.js';
import {extractAreas,searchPlaces} from '../src/places.js';

test('primary browser language selects Italian only for Italian locales',()=>{
  for(const language of ['it','it-IT','it-CH','IT-it'])assert.equal(detectLanguage([language,'en']), 'it');
  for(const languages of [['en-US','it'],['fr-FR','it-IT'],['de'],['es'],[],undefined])assert.equal(detectLanguage(languages),'en');
});
test('English numbers, fractions and validation retain conversion semantics',()=>{
  assert.equal(format(.8038,'en'),'0.8038');assert.equal(format(1234,'en'),'1,234');
  assert.equal(fraction(.5,'en'),'1/2 of Texas');assert.equal(fraction(2,'en'),'2 times Texas');
  assert.equal(scaled(.0012,'en'),'1.2 milliTexas');assert.equal(parseMetric('1,25','en').value,1.25);
  assert.match(parseMetric('-1','en').error,/positive number/);assert.match(parseMetric('','en').error,/Enter/);
});
test('translated catalog preserves group identity and numeric values',()=>{
  const translated=localizeCatalog(catalog,'en');assert.equal(translated.length,catalog.length);
  assert.equal(translated.find(i=>i.name==='Moon').group,'Spazio');
  assert.equal(translated.find(i=>i.name==='North America').group,'Continenti');
  assert.equal(translated.find(i=>i.name==='Moon').detail,'Approximate diameter');
  translated.forEach((i,index)=>assert.equal(i.value,catalog[index].value));
});
test('English Wikidata dates are unambiguous',()=>{
  const snak=value=>({snaktype:'value',datavalue:{value}});
  const areas=extractAreas({claims:{P2046:[{rank:'normal',mainsnak:snak({amount:'+93.03',unit:'http://www.wikidata.org/entity/Q712226'}),qualifiers:{P585:[snak({time:'+2011-10-09T00:00:00Z',precision:11})]}}]}},'en');
  assert.equal(areas[0].date,'As of 2011-10-09');
});
test('Wikidata query and cache are separated by language',async()=>{
  let calls=0;
  for(const language of ['it','en']){
    await searchPlaces('Language cache fixture',{language,fetcher:async url=>{
      calls++;
      if(url.searchParams.get('action')==='wbsearchentities'){
        assert.equal(url.searchParams.get('language'),language);
        return {ok:true,json:async()=>({search:[{id:'Q1'}]})};
      }
      assert.equal(url.searchParams.get('languages'),language==='it'?'it|en':'en');
      return {ok:true,json:async()=>({entities:{}})};
    }});
  }
  assert.equal(calls,4);
  await assert.rejects(searchPlaces('x',{language:'en'}),/Enter 2 to 80/);
});
