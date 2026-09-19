import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EARTH_RADIUS_KM, greatCircleDistance, extractCoordinates} from '../src/distance.js';
import {extractPlace} from '../src/places.js';

const point = (latitude, longitude) => ({latitude, longitude});
const claim = (latitude, longitude, extra = {}) => ({rank:'normal', mainsnak:{snaktype:'value', datavalue:{value:{latitude, longitude, globe:'http://www.wikidata.org/entity/Q2'}}}, ...extra});
const entity = claims => ({claims:{P625:claims}});

test('great-circle distances handle identical, polar, antipodal and date-line points', () => {
  assert.equal(greatCircleDistance(point(42,12), point(42,12)), 0);
  assert.ok(Math.abs(greatCircleDistance(point(0,0), point(0,180)) - Math.PI * EARTH_RADIUS_KM) < 1e-6);
  assert.ok(Math.abs(greatCircleDistance(point(0,0), point(90,0)) - Math.PI * EARTH_RADIUS_KM / 2) < 1e-6);
  assert.ok(Math.abs(greatCircleDistance(point(0,179), point(0,-179)) - 222.39016) < 0.001);
  assert.ok(greatCircleDistance(point(90,0), point(90,180)) < 1e-6);
});

test('Rome–Milan is approximately 477 km and symmetric; invalid input is rejected', () => {
  const rome=point(41.8931,12.4828), milan=point(45.4669,9.19);
  const km=greatCircleDistance(rome,milan);
  assert.ok(km > 475 && km < 480);
  assert.equal(km,greatCircleDistance(milan,rome));
  for(const bad of [null,point(91,0),point(0,181),point(NaN,0),point('42',12)]) {
    assert.throws(()=>greatCircleDistance(rome,bad),RangeError);
  }
});

test('coordinates require a single unqualified Earth location and respect preferred rank', () => {
  assert.deepEqual(extractCoordinates(entity([claim(42,12)])),point(42,12));
  assert.deepEqual(extractCoordinates(entity([claim(42,12),claim(42,12)])),point(42,12));
  assert.equal(extractCoordinates(entity([claim(42,12),claim(45,9)])),null);
  assert.deepEqual(extractCoordinates(entity([claim(42,12),claim(45,9,{rank:'preferred'})])),point(45,9));
  assert.equal(extractCoordinates(entity([claim(42,12,{rank:'deprecated'})])),null);
  assert.equal(extractCoordinates(entity([claim(42,12,{qualifiers:{P518:[]}})])),null);
  const moon=claim(42,12);moon.mainsnak.datavalue.value.globe='http://www.wikidata.org/entity/Q405';
  assert.equal(extractCoordinates(entity([moon])),null);
  assert.equal(extractCoordinates(entity([claim(91,12)])),null);
  assert.equal(extractCoordinates(entity([])),null);
});

test('cities without an area can still supply coordinates for distance', () => {
  const city={id:'Q220',labels:{en:{value:'Rome'}},claims:{P625:[claim(42,12)],P17:[{}],P31:[{mainsnak:{snaktype:'value',datavalue:{value:{id:'Q515'}}}}]}};
  const extracted=extractPlace(city,'en');
  assert.equal(extracted.name,'Rome');
  assert.deepEqual(extracted.areas,[]);
  assert.deepEqual(extracted.coordinates,point(42,12));
});
