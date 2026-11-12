// The Compendium II: dependency-free source and progress-contract checks.
// Run from the repository root: node qa/verify.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const expected = ["fell","mirrorwork","riffle","glean","bight","marquetry","reeve","shunt","furlong"];
const manifestBegin = html.indexOf("const MANIFEST = [");
assert.ok(manifestBegin >= 0, "Collection manifest missing");
const manifestEnd = html.indexOf("];",manifestBegin);
const manifest = html.slice(manifestBegin,manifestEnd);
const slugs = [...manifest.matchAll(/slug:"([a-z-]+)"/g)].map(x=>x[1]);
assert.deepEqual(slugs,expected,"Canonical nine-volume order");
assert.equal(new Set(slugs).size,9,"Unique manifest entries");

const hostStart = html.indexOf("<script>");
const hostEnd = html.indexOf("</script>",hostStart+8);
assert.ok(hostStart>=0 && hostEnd>hostStart,"Shell script boundary");
new Script(html.slice(hostStart+8,hostEnd),{filename:"index-host.js"});

const starts=[...html.matchAll(/<script type="text\/plain" id="vol-([a-z-]+)">/g)];
assert.deepEqual(starts.map(x=>x[1]),expected,"Embedded volume catalogue");
for(let i=0;i<starts.length;i++){
  const block=html.slice(starts[i].index,starts[i+1]?.index??html.length);
  const a=block.indexOf("<script>"),b=block.lastIndexOf("<\\/script>");
  assert.ok(a>=0 && b>a,"Embedded script boundary for "+starts[i][1]);
  new Script(block.slice(a+8,b),{filename:starts[i][1]+".js"});
  assert.ok(block.includes("C2.register({"),"Volume registration for "+starts[i][1]);
}
assert.equal((html.match(/<script[^>]*\bsrc\s*=/gi)||[]).length,0,"No external script dependencies");
assert.ok(!/<link[^>]+(?:stylesheet|https?:)/i.test(html),"No external stylesheet dependencies");

const start=html.indexOf("function localDate(){");
const end=html.indexOf("function drawRoll(){",start);
assert.ok(start>=0 && end>start,"Collection progress classifier");
const cells=new Map();
const localStorage={getItem:key=>cells.has(key)?cells.get(key):null};
const readRaw=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem("c2."+key));return x?.v===1?x.d:fallback;}catch{return fallback;}};
const progressFor=new Function("localStorage","readRaw","Date",html.slice(start,end)+"\nreturn progressFor;")(localStorage,readRaw,Date);
const d=new Date();
const today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const write=(slug,key,value)=>cells.set("c2.v."+slug+"."+key,JSON.stringify({v:1,d:value}));
const bare=(slug,key,value)=>cells.set("c2.v."+slug+"."+key,JSON.stringify({...value,v:1}));
let checks=0;
const check=(slug,state,why,mode)=>{
  const found=progressFor({slug});
  assert.equal(found.state,state,slug+" "+why);
  if(mode) assert.equal(found.mode,mode,slug+" "+why+" launch mode");
  checks++;
};
expected.forEach(s=>check(s,"new","fresh browser"));
bare("fell","state",{daily:true,date:today,played:8,correct:false});check("fell","progress","retry after miss");
bare("fell","state",{daily:true,date:today,played:8,correct:true});check("fell","done","solved");
write("mirrorwork","session",{started:true,moves:0,matched:[]});check("mirrorwork","progress","interrupted flip");
write("mirrorwork","session",null);write("mirrorwork","best",{bloom:{moves:10,time:12000}});check("mirrorwork","done","best recorded");
write("riffle","rack6",{found:["ace"]});check("riffle","progress","partially found rack");
write("riffle","rack6",{found:["ace"],complete:true});check("riffle","done","all words discovered");
write("glean","run.daily",{mode:"daily",date:today,i:1,path:[0,1]});check("glean","progress","saved line");
write("glean","run.daily",{mode:"daily",date:today,i:1,path:[0,1],done:true});check("glean","done","scored line");
write("bight","day",{date:today,h:[0,1],v:[],done:false});check("bight","progress","loop started");
write("bight","day",{date:today,done:true});check("bight","done","loop completed");
write("marquetry","day",{date:today,i:5,done:false});check("marquetry","progress","pieces placed");
write("marquetry","day",{date:today,i:30,done:true});check("marquetry","done","panel complete");
write("reeve","day",{date:today,known:[-1,1,-1],done:false});check("reeve","new","compulsory starting clue");
write("reeve","day",{date:today,known:[0,1,-1],done:false});check("reeve","progress","plots proven");
write("reeve","day",{date:today,done:true});check("reeve","done","plots settled");
write("shunt","day",{date:today,hist:[1],done:false});check("shunt","progress","yard underway");
write("shunt","day",{date:today,hist:[1],done:true});check("shunt","done","van escaped");
write("furlong","day",{date:today,placed:[{r:1}],done:false});check("furlong","progress","strip placed");
write("furlong","day",{date:today,done:true});check("furlong","done","field complete");
cells.clear();
write("bight","free",{done:false,h:[1],v:[]});check("bight","progress","free resume","free");
console.log("PASS: shell + 9 embedded scripts compile, manifest and offline assets checked, "+checks+" saved-state scenarios.");
console.log("Browser solve/resume E2E remains a separate acceptance gate.");
