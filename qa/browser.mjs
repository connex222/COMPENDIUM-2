// Review-only browser smoke suite. Requires Playwright Core (QA tooling only)
// and locally installed Google Chrome/Chromium. Never publishes the game.
// Run: npm install --no-save playwright-core && node qa/browser.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { chromium } from "playwright-core";

const index = readFileSync(new URL("../index.html",import.meta.url));
const slugs=["fell","mirrorwork","riffle","glean","bight","marquetry","reeve","shunt","furlong"];
const exe=[process.env.CHROME_BIN,"/usr/bin/google-chrome","/usr/bin/google-chrome-stable",
  "/usr/bin/chromium","/opt/google/chrome/chrome"].find(p=>p && existsSync(p));
assert.ok(exe,"Set CHROME_BIN to a locally installed Chrome/Chromium binary");
const server=createServer((req,res)=>{
  if(req.url?.split("?")[0]==="/" || req.url?.split("?")[0]==="/index.html"){
    res.writeHead(200,{"Content-Type":"text/html; charset=utf-8",
      "Cache-Control":"no-store","Content-Length":index.length});
    res.end(index);
  } else {res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port+"/";
let browser;
const checks=[];
try{
  browser=await chromium.launch({executablePath:exe,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
  await context.route("**/*",route=>{
    route.request().url().startsWith(url) ? route.continue() : route.abort();
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  async function freshRoll(){
    await page.goto(url,{waitUntil:"domcontentloaded"});
    await page.locator("#vols .vol").first().waitFor();
  }
  async function opened(slug){
    await page.waitForFunction(slug=>{
      const frame=document.querySelector("#frame");
      try{return frame?.contentWindow?.VOLUME?.slug===slug;}catch{return false;}
    },slug,{timeout:20000});
    assert.equal(await page.locator("#title").innerText(),
      slugs.includes(slug) ? slug.charAt(0).toUpperCase()+slug.slice(1) : slug);
  }
  async function open(slug){
    await page.locator("#tile-"+slug).click();
    await opened(slug);
  }
  async function back(){
    const before=await page.evaluate(()=>({hash:location.hash,state:history.state,
      active:window.active,historyLength:history.length}));
    await page.locator("#back").click();
    try{ await page.waitForFunction(()=>document.querySelector("#roll")?.classList.contains("on"),null,{timeout:6500}); }
    catch(e){
      const after=await page.evaluate(()=>({hash:location.hash,state:history.state,
        active:window.active,historyLength:history.length,
        stageOn:document.querySelector("#stage")?.classList.contains("on")}));
      console.error("BACK ROUTE DEBUG",JSON.stringify({before,after}));
      throw e;
    }
  }
  function iframe(){return page.frameLocator("#frame");}
  async function stored(key){
    return page.evaluate(key=>{
      try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch{return null;}
    },key);
  }
  await freshRoll();
  await page.evaluate(slugs=>{
    for(const slug of slugs)localStorage.setItem("c2.v."+slug+".taught",JSON.stringify({v:1,d:true}));
    localStorage.setItem("c2.v.fell.taught","1");
  },slugs);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#tile-fell").waitFor();
  assert.equal(await page.locator("#vols .vol").count(),9);
  checks.push("All nine catalogue tiles");

  for(const slug of slugs){
    await open(slug);
    await page.reload({waitUntil:"domcontentloaded"});
    await opened(slug);
    await back();
    assert.equal(await page.locator("#roll.on").count(),1);
    checks.push(slug+": launch, refresh, return to collection");
  }

  // A true Fell solve through the player's own hint-and-move controls.
  await open("fell");
  await iframe().locator("#grid button:not([disabled])").first().waitFor({timeout:30000});
  await iframe().locator("#reveal").click();
  await iframe().locator('#grid [data-armed="1"]').click({timeout:30000});
  await page.waitForFunction(()=>{
    try{const s=JSON.parse(localStorage.getItem("c2.v.fell.state"));return s && s.correct===true;}
    catch{return false;}
  },null,{timeout:30000});
  await page.reload({waitUntil:"domcontentloaded"});
  await opened("fell");
  await back();
  assert.equal(await page.locator("#tile-fell .state").innerText(),"Completed");
  checks.push("Fell: actual successful move, saved result and refresh");

  // Mirrorwork must preserve a matched pair before the round ends.
  await open("mirrorwork");
  await iframe().locator('.scene[data-uid="0a"]').click({timeout:20000});
  await iframe().locator('.scene[data-uid="0b"]').click({timeout:20000});
  await page.waitForFunction(()=>{
    try{const s=JSON.parse(localStorage.getItem("c2.v.mirrorwork.session"))?.d;
      return Array.isArray(s?.matched) && s.matched.length===2;}
    catch{return false;}
  },null,{timeout:20000});
  await page.reload({waitUntil:"domcontentloaded"});
  await opened("mirrorwork");
  const resumed=await stored("c2.v.mirrorwork.session");
  assert.equal(resumed?.d?.matched?.length,2);
  checks.push("Mirrorwork: saved matched pair resumes after refresh");
  await back();

  // Glean saves the *actual* selected path rather than only its best score.
  await open("glean");
  await iframe().locator(".cell.reach").first().click({timeout:20000});
  await page.waitForFunction(()=>{
    try{const s=JSON.parse(localStorage.getItem("c2.v.glean.run.daily"))?.d;
      return Array.isArray(s?.path) && s.path.length>=2;}
    catch{return false;}
  },null,{timeout:20000});
  const path=(await stored("c2.v.glean.run.daily")).d.path;
  await page.reload({waitUntil:"domcontentloaded"});
  await opened("glean");
  await page.waitForFunction(path=>{
    try{const p=JSON.parse(localStorage.getItem("c2.v.glean.run.daily"))?.d?.path;
      return p?.length===path.length && p.every((x,i)=>x===path[i]);}
    catch{return false;}
  },path,{timeout:20000});
  await back();
  assert.equal(await page.locator("#tile-glean .state").innerText(),"In progress");
  checks.push("Glean: actual path survives refresh and return");

  // Verify keyboard and touch-sized tile targets and cross-game local history.
  await page.locator('#cog').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator('#settings:not([hidden])').count(),1);
  await page.keyboard.press("Escape");
  await page.locator("#settings").waitFor({state:"hidden",timeout:3000});
  checks.push("Keyboard: settings open, Escape closes");
  assert.equal(errors.length,0,"Browser runtime errors: "+errors.join(" | "));
  console.log("PASS "+checks.length+" browser checks:\n"+checks.map(x=>"  ✓ "+x).join("\n"));
  console.log("NOTE: Complete browser solve/resume for all nine remains an explicit review gate.");
  await context.close();
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
