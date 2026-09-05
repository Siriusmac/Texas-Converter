import {DurableObject} from 'cloudflare:workers';
import {decimal,measurement} from './math.js';
export class MeasurementTotal extends DurableObject {
 constructor(ctx,env){super(ctx,env);this.sql=ctx.storage.sql;
  this.sql.exec('CREATE TABLE IF NOT EXISTS total (id INTEGER PRIMARY KEY, amount TEXT NOT NULL, count INTEGER NOT NULL)');
  this.sql.exec("INSERT OR IGNORE INTO total VALUES (1,'0',0)");
  this.sql.exec('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, expires INTEGER NOT NULL)');
  this.sql.exec('CREATE INDEX IF NOT EXISTS expiry ON events(expires)');
 }
 snapshot(){const row=this.sql.exec('SELECT amount,count FROM total WHERE id=1').one();return {total:decimal(row.amount),count:row.count};}
 add(event){return this.ctx.storage.transactionSync(()=>{
  this.sql.exec('DELETE FROM events WHERE expires < ?',Date.now());
  if(!this.sql.exec('SELECT id FROM events WHERE id=?',event.id).toArray().length){
   const row=this.sql.exec('SELECT amount,count FROM total WHERE id=1').one();
   this.sql.exec('INSERT INTO events VALUES (?,?)',event.id,Date.now()+86400000);
   this.sql.exec('UPDATE total SET amount=?,count=count+1 WHERE id=1',String(BigInt(row.amount)+BigInt(event.amount)));
  }
  return this.snapshot();
 });}
}
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');const allowed=origin===env.ALLOWED_ORIGIN;
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed?{'Access-Control-Allow-Origin':origin}: {})};
 const reply=(body,status=200)=>Response.json(body,{status,headers});
 const path=new URL(request.url).pathname;
 if(request.method==='OPTIONS')return new Response(null,{status:allowed?204:403,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}});
 try{
  if(request.method==='GET'&&path==='/totals'){
   const [length,area]=await Promise.all(['length','area'].map(mode=>env.TOTALS.getByName(mode).snapshot()));return reply({length,area});
  }
  if(request.method==='POST'&&path==='/measurements'){
   if(!allowed)return reply({error:'Origin not allowed'},403);
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
   if(!(await env.LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success)return reply({error:'Too many measurements'},429);
   const reader=request.body?.getReader();if(!reader)return reply({error:'Body required'},400);
   let chunks=[],size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>1024){await reader.cancel();return reply({error:'Body too large'},413);}chunks.push(value);}
   let body,event;try{body=JSON.parse(await new Response(new Blob(chunks)).text());event=measurement(body);}catch{return reply({error:'Invalid measurement'},400);}
   const result=await env.TOTALS.getByName(body.mode).add(event);return reply({mode:body.mode,...result});
  }
  return reply({error:'Not found'},404);
 }catch{return reply({error:'Counter unavailable'},503);}
}};
