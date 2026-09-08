// International inch/foot/yard/mile definitions (NIST); factors are in km.
export const TEXAS={length:773*1.609344,area:695662};
export const METRIC_UNITS=['mm','cm','m','km'];
export const IMPERIAL_UNITS=['in','ft','yd','mi'];
export const UNITS={mm:1e-6,cm:1e-5,m:1e-3,km:1,in:0.0000254,ft:0.0003048,yd:0.0009144,mi:1.609344};
export function unitFactor(unit,mode){
 if(!Object.hasOwn(UNITS,unit)||!Object.hasOwn(TEXAS,mode))throw new RangeError('Invalid conversion');
 return mode==='area'?UNITS[unit]**2:UNITS[unit];
}
export function toTexas(value,unit,mode){
 if(!Number.isFinite(value)||value<0)throw new RangeError('Invalid conversion');
 return value*unitFactor(unit,mode)/TEXAS[mode];
}
export function fromKilometers(value,unit,mode){return value/unitFactor(unit,mode);}
export function availableUnits(lang){return lang==='en'?[...IMPERIAL_UNITS,...METRIC_UNITS]:[...METRIC_UNITS,...IMPERIAL_UNITS];}
export function unitLabel(unit,mode,lang){return unit==='m'&&mode==='length'?(lang==='it'?'metri':'meters'):unit+(mode==='area'?'²':'');}
