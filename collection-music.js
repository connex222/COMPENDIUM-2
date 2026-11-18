/* The Compendium II: original, optional chamber music. Sound effects stay independent. */
(()=>{
 'use strict';
 const host=document.querySelector('.bar');
 if(!host)return;
 const style=document.createElement('style');
 style.textContent=`
   .bar{flex-wrap:wrap}
   #compendiumMusic{flex:0 0 auto;min-height:44px;padding:7px 9px;border:1px solid var(--hair);border-radius:9px;background:var(--plate);color:var(--ink);font:700 12px/1.2 system-ui,sans-serif;cursor:pointer}
   #compendiumMusic:focus-visible{outline:3px solid var(--gilt);outline-offset:2px}
   #back:not([hidden]){width:auto;display:inline-flex;align-items:center;gap:4px;padding:0 8px;min-height:44px}
   #back:not([hidden])::after{content:"Lobby";font:700 12px system-ui,sans-serif}
   @media(max-width:400px){.bar{gap:5px;padding-inline:9px}.bar h1{font-size:clamp(16px,5vw,21px)}#compendiumMusic{padding:6px;font-size:11px}}
 `;
 document.head.appendChild(style);
 const back=document.getElementById('back');
 if(back){back.setAttribute('aria-label','Back to Lobby');back.title='Back to Lobby';}
 const btn=document.createElement('button');
 btn.type='button';
 btn.id='compendiumMusic';
 btn.textContent='♫ Music';
 btn.title='Toggle The Compendium II original soundtrack';
 btn.setAttribute('aria-pressed','false');
 btn.setAttribute('aria-label','Play background music');
 const audio=new Audio('https://cdn.creativeclaw.co/u/f3e7a3b1/audio/c9340182-d934-4002-ba81-935308fd0ec4.mp3');
 audio.loop=true;audio.preload='none';audio.volume=.075;
 let playing=false;
 const sync=()=>{btn.setAttribute('aria-pressed',String(playing));btn.textContent=playing?'♫ Music on':'♫ Music off';btn.setAttribute('aria-label',playing?'Mute background music':'Play background music');};
 btn.addEventListener('click',()=>{
   if(playing){playing=false;audio.pause();sync();return;}
   audio.play().then(()=>{playing=true;sync()}).catch(()=>{playing=false;sync()});
 });
 document.addEventListener('visibilitychange',()=>{
   if(document.hidden)audio.pause();
   else if(playing)audio.play().catch(()=>{playing=false;sync()});
 });
 window.addEventListener('pagehide',()=>audio.pause());
 host.appendChild(btn);sync();
})();
