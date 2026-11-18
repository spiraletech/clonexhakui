/* Original authored house kit: shared indexed topology and per-instance surface materials. */
(function(){'use strict';const C=window.CLONE,colors=new Map();const rgb=h=>{if(!colors.has(h))colors.set(h,[1,3,5].map(k=>parseInt(h.slice(k,k+2),16)/255));return colors.get(h);};
const P={wood:'#b28c59',white:'#e6e4dc',gray:'#adb3b1',dark:'#344244',glass:'#9dbbbd',cloth:'#e3e0d7',metal:'#aaaeb1'};
function n(a,g,x,y,z,w,d,h,c=P.white,m=0,r=[0,0,0],e=0){a.push({g,p:[x,y,z],s:[w,d,h],c:rgb(c),m,r,e});return a.at(-1);}
function b(a,x,y,z,w,d,h,c=P.white,m=0){return n(a,m===2?'soft':'round',x+w/2,y+d/2,z+h/2,w,d,h,c,m);}
function cy(a,x,y,z,w,h,c=P.white,m=0){return n(a,'cylinder',x,y,z+h/2,w,w,h,c,m);}
function ball(a,x,y,z,w,d,h,c=P.white,m=0){return n(a,'sphere',x,y,z,w,d,h,c,m);}
function hinge(a,start,pivot,angle){const co=Math.cos(angle),si=Math.sin(angle);for(let k=start;k<a.length;k++){const v=a[k],x=v.p[0]-pivot[0],y=v.p[1]-pivot[1];v.p[0]=pivot[0]+x*co-y*si;v.p[1]=pivot[1]+x*si+y*co;v.r[2]+=angle;}}
function tap(a,x,y,z){cy(a,x,y,z,.035,.25,P.metal,4);b(a,x-.015,y,z+.23,.03,.19,.025,P.metal,4);}
function plant(a,x,y,z){cy(a,x,y,z,.32,.28,'#c1ae8a',3);cy(a,x,y,z+.27,.27,.015,'#61513e',3);for(let j=0;j<10;j++){const t=j*2.4;const q=ball(a,x+Math.cos(t)*.13,y+Math.sin(t)*.13,z+.43+Math.sin(j)*.10,.3,.09,.055,j%2?'#71805a':'#859367',5);q.r=[.15,Math.cos(t)*.4,t];}}
function model(i,t=0){const a=[],d=C.defs[i.kind],w=d.size[0]/4,h=d.size[1]/4;
if(i.kind==='bed'){for(const x of [.12,w-.18])for(const y of [.12,h-.18])b(a,x,y,0,.07,.07,.32,P.wood,1);b(a,0,0,.25,w,h,.15,P.wood,1);b(a,0,0,.35,w,.10,.6,P.wood,1);b(a,.07,.12,.4,w-.14,h-.22,.18,P.cloth,2);for(const x of [.13,w/2+.03])b(a,x,.19,.58,w/2-.16,.46,.12,'#f1eee8',2);b(a,.07,.85,.58,w-.14,h-1,.055,'#d1d0c9',2);}
else if(i.kind==='couch'||i.kind==='bench'){for(const x of [.1,w-.17])for(const y of [.1,h-.16])b(a,x,y,0,.06,.06,.23,P.wood,1);b(a,0,0,.18,w,h,.12,P.wood,1);b(a,0,0,.3,w,.17,.5,P.cloth,2);for(const x of [0,w-.15])b(a,x,.1,.3,.15,h-.12,.31,P.cloth,2);for(let j=0;j<2;j++)b(a,.17+j*(w-.34)/2,.2,.3,(w-.37)/2,h-.23,.12,'#f0ece4',2);}
else if(i.kind==='fridge'){for(const x of [0,w-.05])b(a,x,0,0,.05,h,1.8,P.white);for(const z of [0,1.75])b(a,0,0,z,w,h,.05,P.white);b(a,.05,.01,.05,w-.1,.04,1.7,P.white);for(let k=0;k<4;k++){b(a,.05,.07,.25+k*.35,w-.1,h-.13,.018,P.gray,4);for(let j=0;j<Math.min(3,Math.ceil(i.stock.soda/2));j++){cy(a,.2+j*.25,h-.18,.27+k*.35,.1,.17,k%2?'#8c9e8b':'#b18d73',4);}}
const start=a.length;b(a,.015,h-.02,.03,w-.03,.07,1.73,P.white);b(a,.1,h+.05,.5,.025,.03,.5,P.metal,4);b(a,.02,h+.051,1.28,w-.04,.003,.014,P.gray);hinge(a,start,[w-.02,h-.02],-(i.visualOpen==null?i.open?1:0:i.visualOpen)*2.3);if(i.open)b(a,.1,.08,1.65,w-.2,.025,.025,'#fff0c2',0).e=.6;}
else if(['counter','sink','island','stove'].includes(i.kind)){b(a,0,0,0,w,h,.84,'#c6cbc6',0);b(a,0,0,.84,w,h,.06,'#eeece3',3);for(let j=0;j<Math.round(w/.5);j++){b(a,.02+j*.5,h,.08,.45,.018,.72,'#d4d8d1');b(a,.35+j*.5,h+.02,.7,.08,.02,.016,P.wood,4);}if(['sink','counter'].includes(i.kind)){b(a,.12,.15,.90,.6,.5,.02,P.metal,4);b(a,.17,.2,.914,.5,.4,.01,'#8aa9ae',6);tap(a,.48,.10,.9);if(i.busy>0)cy(a,.48,.28,.92,.012,.20,'#a0c9ce',6);}if(i.kind==='stove'){b(a,.03,.03,.902,w-.06,h-.06,.014,P.dark);for(const x of [.27,.72])for(const y of [.25,.7])cy(a,x,y,.92,.24,.008,i.busy>0?'#c08c5d':'#47524f');b(a,.12,h+.02,.15,w-.24,.01,.42,P.dark);}if(i.kind==='island'){b(a,.2,.2,.91,.35,.27,.012,P.wood,1);}}
else if(i.kind==='toilet'){cy(a,w/2,.52,0,.30,.25,P.white);b(a,.10,0,.05,.55,.23,.72,P.white);ball(a,w/2,.57,.33,.53,.7,.5,P.white);cy(a,w/2,.55,.5,.48,.035,P.white);cy(a,w/2,.55,.525,.35,.008,'#bdd0ce',6);b(a,.43,.08,.79,.08,.09,.018,P.metal,4);if(i.busy>0){for(let j=0;j<8;j++){const an=t*.006+j*.785;ball(a,w/2+Math.cos(an)*.12,.55+Math.sin(an)*.12,.54,.065,.035,.018,j%2?'#dcecec':'#8bbcc4');}}}
else if(i.kind==='shower'){b(a,0,0,0,w,h,.08,'#d9e1e0',3);b(a,0,0,.08,w,.035,1.85,'#93a8a7',3);b(a,w-.03,0,.08,.03,h,1.85,'#a7bcbc');for(const x of [0,w-.03])b(a,x,h-.03,.08,.02,.02,1.85,P.metal,4);b(a,w-.03,h/2,1.1,.02,.25,.035,P.metal,4);b(a,.2,.05,1.7,.28,.25,.035,P.metal,4);if(i.busy>0)for(let j=0;j<12;j++){const z=.12+((t*.001+j*.13)%1.45);cy(a,.25+(j%3)*.065,.22+Math.floor(j/3)*.07,z,.009,.10,'#9fc4c7',6);}}
else if(i.kind==='computer'){for(const x of [.06,w-.12])for(const y of [.1,h-.15])b(a,x,y,0,.05,.05,.72,P.wood,1);b(a,0,0,.72,w,h,.07,P.wood,1);b(a,.14,.18,.79,.30,.18,.02,P.metal,4);b(a,.26,.24,.8,.04,.04,.2,P.dark);b(a,.04,.27,1,.8,.04,.46,P.dark);b(a,.065,.313,1.025,.75,.005,.4,i.on?'#738a8b':'#273331',0).e=i.on?.14:0;if(i.on)for(let j=0;j<4;j++)b(a,.11,.32,1.08+j*.07,.15+Math.sin(t*.001+j)*.04,.002,.025,'#c0cbc0');b(a,.14,.55,.79,.57,.18,.02,'#788582');}
else if(i.kind==='wardrobe'){b(a,0,0,0,w,h,1.8,P.wood,1);const start=a.length;b(a,.02,h,.07,w-.04,.03,1.68,'#ae8e66',1);b(a,.17,h+.04,.8,.025,.025,.2,P.dark);hinge(a,start,[w-.02,h],(i.open?1:0)*-1.9);}
else if(i.kind==='lamp'){cy(a,w/2,h/2,0,.20,.025,P.dark,4);cy(a,w/2,h/2,.025,.025,1.4,P.dark,4);n(a,'cone',w/2,h/2,1.45,.26,.26,.23,i.on?'#fff0cc':'#a5a394',2,[0,0,0],i.on?.35:0);}
else if(i.kind==='plant')plant(a,w/2,h/2,0);
else if(i.kind==='table'){for(const x of [.06,w-.1])for(const y of [.06,h-.1])b(a,x,y,0,.04,.04,.4,P.wood,1);b(a,0,0,.4,w,h,.05,P.wood,1);b(a,.15,.2,.45,.28,.2,.02,'#b1beb2',2);}
else if(i.kind==='mailbox'){cy(a,.25,.25,0,.05,.65,P.metal,4);b(a,.05,.05,.65,.4,.4,.25,'#9d6d57');b(a,.12,.452,.8,.26,.005,.018,P.dark);}
else if(i.kind==='door'||i.kind==='gate'){for(const x of [0,w-.04])b(a,x,0,0,.04,.05,2.1,P.white);b(a,0,0,2.05,w,.05,.05,P.white);if(i.kind==='door'){const st=a.length;b(a,.04,.025,0,w-.08,.04,2.03,P.wood,1);b(a,w-.16,.075,.95,.04,.04,.035,P.metal,4);hinge(a,st,[.04,.025],i.open?-1.7:0);}}
const fix=i.kind==='lamp'?.94:i.kind==='plant'?.85:1,fy=['counter','sink','island','stove','fridge','wardrobe'].includes(i.kind)?h/(h+.12):1;for(const q of a){q.p[0]=(q.p[0]-w/2)*fix+w/2;q.p[1]=((q.p[1]-h/2)*fix+h/2)*fy;q.s[0]*=fix;q.s[1]*=fix*fy;}
const angle=i.rot*Math.PI/2,co=Math.cos(angle),si=Math.sin(angle);for(const q of a){const x=q.p[0]-w/2,y=q.p[1]-h/2;q.p[0]=i.x/4+(i.rot%2?h:w)/2+x*co-y*si;q.p[1]=i.y/4+(i.rot%2?w:h)/2+x*si+y*co;q.r[2]+=angle;q.p[2]+=i.zone==='home'?.026:.021;}return a;}
function shell(zone){const a=[];b(a,0,0,-.18,12,10,.18,'#beb5a6',3);if(zone==='home'){for(let y=0;y<40;y++)for(let x=0;x<12;x++){const bath=x>=8&&y>=20;b(a,x+.002,y*.25,.001,.996,.246,.025,bath?'#a8b1af':(x+y)%3?'#bda174':'#d1b789',bath?3:1);}for(const [x,y,w,d]of [[0,-.1,12,.1],[-.1,0,.1,10]]){b(a,x,y,0,w,d,2.5,'#deded4',3);b(a,x,y,2.5,w,d,.055,'#f2eee3');}b(a,0,9.96,0,5.7,.04,.12,P.white);b(a,6.9,9.96,0,5.1,.04,.12,P.white);b(a,11.96,0,0,.04,10,.12,P.white);
for(const x of [.7,3.6,7]){b(a,x,.005,1.15,1.4,.04,1.06,'#d6e0dc');for(const dx of [0,.68,1.36])b(a,x+dx,.055,1.15,.035,.025,1.06,P.white);b(a,x,.055,1.67,1.4,.025,.03,P.white);}
for(let j=0;j<12;j++){b(a,.01,.35+j*.23,.2,.035,.025,2.1,P.wood,1);}for(let z=.2;z<2.35;z+=.2)b(a,.01,.35,z,.035,2.65,.018,P.wood,1);
}else{for(let y=0;y<10;y++)for(let x=0;x<12;x++)b(a,x+.01,y+.01,.001,.98,.98,.02,y>6?'#b6b8b1':'#859773',y>6?3:5);b(a,0,-.05,0,12,.05,1.2,'#b6bcb3',3);for(const x of [1,10])plant(a,x,1,0);}return a;}
function solvedPlayer(s,pose){
 const a=[],p=s.player,x=pose.position[0],y=pose.position[1],yaw=pose.yaw;
 function limb(from,to,width,c,m=2){const dx=to[0]-from[0],dy=to[1]-from[1],dz=to[2]-from[2],len=Math.hypot(dx,dy,dz);
  n(a,'cylinder',(from[0]+to[0])/2,(from[1]+to[1])/2,(from[2]+to[2])/2,width,width,Math.max(.001,len),c,m,[-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0]);}
 n(a,'soft',x,y,pose.pelvis[2]+.16,.28,.19,.4,p.shirt,2,[0,0,yaw]);
 ball(a,x,y,pose.head[2],.29,.28,.35,p.skin);
 ball(a,x,y-.018,pose.head[2]+.10,.31,.28,.18,p.hair);
 for(const [side,leg,arm] of [[-1,pose.leftLeg,pose.leftArm],[1,pose.rightLeg,pose.rightArm]]){
  limb(leg.hip,leg.knee,.105,'#56615c');limb(leg.knee,leg.ankle,.09,'#56615c');
  const fw=[Math.sin(yaw),Math.cos(yaw)];
  n(a,'soft',leg.foot[0]+fw[0]*.04,leg.foot[1]+fw[1]*.04,leg.foot[2],.12,.21,.11,P.dark,2,[0,0,yaw]);
  limb(arm.shoulder,arm.elbow,.10,p.shirt);limb(arm.elbow,arm.hand,.075,p.skin);
  ball(a,...arm.hand,.08,.075,.09,p.skin);
  if(side===1&&p.soda)cy(a,arm.hand[0],arm.hand[1]+.02,arm.hand[2]-.035,.08,.13,'#b87760',4);
  ball(a,x+side*.055*Math.cos(yaw)+Math.sin(yaw)*.127,y-side*.055*Math.sin(yaw)+Math.cos(yaw)*.127,pose.head[2]+.02,.018,.012,.026,P.dark);
 }
 const floor=p.zone==='home'?.026:.021;for(const n of a)n.p[2]+=floor;
 return a;
}
function player(s,t,pose){if(pose&&pose.valid&&s.player.pose==='stand')return solvedPlayer(s,pose);const a=[],p=s.player,seat=s.items.find(i=>i.id===p.seat),lie=p.pose==='lie'||p.pose==='sleep',sit=seat&&!lie;let x=p.x/4,y=p.y/4,surface=0;if(seat){const r=C.rect(seat);x=(r.x+r.w/2)/4;y=(r.y+r.h*.65)/4;surface=seat.kind==='bed'?.64:.42;}const hip=sit?surface+.04:.65,shoulder=hip+.4,head=shoulder+.2;
function limb(from,to,width,c,m=2){const dx=to[0]-from[0],dy=to[1]-from[1],dz=to[2]-from[2],len=Math.hypot(dx,dy,dz);n(a,'cylinder',(from[0]+to[0])/2,(from[1]+to[1])/2,(from[2]+to[2])/2,width,width,len,c,m,[-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0]);}
b(a,x-.14,y-.09,hip,.28,.18,.4,p.shirt,2);ball(a,x,y,head,.29,.28,.35,p.skin);ball(a,x,y-.018,head+.10,.31,.28,.18,p.hair);
for(const side of [-1,1]){const legx=x+side*.085,knee=[legx,y+(sit?.27:.025),sit?surface+.04:.34],ankle=[legx,y+(sit?.38:0),.1];limb([legx,y,hip],knee,.105,'#56615c');limb(knee,ankle,.09,'#56615c');b(a,legx-.06,ankle[1],0,.12,.21,.085,P.dark,2);const sip=p.sip>0&&side===1,hand=[x+side*.17,y+(sip?.23:sit?.22:.02),sip?head-.06:sit?hip+.10:hip-.09],elbow=[x+side*.21,y+.07,shoulder-.19];limb([x+side*.17,y,shoulder-.025],elbow,.10,p.shirt);limb(elbow,hand,.075,p.skin);ball(a,...hand,.08,.075,.09,p.skin);if(side===1&&p.soda)cy(a,hand[0],hand[1]+.02,hand[2]-.035,.08,.13,'#b87760',4);ball(a,x+side*.055,y+.133,head+.02,.018,.012,.026,P.dark);}
if(lie){for(const q of a){const xx=q.p[0]-x,yy=q.p[1]-y,zz=q.p[2];if(seat&&seat.kind==='bed'){q.p[1]=y-zz;q.p[2]=surface+.12+yy;q.r[0]+=Math.PI/2;}else{q.p[0]=x-.55+zz;q.p[2]=surface+.16-xx;q.r[1]+=Math.PI/2;}}}for(const q of a)q.p[2]+=p.zone==='home'?.026:.021;return a;}
C.art={model,shell,player,b,cy,ball,n,rgb};})();
