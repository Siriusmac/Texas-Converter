import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scaledInteger,decimal,measurement} from '../counter/math.js';
test('preserves tiny conversions alongside astronomical totals',()=>{const tiny=scaledInteger(5e-324);const huge=scaledInteger(1e308);assert.equal(tiny,5n);assert.equal(scaledInteger(0.1)+scaledInteger(0.2),scaledInteger(0.3));assert.equal(decimal(huge+tiny).endsWith('005'),true);assert.equal(decimal(0n),'0');assert.equal(decimal(scaledInteger(1000)),'1000');});
test('recomputes values and rejects invalid or expired submissions',()=>{const now=Date.now();const body={id:crypto.randomUUID(),at:now,value:695662,unit:'km',mode:'area'};assert.equal(measurement(body,now).amount,String(scaledInteger(1)));for(const patch of [{value:Infinity},{value:-1},{unit:'constructor'},{mode:'constructor'},{at:now-300001},{value:0},{value:'10'}])assert.throws(()=>measurement({...body,...patch},now));});
