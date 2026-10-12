(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const canonical='https://trillsverse.com/intelligence-injections';
  let page=null;
  const sources={definition:'heuristic-suggestion',referent:'heuristic-suggestion'};
  const words=(v,max)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,max);
  function infer(haystack,positive,negative,left,right){
    const a=positive.test(haystack),b=negative.test(haystack);
    return a&&b?'mixed':a?left:b?right:'undetermined';
  }
  async function load() {
    try {
      const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
      if(!tab?.id)throw new Error('No active browser tab');
      const [result]=await chrome.scripting.executeScript({
        target:{tabId:tab.id},
        func:()=>({title:document.title||document.querySelector('h1')?.textContent||'Untitled',
          url:location.href, selection:window.getSelection()?.toString()||'',
          excerpt:Array.from(document.querySelectorAll('article p, main p')).slice(0,5).map(p=>p.textContent||'').join(' ').slice(0,1000)})
      });
      const raw=result?.result;
      if(!raw)throw new Error('No readable page context');
      const parsed=new URL(raw.url);
      if(parsed.protocol!=='https:')throw new Error('Only HTTPS pages are supported');
      parsed.search='';parsed.hash='';parsed.username='';parsed.password='';
      page={title:words(raw.title,200),url:parsed.href,
        snippet:words(raw.selection||raw.excerpt,1100)};
      $('title').textContent=page.title;
      $('source').textContent=page.url;
      const haystack=(page.title+' '+page.snippet).toLowerCase();
      $('definition').value=infer(haystack,/\b(defined as|rules?|axiom|prime number|specification|must satisfy)\b/i,
        /\b(usually|often|similar|prototype|fuzzy|experience|culture)\b/i,'formal','natural');
      $('referent').value=infer(haystack,/\b(chair|car|dog|animal|tree|object|physical|device|material)\b/i,
        /\b(justice|love|democracy|idea|meaning|freedom|relationship|risk|concept)\b/i,'concrete','abstract');
      $('copy').disabled=false;
      $('status').textContent='Review the concept axes before copying.';
    } catch(error) {
      $('title').textContent='Cannot inspect this page';
      $('status').textContent=error?.message||'Permission denied';
    }
  }
  for(const axis of ['definition','referent']){
    $(axis).addEventListener('change',()=>{sources[axis]='manual-user-selected'});
  }
  $('copy').addEventListener('click',async()=>{
    if(!page)return;
    const parent=words($('parent').value,71)||null;
    if(parent&&!/^sha256:[a-f0-9]{64}$/.test(parent)){
      $('status').textContent='Parent must be a relay sha256: ID';return;
    }
    const question=words($('question').value,400);
    if(!question){$('status').textContent='Research question required';return}
    const capsule={
      schema:'urn:trvs:intel:injection-capsule:v0.3',
      version:'0.4.0',origin:{framework:'Intelligence Injections',canonical_source:canonical},
      contextual_reference:{title:page.title,url:page.url,
        url_sanitization:'query-and-fragment-removed',category:'GENERAL / OPEN FIELD',question},
      concept:{definition_axis:{value:$('definition').value,method:sources.definition},
        referent_axis:{value:$('referent').value,method:sources.referent},
        semantic_validity_verified:false},
      propagation:{parent_capsule_id:parent,parent_relation_verified:false,
        mode:'manual-user-authorized',shared_or_published:false,
        observable_downstream_events:false}
    };
    const json=JSON.stringify(capsule,null,2);
    try{await navigator.clipboard.writeText(json);$('status').textContent='Copied. Save JSON locally, then publish using the operator CLI.'}
    catch{
      const box=document.createElement('textarea');
      box.value=json;box.setAttribute('aria-label','Capsule JSON');box.readOnly=true;
      $('status').replaceChildren(box);box.focus();box.select();
    }
  });
  load();
})();