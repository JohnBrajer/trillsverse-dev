import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSitemap,owned,runPulse,SITES,PUBLIC_INDEXNOW_KEY} from '../discovery/pulse.mjs';
const site=SITES[0],KEY='testIndexNowKey09';
const sitemap=urls=>'<urlset>'+urls.map(([u,date])=>'<url><loc>'+u+'</loc><lastmod>'+date+'</lastmod></url>').join('')+'</urlset>';
function fake({urls=[['https://trillsverse.com/one','1']],html='<html><head><link rel="canonical" href="https://trillsverse.com/two"></head></html>',key=true,post=200,fail=false}={}){
 const calls=[];
 async function get(u,opt={}){
  const url=String(u);calls.push({url,method:opt.method||'GET'});
  if(fail)throw Error('offline');
  if(url.endsWith('/sitemap.xml'))return new Response(sitemap(urls),{status:200,headers:{'content-type':'text/xml'}});
  if(url.endsWith('/sitemap_index.xml'))return new Response('not found',{status:404});
  if(url.endsWith(KEY+'.txt'))return new Response(KEY,{status:key?200:404});
  if(url.endsWith(PUBLIC_INDEXNOW_KEY+'.txt'))return new Response(PUBLIC_INDEXNOW_KEY,{status:key?200:404});
  if(url==='https://api.indexnow.org/indexnow')return new Response('ok',{status:post});
  if(url.endsWith('/two'))return new Response(html,{status:200,headers:{'content-type':'text/html'}});
  return new Response('not found',{status:404});
 }
 return {get,calls};
}
test('parse sitemap and decode XML entities',()=>{
 const result=parseSitemap('<urlset><url><loc>https://trillsverse.com/a&amp;b</loc><lastmod>y</lastmod></url></urlset>');
 assert.equal(result.pages[0].url,'https://trillsverse.com/a&b');
});
test('reject external domains and unsafe URLs',()=>{
 assert.equal(owned('https://trillsverse.com.evil.test/path',site.host),null);
 assert.equal(owned('http://trillsverse.com/path',site.host),null);
 assert.equal(owned('https://trillsverse.com/private?token=1',site.host),null);
 assert.ok(owned('https://www.trillsverse.com/article',site.host));
});
test('first scan creates baseline, not a burst of notifications',async()=>{
 const f=fake(),r=await runPulse({sites:[site],get:f.get});
 assert.equal(r.events[0].event,'baseline');
 assert.equal(r.state.sites[site.host].urls['https://trillsverse.com/one'].status,'baseline');
 assert.equal(f.calls.some(c=>c.url.includes('indexnow.org')),false);
});
test('new public URL is verified and submitted after key verification',async()=>{
 const base=(await runPulse({sites:[site],get:fake().get})).state;
 const f=fake({urls:[['https://trillsverse.com/one','1'],['https://trillsverse.com/two','2']]});
 const r=await runPulse({oldState:base,sites:[site],get:f.get,keys:{[site.key]:KEY}});
 assert.equal(r.state.sites[site.host].urls['https://trillsverse.com/two'].status,'notified');
 assert.ok(r.events.some(x=>x.event==='indexnow_received'));
 assert.ok(f.calls.some(x=>x.url==='https://api.indexnow.org/indexnow'&&x.method==='POST'));
});
test('validated public key sends changed-page notification without repository secrets',async()=>{
 const base=(await runPulse({sites:[site],get:fake().get})).state;
 const f=fake({urls:[['https://trillsverse.com/one','1'],['https://trillsverse.com/two','2']]});
 const r=await runPulse({oldState:base,sites:[site],get:f.get});
 assert.equal(r.state.sites[site.host].urls['https://trillsverse.com/two'].status,'notified');
 assert.ok(r.events.some(x=>x.event==='indexnow_received'&&x.status===200));
 assert.ok(f.calls.some(c=>c.url==='https://trillsverse.com/'+PUBLIC_INDEXNOW_KEY+'.txt'));
 assert.ok(f.calls.some(c=>c.url==='https://api.indexnow.org/indexnow'&&c.method==='POST'));
});
test('unverified public fallback keeps change pending and does not invent a receipt',async()=>{
 const base=(await runPulse({sites:[site],get:fake().get})).state;
 const r=await runPulse({oldState:base,sites:[site],get:fake({urls:[['https://trillsverse.com/one','1'],['https://trillsverse.com/two','2']],key:false}).get});
 assert.equal(r.state.sites[site.host].urls['https://trillsverse.com/two'].status,'pending');
 assert.ok(r.events.some(x=>x.event==='key_unverified'));
});
test('noindex page is never notified',async()=>{
 const base=(await runPulse({sites:[site],get:fake().get})).state;
 const f=fake({urls:[['https://trillsverse.com/one','1'],['https://trillsverse.com/two','2']],html:'<html><head><meta name="robots" content="noindex"></head></html>'});
 const r=await runPulse({oldState:base,sites:[site],get:f.get,keys:{[site.key]:KEY}});
 assert.ok(r.events.some(x=>x.event==='verification_failed'&&x.reason==='noindex'));
 assert.equal(f.calls.some(x=>x.url.includes('indexnow.org')),false);
});
test('IndexNow 503 retries and retains pending change',async()=>{
 const base=(await runPulse({sites:[site],get:fake().get})).state;
 const f=fake({urls:[['https://trillsverse.com/one','1'],['https://trillsverse.com/two','2']],post:503});
 const r=await runPulse({oldState:base,sites:[site],get:f.get,keys:{[site.key]:KEY}});
 assert.equal(f.calls.filter(x=>x.url.includes('indexnow.org')).length,3);
 assert.equal(r.state.sites[site.host].urls['https://trillsverse.com/two'].status,'pending');
 assert.ok(r.events.some(x=>x.event==='indexnow_failed'));
});
test('site outage never erases existing knowledge',async()=>{
 const base=(await runPulse({sites:[site],get:fake().get})).state;
 const r=await runPulse({oldState:base,sites:[site],get:fake({fail:true}).get});
 assert.deepEqual(r.state.sites[site.host].urls,base.sites[site.host].urls);
 assert.ok(r.events.some(x=>x.event==='scan_failed'));
});
