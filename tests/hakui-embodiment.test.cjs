/* Deterministic browser HAKUI body/ground-contact adapter verification. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const C=require('../js/core.js');
const H=require('../js/hakui-embodiment.js');
function artwork(){const env={window:{},Float32Array,Uint16Array,URL};vm.createContext(env);
 for(const file of ['core','renderer','hakui-embodiment','assets'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8'),env);
 return env.window.CLONE;}
const near=(a,b,eps=.002)=>assert.ok(Math.abs(a-b)<=eps,`${a} should be within ${eps} of ${b}`);
test('HAKUI browser adapter adopts canonical 3.25/5.75 m/s speeds and separate body pose',()=>{
 assert.equal(H.CONFIG.walkSpeed,3.25);assert.equal(H.CONFIG.sprintSpeed,5.75);
 assert.equal(H.CONFIG.acceleration,26);assert.equal(H.CONFIG.deceleration,34);
 const c=H.makeController(),p={x:60,y:60,zone:'street',pose:'stand'};
 const before=JSON.stringify(p);const pose=c.step('actor',p,.016);
 assert.equal(JSON.stringify(p),before);assert.ok(pose.valid);assert.equal(pose.mode,'idle');
 for(const name of ['pelvis','head','leftLeg','rightLeg','leftArm','rightArm'])assert.ok(pose[name]);
});
test('standing foot sole is grounded and render nodes follow solved joints without IK in renderer',()=>{
 const C=artwork(),state=C.fresh(2);state.phase='playing';state.player.zone='street';state.player.pose='stand';
 const c=C.hakuiAnimation.makeController(),pose=c.step('player',state.player,.016);
 const nodes=C.art.player(state,0,pose);
 assert.ok(nodes.length>15);assert.ok(nodes.every(n=>n.p.concat(n.s,n.c,n.r).every(Number.isFinite)));
 const low=Math.min(...nodes.map(n=>n.p[2]-n.s[2]/2));
 assert.ok(low>=-.01,`A planted mannequin cannot float below the floor: ${low}`);
 assert.ok(low<=.04,`Footprint must touch the world floor, got ${low}`);
 const moving={...state.player,x:state.player.x+.13};const next=c.step('player',moving,.016);
 assert.notDeepEqual(next.leftLeg.hip,pose.leftLeg.hip);
 assert.notDeepEqual(C.art.player({...state,player:moving},20,next),nodes);
});
test('stance foot locks in world space, swing foot lifts, and stops settle on ground',()=>{
 const ctl=H.makeController(),p={x:80,y:80,zone:'street',pose:'stand'};
 ctl.step('player',p,.02);
 let locked=null,observedLock=false,observedSwing=false;
 for(let i=0;i<65;i++){
   p.y+=H.CONFIG.walkSpeed*4*.02;
   const q=ctl.step('player',p,.02);
   const f=q.leftLeg;
   if(f.contact==='swing'&&f.foot[2]>.06)observedSwing=true;
   if(f.contact==='planted'&&q.phase<2.7&&q.phase>.2){
     if(locked){near(f.foot[0],locked[0],.005);near(f.foot[1],locked[1],.005);observedLock=true;}
     locked=[f.foot[0],f.foot[1]];
   }else locked=null;
 }
 assert.ok(observedLock,'Foot must remain planted at the same world position for multiple frames');
 assert.ok(observedSwing,'Swing foot visibly clears the floor');
 let q;for(let i=0;i<25;i++)q=ctl.step('player',p,.02);
 assert.equal(q.mode,'idle');
 near(q.leftLeg.foot[2],.055);near(q.rightLeg.foot[2],.055);
 near(q.leftLeg.foot[0],p.x/4-H.CONFIG.footHalfWidth,.02);
});
test('pivot releases planted foot and neither pose nor IK rewrites player world root',()=>{
 const ctl=H.makeController(),p={x:80,y:80,zone:'street',pose:'stand'};
 ctl.step('actor',p,.02);
 for(let i=0;i<5;i++){p.y+=.17;ctl.step('actor',p,.02);}
 const prev=JSON.stringify(p);p.x+=.18;
 const before=JSON.stringify(p),q=ctl.step('actor',p,.02);
 assert.equal(JSON.stringify(p),before);assert.notEqual(JSON.stringify(p),prev);
 assert.ok(['planted','swing','releasing'].includes(q.leftLeg.contact));
 assert.ok(q.yaw>0);assert.ok(q.leftLeg.ankle.every(Number.isFinite));
 const a=H.solveIK([0,0,.7],[100,0,0],0);assert.ok(a.clamped);
 assert.ok(Math.hypot(...a.ankle.map((n,i)=>n-a.hip[i]))<=H.CONFIG.upperLeg+H.CONFIG.lowerLeg);
});
test('transient animation resets on travel and never enters save schema',()=>{
 const ctl=H.makeController(),p={x:64,y:66,zone:'home',pose:'stand'};
 ctl.step('p',p,.02);p.x+=.4;ctl.step('p',p,.02);
 p.zone='street';p.x=23.5;p.y=37.5;
 const pose=ctl.step('p',p,.02);
 assert.equal(pose.mode,'idle');near(pose.position[0],p.x/4);
 ctl.reset('p');assert.equal(ctl.get('p'),null);
});
