'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../js/core.js'),S=require('../js/spiral-substrate.js');
const start=(seed=78)=>{const s=C.fresh(seed);s.phase='playing';S.attach(s);return s;};
const approach=(s,id)=>{const i=s.items.find(i=>i.id===id),path=C.approach(s,i);assert.notEqual(path,null);if(path.length){s.player.x=path.at(-1)[0]+.5;s.player.y=path.at(-1)[1]+.5;}};
test('HOME identity and revision survive RNG seed advancement and save/load',()=>{
 const s=start(24),id=s.spiral.world;C.advance(s,1000);assert.equal(S.home.snapshot(s).world,id);
 const original=S.perform(s,{type:'place',kind:'plant',x:21,y:20,rot:0});assert.equal(original.ok,true,original.error);
 const q=C.load(JSON.parse(JSON.stringify(s)));assert.equal(q.spiral.world,id);assert.equal(q.spiral.revision,1);assert.equal(q.spiral.audit.length,1);
});
test('HOME atomic batches reject a later failing operation without partial writes',()=>{
 const s=start(),before=JSON.stringify(s),rev=S.home.revision(s);
 const result=S.commit(s,{actor:'PLAYER',expectedRevision:rev,operations:[{type:'place',kind:'plant',x:21,y:20},{type:'place',kind:'plant',x:21,y:20}]});
 assert.equal(result.ok,false);assert.equal(JSON.stringify(s),before);
});
test('HOME accepts atomic placement and movement and emits monotonic receipt',()=>{
 const s=start();const result=S.commit(s,{actor:'PLAYER',expectedRevision:0,operations:[{type:'place',kind:'plant',x:21,y:20},{type:'move',id:'table',x:20,y:29,rot:1}]});
 assert.equal(result.ok,true,result.error);assert.equal(result.receipt.toRevision,1);assert.equal(s.items.length,21);assert.equal(s.items.find(i=>i.id==='table').x,20);
 assert.equal(S.home.audit(s).at(-1).ops.join(','),'place,move');assert.equal(C.load(s).spiral.revision,1);
});
test('HOME rejects stale transactions without changing state',()=>{
 const s=start();assert.equal(S.perform(s,{type:'place',kind:'plant',x:21,y:20}).ok,true);
 const before=JSON.stringify(s);const bad=S.commit(s,{actor:'PLAYER',expectedRevision:0,operations:[{type:'place',kind:'plant',x:25,y:20}]});
 assert.equal(bad.ok,false);assert.equal(JSON.stringify(s),before);
});
test('HOME legacy saves remain loadable and new metadata is strictly validated',()=>{
 const legacy=C.load(C.fresh(7));assert.equal(legacy.spiral,undefined);S.attach(legacy);assert.equal(legacy.spiral.revision,0);
 const malformed=JSON.parse(JSON.stringify(legacy));malformed.spiral.revision=-1;assert.throws(()=>C.load(malformed),/Spiral/);
});
test('GAME interaction through HOME retains appliance effects and inventory',()=>{
 const s=start();approach(s,'stove');const cooked=S.perform(s,{type:'interact',id:'stove',verb:'Cook meal'});
 assert.equal(cooked.ok,true,cooked.error);assert.equal(s.items.find(i=>i.id==='fridge').stock.food,3);assert.equal(s.spiral.revision,1);
});
test('HAKUI blocks occupied and out-of-map moves without changing body',()=>{
 const s=start();s.player.x=3.5;s.player.y=3.5;const before=[s.player.x,s.player.y],rev=S.home.revision(s);
 const bad=S.hakui.step(s,-5,0);assert.equal(bad.ok,false);assert.deepEqual([s.player.x,s.player.y],before);
 assert.equal(S.home.revision(s),rev);
});
test('HAKUI valid bounded locomotion produces body consequence receipts at cell crossings',()=>{
 const s=start();s.player.x=23.5;s.player.y=18.5;const old=S.home.revision(s);
 const r=S.hakui.step(s,23.8,18.5);assert.equal(r.ok,true,r.error);assert.equal(S.home.revision(s),old);
 const q=S.hakui.step(s,24.1,18.5);assert.equal(q.ok,true,q.error);assert.equal(S.home.revision(s),old+1);
 assert.equal(S.home.audit(s).at(-1).actor,'HAKUI');
});
test('INOKUI projects rendering state without editing HOME',()=>{
 const s=start();const before=JSON.stringify(s),v=S.inokui.project(s);
 assert.equal(v.world,s.spiral.world);assert.equal(v.projectionVersion,1);assert.equal(v.items.length,s.items.length);
 v.items[0].kind='corrupted';v.avatar.name='different';assert.equal(JSON.stringify(s),before);
});
test('GUFF has no world write authority when evaluating typed proposals',()=>{
 const s=start(),before=JSON.stringify(s),grant={principal:'local-adviser',capabilities:['PlaceAsset'],maxOperations:1};
 const request={principal:'local-adviser',expectedRevision:0,rationale:'Suggest a plant placement',operations:[{type:'place',kind:'plant',x:21,y:20}]};
 const allowed=S.guff.evaluate(s,request,grant);assert.equal(allowed.ok,true,allowed.error);assert.equal(allowed.decision,'proposal-only');assert.equal(JSON.stringify(s),before);
 assert.equal(S.guff.approve(s,request,grant,false).ok,false);assert.equal(S.commit(s,{actor:'GUFF',playerApproved:true,expectedRevision:0,operations:request.operations}).ok,false);assert.equal(JSON.stringify(s),before);
 const committed=S.guff.approve(s,request,grant,true);assert.equal(committed.ok,true,committed.error);assert.equal(s.spiral.revision,1);
});
test('GUFF denies unauthorized, out-of-scope and stale proposals',()=>{
 const s=start(),req={principal:'adviser',expectedRevision:0,rationale:'Move furniture',operations:[{type:'move',id:'table',x:20,y:29,rot:1}]};
 assert.equal(S.guff.evaluate(s,req,{principal:'adviser',capabilities:['PlaceAsset']}).ok,false);
 assert.equal(S.guff.evaluate(s,req,{principal:'adviser',capabilities:['MoveAsset'],targetIds:['bed']}).ok,false);
 assert.equal(S.guff.evaluate(s,{...req,expectedRevision:99},{principal:'adviser',capabilities:['MoveAsset']}).ok,false);
 assert.equal(s.items.find(i=>i.id==='table').x,16);
});
