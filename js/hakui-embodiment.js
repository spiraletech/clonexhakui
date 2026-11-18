/* CLONE browser adapter for HAKUI's canonical movement -> pose -> contact -> render law.
 * The authoritative native C++ solvers are NOT linked in this browser build.
 * This deterministic, transient pose system consumes only accepted movement and
 * never writes gameplay position, saves, collisions, or world/HOME revisions.
 * Source: spiraletech/hakui native/hakui-mannequin-correction-02-sully
 *        src/body/BodyPoseSolver.cpp and BodyConstraintSolver.cpp.
 */
(function(root){
'use strict';
const C=root.CLONE||(root.CLONE={});
const PI=Math.PI, TAU=PI*2;
const CONFIG=Object.freeze({walkSpeed:3.25,sprintSpeed:5.75,acceleration:26,deceleration:34,
  turnRate:12, cycleDistance:1.20, footHalfWidth:.12, stride:.255,
  lift:.13, upperLeg:.385,lowerLeg:.395, plantReleaseDistance:.44,
  plantReleaseYaw:.55,maxPelvisDrop:.08});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(dt,rate)=>1-Math.exp(-Math.max(0,dt)*rate);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const forward=(yaw,x,y)=>[x+Math.sin(yaw),y+Math.cos(yaw)];
const offset=(x,y,yaw,side,front)=>[x+side*Math.cos(yaw)+front*Math.sin(yaw),y-side*Math.sin(yaw)+front*Math.cos(yaw)];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const foot=()=>({phase:'swing',world:null,yawAtPlant:0,release:0});
function rig(){return {initialized:false,x:0,y:0,zone:'',yaw:0,phase:0,speed:0,blend:0,
  left:foot(),right:foot(),pose:null};}
function solveIK(hip,ankle,yaw){
  const upper=CONFIG.upperLeg,lower=CONFIG.lowerLeg;
  const vx=ankle[0]-hip[0],vy=ankle[1]-hip[1],vz=ankle[2]-hip[2];
  const rawDist=Math.hypot(vx,vy,vz),reach=clamp(rawDist,.04,upper+lower-.008);
  const direction=rawDist>.0001?[vx/rawDist,vy/rawDist,vz/rawDist]:[0,0,-1];
  const projected=[hip[0]+direction[0]*reach,hip[1]+direction[1]*reach,hip[2]+direction[2]*reach];
  const a=(upper*upper-lower*lower+reach*reach)/(2*reach);
  const h=Math.sqrt(Math.max(0,upper*upper-a*a));
  // Knee bends forward, orthogonal to hip->ankle, as in HAKUI's two-bone solver.
  let bend=[Math.sin(yaw),Math.cos(yaw),0];const dot=bend.reduce((s,n,i)=>s+n*direction[i],0);
  bend=bend.map((n,i)=>n-dot*direction[i]);const len=Math.hypot(...bend);
  if(len<.0001)bend=[1,0,0];else bend=bend.map(n=>n/len);
  return {hip,knee:hip.map((n,i)=>n+direction[i]*a+bend[i]*h),ankle:projected,clamped:rawDist>reach+.0001};
}
function groundFoot(r,footState,side,cycle,root,dt,actualMoving){
  const isStance=Math.sin(cycle)>=0;
  const localStride=CONFIG.stride*(.5+.5*r.blend);
  const nominal=offset(root[0],root[1],r.yaw,side*CONFIG.footHalfWidth,Math.cos(cycle)*localStride);
  const swingLift=isStance?0:Math.max(0,-Math.sin(cycle))*CONFIG.lift*r.blend;
  // Idle transitions settle the foot down. A stationary player never remains mid-step.
  const resting=offset(root[0],root[1],r.yaw,side*CONFIG.footHalfWidth,.018);
  if(!actualMoving){
    const pos=footState.world||nominal;
    footState.world=[lerp(pos[0],resting[0],smooth(dt,14)),lerp(pos[1],resting[1],smooth(dt,14))];
    footState.phase='planted';footState.release=0;
    return [...footState.world,.055];
  }
  if(!isStance){footState.phase='swing';footState.world=null;footState.release=0;return [...nominal,.055+swingLift];}
  if(footState.phase!=='planted'||!footState.world){
    footState.world=nominal;
    footState.phase='planted';footState.yawAtPlant=r.yaw;
  }
  // Pivot and unreachable contact release, then replant. No world root mutation.
  const release=dist(footState.world,root)>CONFIG.plantReleaseDistance||
    Math.abs(wrap(r.yaw-footState.yawAtPlant))>CONFIG.plantReleaseYaw;
  if(release){
    footState.phase='releasing';
    footState.world=[lerp(footState.world[0],nominal[0],smooth(dt,24)),
                     lerp(footState.world[1],nominal[1],smooth(dt,24))];
    footState.yawAtPlant=r.yaw;
  }
  return [...footState.world,.055];
}
function solvePose(r,player,dt,actualMoving){
  const root=[r.x,r.y];
  const leftContact=groundFoot(r,r.left,-1,r.phase,root,dt,actualMoving);
  const rightContact=groundFoot(r,r.right,1,r.phase+PI,root,dt,actualMoving);
  const bodyBob=actualMoving?Math.abs(Math.sin(r.phase))*.027*r.blend:0;
  let pelvisHeight=.715+bodyBob;
  for(const f of [leftContact,rightContact]){
    const horizontal=Math.hypot(f[0]-root[0],f[1]-root[1]);
    const vertical=Math.sqrt(Math.max(0,(CONFIG.upperLeg+CONFIG.lowerLeg-.012)**2-horizontal**2));
    pelvisHeight-=Math.min(CONFIG.maxPelvisDrop,Math.max(0,pelvisHeight-(f[2]+vertical)));
  }
  const cx=root[0],cy=root[1],sideX=Math.cos(r.yaw),sideY=-Math.sin(r.yaw);
  const pelvis=[cx,cy,pelvisHeight];
  const leftHip=[cx-sideX*.105,cy-sideY*.105,pelvisHeight];
  const rightHip=[cx+sideX*.105,cy+sideY*.105,pelvisHeight];
  const leftLeg=solveIK(leftHip,[leftContact[0],leftContact[1],leftContact[2]+.07],r.yaw);
  const rightLeg=solveIK(rightHip,[rightContact[0],rightContact[1],rightContact[2]+.07],r.yaw);
  const shoulders=.155,shoulderZ=pelvisHeight+.39;
  const armSwing=Math.sin(r.phase)*.20*r.blend;
  const arm=(side)=>{
    const sx=cx+side*sideX*shoulders,sy=cy+side*sideY*shoulders;
    const forwardOffset=side===-1?-armSwing:armSwing;
    const elbow=offset(sx,sy,r.yaw,side*.047,forwardOffset*.50+.015);
    const hand=offset(sx,sy,r.yaw,side*.055,forwardOffset);
    return {shoulder:[sx,sy,shoulderZ],elbow:[elbow[0],elbow[1],shoulderZ-.17],hand:[hand[0],hand[1],shoulderZ-.33]};
  };
  const stance=actualMoving?r.speed>=4.35?'sprint':r.speed>=2.6?'run':'walk':'idle';
  return {valid:true,grounded:true,mode:stance,position:[cx,cy],yaw:r.yaw,phase:r.phase,
    speed:r.speed,movementBlend:r.blend,pelvis,shoulder:[cx,cy,shoulderZ],head:[cx,cy,shoulderZ+.22],
    leftLeg:{...leftLeg,foot:leftContact,contact:r.left.phase},rightLeg:{...rightLeg,foot:rightContact,contact:r.right.phase},
    leftArm:arm(-1),rightArm:arm(1)};
}
function makeController(){
  const states=new Map();
  function reset(id){states.delete(id);}
  function step(id,player,dt){
    let r=states.get(id);if(!r){r=rig();states.set(id,r);}
    const x=Number(player.x)/4,y=Number(player.y)/4,zone=player.zone||'home';
    if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error('HAKUI pose requires a finite character position');
    dt=clamp(Number(dt)||0,0,.1);
    const teleport=!r.initialized||r.zone!==zone||Math.hypot(x-r.x,y-r.y)>CONFIG.sprintSpeed*dt+0.5;
    if(teleport){r.initialized=true;r.zone=zone;r.x=x;r.y=y;r.phase=0;r.speed=0;r.blend=0;r.left=foot();r.right=foot();r.pose=solvePose(r,player,dt,false);return r.pose;}
    const dx=x-r.x,dy=y-r.y,travel=Math.hypot(dx,dy),moving=travel>.00005&&player.pose==='stand';
    const instantaneousSpeed=dt>0?Math.min(12,travel/dt):0;
    r.speed=lerp(r.speed,moving?instantaneousSpeed:0,smooth(dt,moving?16:18));
    r.blend=lerp(r.blend,moving?clamp(instantaneousSpeed/2.5,0,1):0,smooth(dt,moving?14:18));
    if(moving){const targetYaw=Math.atan2(dx,dy);const change=wrap(targetYaw-r.yaw);
      r.yaw=wrap(r.yaw+clamp(change,-CONFIG.turnRate*dt,CONFIG.turnRate*dt));
      r.phase=(r.phase+travel/CONFIG.cycleDistance*TAU)%TAU;}
    r.x=x;r.y=y;r.pose=solvePose(r,player,dt,moving);
    return r.pose;
  }
  return {step,reset,get:(id)=>states.get(id)?.pose||null};
}
C.hakuiAnimation={CONFIG,makeController,solveIK};
if(typeof module!=='undefined')module.exports=C.hakuiAnimation;
})(typeof window!=='undefined'?window:globalThis);
