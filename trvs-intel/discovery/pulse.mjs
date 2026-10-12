import {readFile,writeFile} from 'node:fs/promises';
/* TRVS.INTEL owned-site discovery. Public HTML only; notification receipt != indexing. */
export const SITES=[
{host:'trillsverse.com',key:'TRVS_INDEXNOW_TRILLSVERSE_KEY'},
{host:'lultrills.com',key:'TRVS_INDEXNOW_LULTRILLS_KEY'},
{host:'mymindmine.com',key:'TRVS_INDEXNOW_MYMINDMINE_KEY'},
{host:'reallythatmagazine.com',key:'TRVS_INDEXNOW_REALLYTHAT_KEY'}];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const retryable=new Set([408,429,500,502,503,504]);
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const tag=(s,t)=>decode((s.match(new RegExp('<(?:[\\w-]+:)?'+t+'\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?'+t+'\\s*>','i'))||[,''])[1].trim());
export function parseSitemap(xml){
 const pages=[],nested=[];
 for(const m of xml.matchAll(/<(?:[\w-]+:)?(url|sitemap)\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?\1\s*>/gi)){
  const loc=tag(m[2],'loc');if(!loc)continue;
  if(m[1].toLowerCase()==='sitemap')nested.push(loc);
  else pages.push({url:loc,lastmod:tag(m[2],'lastmod')||null});
 }
 return {pages,nested};
}
export function owned(raw,host,xml=false){
 try{
  const u=new URL(raw);
  if(u.protocol!=='https:'||!([host,'www.'+host].includes(u.hostname))||u.port||u.username||u.password||u.search||u.hash)return null;
  if(/\/(?:admin|wp-admin|login|checkout|cart)(?:\/|$)/i.test(u.pathname))return null;
  if(!xml&&/\.(xml|txt|json|gz|zip|js|css)$/i.test(u.pathname))return null;
  return u.toString();
 }catch{return null;}
}
async function req(url,opts={},get=fetch){
 for(let i=0;i<3;i++){
  let r;
  try{r=await get(url,{...opts,redirect:'manual',signal:AbortSignal.timeout(12000)});}
  catch(e){if(i===2)throw Error('network_failure');await sleep(250*(i+1));continue;}
  if(retryable.has(r.status)&&i<2){await r.body?.cancel?.();await sleep(250*(i+1));continue;}
  return r;
 }
}
async function retrieve(url,host,get=fetch,limit=2000000){
 for(let i=0;i<3;i++){
  const r=await req(url,{},get);
  if([301,302,307,308].includes(r.status)){
   const loc=r.headers.get('location');
   const dest=loc?owned(new URL(loc,url).toString(),host,true):null;
   if(!dest)throw Error('unsafe_redirect');
   await r.body?.cancel?.();url=dest;continue;
  }
  if(r.status!==200)throw Error('http_'+r.status);
  if(Number(r.headers.get('content-length')||0)>limit)throw Error('too_large');
  const body=await r.text();
  if(Buffer.byteLength(body)>limit)throw Error('too_large');
  return {body,url,headers:r.headers};
 }
 throw Error('redirect_limit');
}
export async function discover(site,get=fetch){
 const todo=['https://'+site.host+'/sitemap.xml','https://'+site.host+'/sitemap_index.xml'];
 const seen=new Set(),pages=new Map();let valid=0;
 while(todo.length&&seen.size<20&&pages.size<5000){
  const url=owned(todo.shift(),site.host,true);
  if(!url||seen.has(url))continue;seen.add(url);
  try{
   const xml=await retrieve(url,site.host,get);
   const data=parseSitemap(xml.body);
   if(!data.pages.length&&!data.nested.length)continue;
   valid++;
   for(const p of data.pages){const u=owned(p.url,site.host);if(u&&pages.size<5000)pages.set(u,p.lastmod);}
   for(const item of data.nested){const u=owned(item,site.host,true);if(u&&!seen.has(u)&&todo.length<40)todo.push(u);}
  }catch{}
 }
 if(!valid||!pages.size)throw Error('no_readable_sitemap');
 return pages;
}
export async function verifyPage(url,host,get=fetch){
 const r=await retrieve(url,host,get,1000000);
 if(!/text\/html/i.test(r.headers.get('content-type')||''))throw Error('not_html');
 if(/\b(?:noindex|none)\b/i.test(r.headers.get('x-robots-tag')||''))throw Error('noindex');
 const head=r.body.split(/<\/head\s*>/i)[0].slice(0,120000);
 for(const m of head.matchAll(/<meta\b[^>]*>/gi)){
  if(/\bname\s*=\s*["']?(?:robots|googlebot|bingbot)\b/i.test(m[0])&&/\b(?:noindex|none)\b/i.test(m[0]))throw Error('noindex');
 }
 for(const m of head.matchAll(/<link\b[^>]*>/gi)){
  if(!/\brel\s*=\s*["']?canonical\b/i.test(m[0]))continue;
  const h=m[0].match(/\bhref\s*=\s*["']([^"']+)["']/i);
  if(h){
   const canonical=owned(new URL(h[1],r.url).toString(),host);
   if(!canonical||new URL(canonical).pathname!==new URL(url).pathname)throw Error('noncanonical');
  }
 }
 return r.url;
}
async function validKey(host,base,key,get){
 if(!/^[a-zA-Z0-9-]{8,128}$/.test(key))return false;
 try{return (await retrieve('https://'+host+'/'+key+'.txt',base,get,512)).body.trim()===key;}catch{return false;}
}
export async function runPulse({oldState,sites=SITES,keys={},get=fetch,now=new Date().toISOString(),cap=40}={}){
 const state=oldState?structuredClone(oldState):{schema:'trvs.intel.discovery/v1',sites:{}};
 if(state.schema!=='trvs.intel.discovery/v1'||typeof state.sites!=='object')throw Error('invalid_state');
 const events=[];
 const record=o=>events.push({at:now,...o});
 for(const site of sites){
  try{
   const pages=await discover(site,get),prev=state.sites[site.host];
   if(!prev){
    state.sites[site.host]={urls:Object.fromEntries([...pages].map(([u,lastmod])=>[u,{lastmod,status:'baseline'}])),lastSuccess:now};
    record({host:site.host,event:'baseline',count:pages.size});continue;
   }
   const pending=[],groups=new Map();
   for(const [url,lastmod] of pages){
    const old=prev.urls[url];
    if(!old||old.lastmod!==lastmod)prev.urls[url]={lastmod,status:'pending'};
    if(prev.urls[url].status==='pending')pending.push(url);
   }
   for(const url of pending.slice(0,cap)){
    const item=prev.urls[url];
    try{
     if(!item.verifiedAt||Date.parse(now)-Date.parse(item.verifiedAt)>3600000){
      await verifyPage(url,site.host,get);item.verifiedAt=now;
     }
     const host=new URL(url).hostname;
     if(!groups.has(host))groups.set(host,[]);
     groups.get(host).push(url);
     record({host:site.host,event:'verified_change',url});
    }catch(e){record({host:site.host,event:'verification_failed',url,reason:e.message});}
   }
   const key=keys[site.key];
   for(const [host,urls] of groups){
    if(!key){record({host,event:'key_unconfigured',count:urls.length});continue;}
    if(!await validKey(host,site.host,key,get)){record({host,event:'key_unverified',count:urls.length});continue;}
    try{
     const r=await req('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({host,key,urlList:urls})},get);
     if(![200,202].includes(r.status))throw Error('indexnow_http_'+r.status);
     await r.body?.cancel?.();
     for(const url of urls){prev.urls[url].status='notified';prev.urls[url].notifiedAt=now;}
     record({host,event:'indexnow_received',status:r.status,urls});
    }catch(e){record({host,event:'indexnow_failed',reason:e.message,count:urls.length});}
   }
   prev.lastSuccess=now;
   record({host:site.host,event:'scan_complete',found:pages.size,pending:pending.length,checked:Math.min(cap,pending.length)});
  }catch(e){record({host:site.host,event:'scan_failed',reason:e.message});}
 }
 state.updated=now;return {state,events};
}
if(process.argv[1]&&import.meta.url==='file://'+process.argv[1]){
 const path=process.env.TRVS_PULSE_STATE||'/tmp/trvs-discovery-state.json';
 let oldState;
 try{oldState=JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const {state,events}=await runPulse({oldState,keys:process.env});
 await writeFile(process.env.TRVS_PULSE_OUT||'/tmp/trvs-discovery-next.json',JSON.stringify(state,null,2)+'\n');
 await writeFile(process.env.TRVS_PULSE_RECEIPTS||'/tmp/trvs-discovery-events.jsonl',events.map(x=>JSON.stringify(x)).join('\n')+'\n');
 await writeFile(process.env.TRVS_PULSE_RESULT||'/tmp/trvs-discovery-result.json',JSON.stringify({allFailed:events.filter(x=>x.event==='scan_failed').length===SITES.length}));
 console.log(JSON.stringify({hosts:SITES.length,events:events.reduce((m,x)=>(m[x.event]=(m[x.event]||0)+1,m),{})}));
}
