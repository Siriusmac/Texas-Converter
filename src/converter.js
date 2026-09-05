import {t, localeFor} from './i18n.js';
export const TEXAS={length:773*1.609344,area:695662}; // km and km²; width is a geographic approximation.
export const UNITS={mm:1e-6,cm:1e-5,m:1e-3,km:1};
export function parseMetric(raw, lang='it'){
 const s=String(raw).trim();
 if(!s) return {error:t('Inserisci una misura per cominciare.',lang)};
 if(!/^[+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(s))return {error:t('Usa un numero positivo, con punto o virgola decimale. Senza separatori delle migliaia.',lang)};
 const value=Number(s.replace(',','.'));
 if(!Number.isFinite(value))return {error:t('Questo numero è troppo grande. Prova un valore più piccolo.',lang)};
 if(value===0 && /[1-9]/.test(s.split(/[eE]/)[0]))return {error:t('Questo numero è troppo piccolo per essere rappresentato.',lang)};
 return {value};
}
export function convert(value,unit,mode){if(!(unit in UNITS)||!(mode in TEXAS)||!Number.isFinite(value)||value<0)throw new RangeError('Invalid conversion');return value*(mode==='area'?UNITS[unit]**2:UNITS[unit])/TEXAS[mode];}
export function format(n, lang='it'){return new Intl.NumberFormat(localeFor(lang),{maximumSignificantDigits:4,notation:n!==0&&(Math.abs(n)<.0001||Math.abs(n)>=1e12)?'scientific':'standard'}).format(n);}
export function fraction(n, lang='it'){
 if(n===0)return '0 Texas';
 if(n>=1e4)return `${format(n,lang)} ${lang==='it'?'volte il Texas':'times Texas'}`;
 let best=null;
 for(let d=1;d<=32;d++){const p=Math.round(n*d);if(!p)continue;const error=Math.abs(p/d-n)/n;if(error<=.01&&(!best||d<best.d))best={p,d};}
 if(best)return best.d===1?`${best.p} ${best.p===1?'Texas':lang==='it'?'volte il Texas':'times Texas'}`:`${best.p}/${best.d} ${lang==='it'?'di Texas':'of Texas'}`;
 return n<1&&Number.isFinite(1/n)?`1/${format(1/n,lang)} ${lang==='it'?'di Texas':'of Texas'}`:`${format(n,lang)} ${lang==='it'?'volte il Texas':'times Texas'}`;
}
export function scaled(n, lang='it'){if(n===0)return '0 Texas';const prefixes=[[-12,'pico'],[-9,'nano'],[-6,'micro'],[-3,'milli'],[0,''],[3,'kilo'],[6,'mega'],[9,'giga'],[12,'tera']];const exp=Math.max(-12,Math.min(12,Math.floor(Math.log10(n)/3)*3));const prefix=prefixes.find(p=>p[0]===exp)[1];return `${format(n/10**exp,lang)} ${prefix}Texas`;}
