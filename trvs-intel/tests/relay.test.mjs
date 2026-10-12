import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,appendFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRelayServer} from '../relay/server.mjs';
import {publishCapsule} from '../relay/publish.mjs';

const TOKEN='test-token-123456789012345678901234';
const fixture=(parent=null)=>({
  schema:'urn:trvs:intel:injection-capsule:v0.3',
  origin:{canonical_source:'https://trillsverse.com/intelligence-injections'},
  contextual_reference:{
    title:'Formal and natural concepts',url:'https://example.org/research/concepts',
    category:'GENERAL / OPEN FIELD',question:'What can we verify?'
  },
  concept:{
    definition_axis:{value:'formal',method:'manual-user-selected'},
    referent_axis:{value:'abstract',method:'heuristic-suggestion'}
  },
  propagation:{parent_capsule_id:parent}
});
async function setup(t){
  const dir=await mkdtemp(join(tmpdir(),'trvs-relay-'));
  const path=join(dir,'journal.jsonl');
  const app=await createRelayServer({dataPath:path,token:TOKEN});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>app.close(resolve));await rm(dir,{recursive:true,force:true})});
  return {base:'http://127.0.0.1:'+app.address().port,path,app};
}
async function post(base,data,token=TOKEN){
  const res=await fetch(base+'/v1/capsules',{method:'POST',headers:{
    'authorization':'Bearer '+token,'content-type':'application/json'
  },body:JSON.stringify(data)});
  return {status:res.status,body:await res.json()};
}
test('fail closed without publisher token',async()=>{
  await assert.rejects(createRelayServer({dataPath:'./x',token:'short'}),/24/);
});
test('reject anonymous publication',async t=>{
  const {base}=await setup(t);
  assert.equal((await post(base,fixture(),'wrong')).status,401);
});
test('create, retrieve, deduplicate and persist capsule',async t=>{
  const {base,path}=await setup(t);
  const first=await post(base,fixture());
  assert.equal(first.status,201);
  assert.match(first.body.id,/^sha256:[a-f0-9]{64}$/);
  assert.equal(first.body.receipt.recipient_encounter_verified,false);
  const again=await post(base,fixture());
  assert.equal(again.status,200);
  assert.equal(again.body.id,first.body.id);
  const get=await(await fetch(base+'/v1/capsules/'+first.body.id)).json();
  assert.equal(get.record.concept.definition_axis.value,'formal');
  assert.equal((await readFile(path,'utf8')).trim().split('\n').length,1);
});
test('validates local parent graph',async t=>{
  const {base}=await setup(t);
  assert.equal((await post(base,fixture('sha256:'+'a'.repeat(64)))).status,422);
  const root=await post(base,fixture());
  const child=await post(base,fixture(root.body.id));
  assert.equal(child.status,201);
  assert.equal(child.body.receipt.parent_relation_verified_in_local_store,true);
  const graph=await(await fetch(base+'/v1/capsules/'+root.body.id+'/children')).json();
  assert.deepEqual(graph.children,[child.body.id]);
});
test('rejects privacy-leaking URLs and invalid concepts',async t=>{
  const {base}=await setup(t);
  for(const url of ['http://example.org/path','https://example.org/path?secret=1','https://127.0.0.1/private']){
    const c=fixture();c.contextual_reference.url=url;
    assert.equal((await post(base,c)).status,422);
  }
  const c=fixture();c.concept.definition_axis.value='absolutely-sure';
  assert.equal((await post(base,c)).status,422);
});
test('concurrent duplicate writes are serialized',async t=>{
  const {base,path}=await setup(t);
  const outcomes=await Promise.all(Array.from({length:12},()=>post(base,fixture())));
  assert.equal(outcomes.filter(o=>o.status===201).length,1);
  assert.equal((await readFile(path,'utf8')).trim().split('\n').length,1);
});
test('CLI publish consumes a copied extension capsule',async t=>{
  const {base}=await setup(t);
  const dir=await mkdtemp(join(tmpdir(),'trvs-cli-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const file=join(dir,'capsule.json');await writeFile(file,JSON.stringify(fixture()));
  const record=await publishCapsule({path:file,baseUrl:base,token:TOKEN});
  assert.match(record.id,/^sha256:/);
  await assert.rejects(publishCapsule({path:file,baseUrl:'http://example.org',token:TOKEN}),/HTTPS/);
});

test('rejects private hostname aliases and single-label intranet hosts',async t=>{
  const {base,path}=await setup(t);
  for(const host of ['localhost.','host.local.','host.localhost.','intranet','intranet.']){
    const c=fixture();c.contextual_reference.url='https://'+host+'/private';
    assert.equal((await post(base,c)).status,422,host);
  }
  await assert.rejects(readFile(path),{code:'ENOENT'});
});
test('preserves ordinary public fully qualified source URLs',async t=>{
  const {base}=await setup(t);
  const c=fixture();c.contextual_reference.url='https://example.org./research';
  assert.equal((await post(base,c)).status,201);
});
test('rejects falsy non-null parent IDs instead of publishing roots',async t=>{
  const {base,path}=await setup(t);
  for(const parent of [false,0,'']){
    assert.equal((await post(base,fixture(parent))).status,422,JSON.stringify(parent));
  }
  await assert.rejects(readFile(path),{code:'ENOENT'});
});
test('absent and explicit null parents remain equivalent roots',async t=>{
  const {base}=await setup(t);
  const c=fixture();delete c.propagation.parent_capsule_id;
  const first=await post(base,c),again=await post(base,fixture(null));
  assert.equal(first.status,201);assert.equal(again.status,200);
  assert.equal(first.body.id,again.body.id);
});
async function reopen(t,path){
  const app=await createRelayServer({dataPath:path,token:TOKEN});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>app.close(resolve)));
  return 'http://127.0.0.1:'+app.address().port;
}
test('quarantines a torn final fragment and preserves committed graph across restarts',async t=>{
  const {base,path,app}=await setup(t);
  const root=await post(base,fixture()),child=await post(base,fixture(root.body.id));
  await new Promise(resolve=>app.close(resolve));
  const committed=await readFile(path);
  const tail=Buffer.from('{"id":"sha256:partial');
  await appendFile(path,tail);
  const restarted=await reopen(t,path);
  assert.deepEqual(await readFile(path),committed);
  assert.deepEqual(await readFile(path+'.torn-tail'),tail);
  assert.equal((await post(restarted,fixture())).status,200);
  const graph=await(await fetch(restarted+'/v1/capsules/'+root.body.id+'/children')).json();
  assert.deepEqual(graph.children,[child.body.id]);
  const c=fixture();c.contextual_reference.question='New after recovery';
  assert.equal((await post(restarted,c)).status,201);
  const second=await reopen(t,path);
  assert.equal((await(await fetch(second+'/health')).json()).records,3);
});
test('recovery reuses an identical quarantine left before truncation',async t=>{
  const {base,path,app}=await setup(t);await post(base,fixture());
  await new Promise(resolve=>app.close(resolve));
  const tail=Buffer.from('{"partial":');
  await appendFile(path,tail);await writeFile(path+'.torn-tail',tail);
  assert.equal((await(await fetch((await reopen(t,path))+'/health')).json()).records,1);
});
test('recovery fails closed when an earlier quarantine differs',async t=>{
  const {base,path,app}=await setup(t);await post(base,fixture());
  await new Promise(resolve=>app.close(resolve));
  await appendFile(path,'{"partial":');await writeFile(path+'.torn-tail','earlier evidence');
  const original=await readFile(path);
  await assert.rejects(createRelayServer({dataPath:path,token:TOKEN}),/quarantine/);
  assert.deepEqual(await readFile(path),original);
});
test('a valid final record without newline is preserved before subsequent append',async t=>{
  const {base,path,app}=await setup(t);const first=await post(base,fixture());
  await new Promise(resolve=>app.close(resolve));
  await writeFile(path,(await readFile(path,'utf8')).trimEnd());
  const restarted=await reopen(t,path);
  assert.equal((await post(restarted,fixture())).body.id,first.body.id);
  const c=fixture();c.contextual_reference.question='Another record';
  assert.equal((await post(restarted,c)).status,201);
  assert.equal((await(await fetch((await reopen(t,path))+'/health')).json()).records,2);
});
test('complete malformed lines are corruption and remain untouched',async t=>{
  const {base,path,app}=await setup(t);await post(base,fixture());
  await new Promise(resolve=>app.close(resolve));
  const journal=await readFile(path,'utf8');
  for(const corrupt of ['not-json\n'+journal,journal+'not-json\n']){
    await writeFile(path,corrupt);
    await assert.rejects(createRelayServer({dataPath:path,token:TOKEN}),SyntaxError);
    assert.equal(await readFile(path,'utf8'),corrupt);
  }
});
test('a complete final record with a wrong hash is never quarantined as a torn write',async t=>{
  const {base,path,app}=await setup(t);await post(base,fixture());
  await new Promise(resolve=>app.close(resolve));
  const entry=JSON.parse((await readFile(path,'utf8')).trim());entry.id='sha256:'+'0'.repeat(64);
  const corrupt=JSON.stringify(entry);await writeFile(path,corrupt);
  await assert.rejects(createRelayServer({dataPath:path,token:TOKEN}),/integrity/);
  assert.equal(await readFile(path,'utf8'),corrupt);
});
