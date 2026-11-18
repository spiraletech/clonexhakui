/* CLONE × SpiralOS v0.2: browser adapters for HOME/HAKUI/INOKUI/GUFF contracts.
 * This module does NOT load the native C++ engines. See docs/SPIRAL-SOURCE-MAP.md.
 * HOME truth remains the CLONE state; graphics and advisors are projections.
 */
(function(root){'use strict';
const C=root.CLONE;
if(!C)throw new Error('CLONE core must load before Spiral substrate');
const S={VERSION:'0.2.0',PROJECTION_VERSION:1};
const clone=x=>JSON.parse(JSON.stringify(x));
const zones=new Set(['home','street']);
const nameFor=s=>'CLONE-'+(s.seed>>>0).toString(16).padStart(8,'0');
const authorized=new Set(['PLAYER','HAKUI','GUFF']);
const guffApprovalToken=Symbol('GUFF player-approved proposal');
const opCapability={place:'PlaceAsset',move:'MoveAsset',interact:'Interact',greet:'Talk'};
const denial=(error)=>({ok:false,error});
function validMeta(s,m){
 if(!m||typeof m!=='object'||typeof m.world!=='string'||!/^CLONE-[0-9a-f]{8}$/.test(m.world)||!Number.isSafeInteger(m.revision)||m.revision<0||m.revision>1e9)throw new Error('Invalid Spiral world revision');
 if(!Array.isArray(m.audit)||m.audit.length>32)throw new Error('Invalid Spiral receipt history');
 const audit=m.audit.map(e=>{if(!e||!Number.isSafeInteger(e.revision)||e.revision<1||e.revision>m.revision||typeof e.actor!=='string'||!authorized.has(e.actor)||!Array.isArray(e.ops)||e.ops.length>8||!e.ops.every(x=>typeof x==='string'&&/^[a-z]+$/.test(x))||!Number.isFinite(e.minute))throw new Error('Invalid Spiral receipt');return{revision:e.revision,actor:e.actor,ops:e.ops.slice(),minute:e.minute};});
 for(let i=1;i<audit.length;i++)if(audit[i].revision<=audit[i-1].revision)throw new Error('Spiral receipts out of order');
 return{world:m.world,revision:m.revision,audit};
}
S.attach=s=>{
 if(!s||!Number.isInteger(s.seed)||!Array.isArray(s.items)||!s.player)throw new Error('Invalid CLONE world');
 s.spiral=s.spiral?validMeta(s,s.spiral):{world:nameFor(s),revision:0,audit:[]};
 return s.spiral;
};
const originalLoad=C.load;
C.load=function(raw){const loaded=originalLoad(raw);if(raw&&Object.prototype.hasOwnProperty.call(raw,'spiral'))loaded.spiral=validMeta(loaded,raw.spiral);return loaded;};
function ensure(s){return s.spiral?validMeta(s,s.spiral):S.attach(s);}
function record(stage,actor,ops){
 const meta=ensure(stage);const revision=meta.revision+1;
 if(revision>1e9)return denial('Revision limit reached');
 stage.spiral={world:meta.world,revision,audit:meta.audit.concat({revision,actor,ops:ops.slice(),minute:stage.minutes}).slice(-32)};
 return{ok:true,receipt:{world:meta.world,fromRevision:meta.revision,toRevision:revision,actor,operations:ops.slice()}};
}
function applyOperation(stage,op){
 if(!op||typeof op!=='object'||!Object.hasOwn(op,'type'))return denial('Malformed operation');
 switch(op.type){
 case 'place':return C.add(stage,op.kind,op.x,op.y,op.rot??0);
 case 'move':return C.move(stage,op.id,op.x,op.y,op.rot);
 case 'interact':return C.execute(stage,op.id,op.verb);
 case 'greet':{
  const n=stage.npcs.find(n=>n.id===op.id),p=stage.player;
  if(!n||p.zone!==n.zone||Math.hypot(n.x-p.x/4,n.y-p.y/4)>=1.6)return denial('Approach the neighbor first');
  if(!['town','dream'].includes(op.topic??'town'))return denial('Unknown conversation topic');
  const text=C.greet(stage,op.id,op.topic||'town');return text===null?denial('Unknown neighbor'):{ok:true,text};
 }
 default:return denial('Unsupported operation');
 }
}
/* Atomic, revision-checked, bounded batch. Original core checks remain authoritative. */
function commitChecked(s,tx,approvalToken){
 const meta=ensure(s);
 if(!tx||!authorized.has(tx.actor)||!Number.isSafeInteger(tx.expectedRevision)||tx.expectedRevision!==meta.revision)return denial('Stale revision or invalid actor');
 if(!Array.isArray(tx.operations)||tx.operations.length<1||tx.operations.length>8)return denial('Operation count must be 1–8');
 if(tx.actor==='GUFF'&&approvalToken!==guffApprovalToken)return denial('GUFF cannot directly commit without evaluated player authorization');
 const stage=clone(s),outcomes=[];
 for(const op of tx.operations){if(!Object.hasOwn(opCapability,op?.type))return denial('Unknown capability');const result=applyOperation(stage,op);if(!result?.ok)return denial(result?.error||'Operation refused');outcomes.push(result);}
 // Do not let the adapter bypass baseline CLONE import invariants.
 try{C.load(stage);}catch(e){return denial('World invariant rejected: '+e.message);}
 const receipt=record(stage,tx.actor,tx.operations.map(o=>o.type));if(!receipt.ok)return receipt;
 // One state object retained for game.js and a single successful commit.
 for(const key of Object.keys(stage))s[key]=stage[key];
 return{ok:true,receipt:receipt.receipt,outcomes};
}
S.commit=(s,tx)=>commitChecked(s,tx,null);
S.perform=(s,op)=>{const tx=S.commit(s,{actor:'PLAYER',expectedRevision:ensure(s).revision,operations:[op]});return tx.ok?{...tx.outcomes[0],receipt:tx.receipt}:tx;};
S.home={
 snapshot(s){const m=ensure(s);return clone({world:m.world,revision:m.revision,worldTime:s.minutes,weather:s.weather,player:s.player,items:s.items,npcs:s.npcs,community:s.community});},
 revision:s=>ensure(s).revision,
 audit:s=>clone(ensure(s).audit)
};
/* Derived presentation: it cannot author placement, clock or saved world truth. */
S.inokui={project(s){
 const m=ensure(s),minute=((s.minutes%1440)+1440)%1440;
 const dayFactor=minute<360||minute>1140?.35:minute<420?.7:1;
 const r={projectionVersion:1,world:m.world,revision:m.revision,weather:s.weather,worldTime:s.minutes,lighting:{dayFactor},
  avatar:{name:s.player.name,skin:s.player.skin,hair:s.player.hair,clothing:s.player.shirt,pose:s.player.pose},
  zones:['home','street'],items:s.items.map(i=>({id:i.id,kind:i.kind,zone:i.zone,visible:i.zone===s.player.zone,open:!!i.open,on:!!i.on})),
  neighbors:s.npcs.map(n=>({id:n.id,zone:n.zone,x:n.x,y:n.y}))};
 return clone(r);
 }};
/* HAKUI-like validated locomotion consequence (the native C++ body controller is separate). */
S.hakui={step(s,x,y){
 const m=ensure(s),p=s.player;
 if(!Number.isFinite(x)||!Number.isFinite(y)||!zones.has(p.zone)||p.pose!=='stand')return denial('Body unavailable');
 const distance=Math.hypot(x-p.x,y-p.y);if(distance>.6)return denial('Movement step exceeds bounded distance');
 const divisions=Math.max(1,Math.ceil(distance/.2));
 for(let k=1;k<=divisions;k++){
  const a=k/divisions,nx=p.x+(x-p.x)*a,ny=p.y+(y-p.y)*a;
  if(C.walkBlocked(s,p.zone,Math.floor(nx),Math.floor(ny)))return denial('Body clearance blocked');
  if(p.zone==='street'&&s.npcs.some(n=>Math.hypot(n.x-nx/4,n.y-ny/4)<.42))return denial('A neighbor occupies the path');
 }
 const ox=p.x,oy=p.y,oldCell=[Math.floor(p.x),Math.floor(p.y)],newCell=[Math.floor(x),Math.floor(y)];
 p.x=x;p.y=y;
 if(oldCell[0]!==newCell[0]||oldCell[1]!==newCell[1]){
  const receipt=record(s,'HAKUI',['move']);if(!receipt.ok){p.x=ox;p.y=oy;return receipt;}
 }
 return{ok:true,moved:distance>0,revision:s.spiral.revision,world:m.world};
 }};
/* GUFF grants authorize proposals, not direct mutations; game/UI retains final control. */
S.guff={
 evaluate(s,proposal,grant){
  const m=ensure(s);if(!grant||typeof grant.principal!=='string'||!Array.isArray(grant.capabilities)||grant.capabilities.length>4)return denial('Invalid GUFF grant');
  if(!proposal||proposal.principal!==grant.principal||proposal.expectedRevision!==m.revision||typeof proposal.rationale!=='string'||proposal.rationale.length>1024||!proposal.rationale.trim())return denial('Stale or invalid GUFF proposal');
  if(!Array.isArray(proposal.operations)||proposal.operations.length<1||proposal.operations.length>Math.min(8,grant.maxOperations??8))return denial('GUFF operation budget exceeded');
  for(const op of proposal.operations){const cap=opCapability[op?.type];if(!cap||!grant.capabilities.includes(cap))return denial('GUFF lacks capability '+(cap||'unknown'));
   if(grant.targetIds&&op.id&&!grant.targetIds.includes(op.id))return denial('GUFF target is outside grant scope');}
  const before=JSON.stringify(s),stage=clone(s),results=[];
  for(const op of proposal.operations){const r=applyOperation(stage,op);if(!r?.ok)return denial(r?.error||'Proposal cannot execute');results.push(r);}
  if(JSON.stringify(s)!==before)throw new Error('GUFF evaluation mutated HOME');
  return{ok:true,decision:'proposal-only',world:m.world,expectedRevision:m.revision,capabilities:proposal.operations.map(o=>opCapability[o.type]),operations:clone(proposal.operations)};
 },
 approve(s,proposal,grant,playerAccepted){
  if(playerAccepted!==true)return denial('No player authorization');
  const check=S.guff.evaluate(s,proposal,grant);if(!check.ok)return check;
  return commitChecked(s,{actor:'GUFF',expectedRevision:check.expectedRevision,operations:check.operations},guffApprovalToken);
 }
};
C.spiral=S;
if(typeof module!=='undefined')module.exports=S;
})(typeof window==='undefined'?globalThis:window);
