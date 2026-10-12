import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile, appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEMA='urn:trvs:intel:injection-capsule:v0.3';
const CANONICAL='https://trillsverse.com/intelligence-injections';
const DEFINITIONS=new Set(['formal','natural','mixed','undetermined']);
const REFERENTS=new Set(['concrete','abstract','mixed','undetermined']);
const METHODS=new Set(['heuristic-suggestion','manual-user-selected']);
class InputError extends Error {}
const ensure=(p,msg)=>{if(!p)throw new InputError(msg)};
const text=(s,max,name)=>{ensure(typeof s==='string'&&s.trim().length>0&&s.length<=max&&!/[\u0000-\u001f\u007f]/.test(s),'invalid '+name);return s.trim()};
function sourceUrl(value) {
  const str=text(value,1500,'source URL');
  let u;try{u=new URL(str)}catch{throw new InputError('invalid source URL')}
  ensure(u.protocol==='https:'&&!u.username&&!u.password,'source URL must be HTTPS');
  ensure(!u.search&&!u.hash,'strip query and fragment before publishing');
  ensure(Boolean(u.hostname)&&!/^(localhost|.+\.localhost|.+\.local)$/i.test(u.hostname),'invalid source host');
  ensure(!/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)&&!u.hostname.includes(':'),'IP literal source forbidden');
  return u.href;
}
function normalize(c) {
  ensure(c&&typeof c==='object'&&!Array.isArray(c),'capsule object required');
  ensure(c.schema===SCHEMA,'unsupported capsule schema');
  ensure(c.origin?.canonical_source===CANONICAL,'unknown canonical origin');
  const ref=c.contextual_reference, d=c.concept?.definition_axis, r=c.concept?.referent_axis;
  ensure(ref&&typeof ref==='object','missing reference');
  ensure(DEFINITIONS.has(d?.value)&&METHODS.has(d?.method),'invalid definition axis');
  ensure(REFERENTS.has(r?.value)&&METHODS.has(r?.method),'invalid referent axis');
  let parent=c.propagation?.parent_capsule_id||null;
  if(parent){parent=text(parent,100,'parent capsule ID');ensure(/^sha256:[a-f0-9]{64}$/.test(parent),'parent must be a relay SHA256 ID')}
  // Do not persist arbitrary sender-provided evidence, excerpts, client IDs, or tracking fields.
  return {
    schema:'urn:trvs:intel:relay-record:v1',
    origin:CANONICAL,
    contextual_reference:{
      title:text(ref.title,200,'title'), url:sourceUrl(ref.url),
      category:text(ref.category,80,'category'),
      question:text(ref.question,400,'question')
    },
    concept:{
      definition_axis:{value:d.value,method:d.method},
      referent_axis:{value:r.value,method:r.method},
      semantic_validity_verified:false
    },
    propagation:{parent_capsule_id:parent}
  };
}
const hash=o=>'sha256:'+createHash('sha256').update(JSON.stringify(o)).digest('hex');
function sameToken(actual,secret){
  const a=Buffer.from(actual||''), b=Buffer.from('Bearer '+secret);
  return a.length===b.length&&timingSafeEqual(a,b);
}
function send(res,status,payload){
  const body=JSON.stringify(payload);
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'content-length':Buffer.byteLength(body),
    'cache-control':'no-store',
    'referrer-policy':'no-referrer',
    'x-content-type-options':'nosniff'
  });res.end(body);
}
export async function createRelayServer({dataPath,token}){
  if(!token||typeof token!=='string'||token.length<24)throw new Error('TRVS_RELAY_ADMIN_TOKEN (24+ characters) required');
  if(!dataPath)throw new Error('dataPath required');
  const store=new Map();
  try{
    const journal=await readFile(dataPath,'utf8');
    for(const line of journal.split('\n').filter(Boolean)){
      const entry=JSON.parse(line);
      if(entry.id!==hash(entry.record))throw new Error('journal integrity mismatch');
      store.set(entry.id,entry);
    }
  }catch(e){if(e.code!=='ENOENT')throw e}
  await mkdir(dirname(dataPath),{recursive:true});
  let queue=Promise.resolve();
  const app=http.createServer(async(req,res)=>{
    try{
      const path=new URL(req.url||'/', 'http://local').pathname;
      if(req.method==='GET'&&path==='/health')return send(res,200,{status:'ready',records:store.size});
      const m=/^\/v1\/capsules\/(sha256:[a-f0-9]{64})(\/children)?$/.exec(path);
      if(req.method==='GET'&&m){
        if(!store.has(m[1]))return send(res,404,{error:'not found'});
        if(m[2]){
          return send(res,200,{parent_id:m[1],children:[...store.values()].filter(v=>v.record.propagation.parent_capsule_id===m[1]).map(v=>v.id)});
        }
        return send(res,200,store.get(m[1]));
      }
      if(req.method==='POST'&&path==='/v1/capsules'){
        if(!sameToken(req.headers.authorization,token))return send(res,401,{error:'publisher authorization required'});
        if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))return send(res,415,{error:'application/json required'});
        let size=0;const chunks=[];
        for await(const chunk of req){
          size+=chunk.length;
          if(size>16384)return send(res,413,{error:'capsule too large'});
          chunks.push(chunk);
        }
        let parsed;try{parsed=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return send(res,400,{error:'invalid JSON'})}
        const record=normalize(parsed);
        const id=hash(record),parent=record.propagation.parent_capsule_id;
        // Serialize idempotency with append-only commit to avoid concurrent double-publishing.
        const transaction=queue.then(async()=>{
          if(store.has(id))return {status:200,value:{...store.get(id),already_exists:true}};
          if(parent&&!store.has(parent))return {status:422,value:{error:'parent not found in this relay'}};
          const entry={id,record,receipt:{
            type:'relay-published-record',issued_at:new Date().toISOString(),
            parent_relation_verified_in_local_store:Boolean(parent),
            recipient_encounter_verified:false,downstream_influence_verified:false
          }};
          await appendFile(dataPath,JSON.stringify(entry)+'\n',{encoding:'utf8',mode:0o600,flag:'a'});
          store.set(id,entry);
          return {status:201,value:entry};
        });
        queue=transaction.then(()=>undefined,()=>undefined);
        const result=await transaction;
        return send(res,result.status,result.value);
      }
      return send(res,404,{error:'unknown route'});
    }catch(e){
      return e instanceof InputError?send(res,422,{error:e.message}):send(res,500,{error:'relay internal error'});
    }
  });
  app.requestTimeout=10000;app.headersTimeout=10000;
  return app;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const app=await createRelayServer({
    dataPath:process.env.TRVS_RELAY_DATA||'./data/trvs-intel-relay.jsonl',
    token:process.env.TRVS_RELAY_ADMIN_TOKEN
  });
  app.listen(Number(process.env.PORT||8787),process.env.HOST||'127.0.0.1',()=>{
    const a=app.address();console.log('TRVS.INTEL relay '+a.address+':'+a.port);
  });
}