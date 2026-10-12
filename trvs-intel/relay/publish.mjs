#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export async function publishCapsule({path,baseUrl,token}){
  if(!token||token.length<24)throw new Error('TRVS_RELAY_ADMIN_TOKEN required');
  if(!baseUrl)throw new Error('Relay URL required');
  const url=new URL('/v1/capsules',baseUrl);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname))){
    throw new Error('HTTPS required outside localhost');
  }
  const source=JSON.parse(await readFile(path,'utf8'));
  const response=await fetch(url,{
    method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},
    body:JSON.stringify(source),signal:AbortSignal.timeout(10000)
  });
  const result=await response.json();
  if(!response.ok)throw new Error('Relay rejected ('+response.status+'): '+(result.error||'unknown error'));
  return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(!process.argv[2]){console.error('Usage: node trvs-intel/relay/publish.mjs capsule.json');process.exitCode=2}
  else try{
    const result=await publishCapsule({
      path:process.argv[2],baseUrl:process.env.TRVS_RELAY_URL||'http://127.0.0.1:8787',
      token:process.env.TRVS_RELAY_ADMIN_TOKEN
    });
    console.log(JSON.stringify(result,null,2));
  }catch(e){console.error(e.message);process.exitCode=1}
}