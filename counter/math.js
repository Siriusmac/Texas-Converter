// Exact decimal accumulation of each conversion's floating-point representation.
export function scaledInteger(value){
 const [mantissa,exponent='0']=String(value).toLowerCase().split('e');
 const [whole,fraction='']=mantissa.split('.');
 return BigInt(whole+fraction)*10n**BigInt(324+Number(exponent)-fraction.length);
}
export function decimal(integer){
 const digits=String(integer).padStart(325,'0');
 return (digits.slice(0,-324)+'.'+digits.slice(-324)).replace(/\.?0+$/,'')||'0';
}
export function measurement(body,now=Date.now()){
 if(!body||!['length','area'].includes(body.mode)||!['mm','cm','m','km'].includes(body.unit)||typeof body.value!=='number'||!Number.isFinite(body.value)||body.value<=0||typeof body.id!=='string'||! /^[0-9a-f-]{36}$/i.test(body.id)||!Number.isFinite(body.at)||Math.abs(now-body.at)>300000)throw new Error('Invalid measurement');
 const factor={mm:1e-6,cm:1e-5,m:1e-3,km:1}[body.unit];
 const ratio=body.value*(body.mode==='area'?factor**2:factor)/(body.mode==='area'?695662:773*1.609344);
 if(!Number.isFinite(ratio)||ratio<=0)throw new Error('Invalid ratio');
 return {id:body.id,amount:String(scaledInteger(ratio))};
}
