/* Offline Mesa/GLES proof exporter for experimental iridescent home.
 * Uses the exact shipped polygon shader and original meshes.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const v={window:{},Float32Array,Uint16Array,URL};
vm.createContext(v);
for(const n of ['core','renderer','hakui-embodiment','assets','iridescence-lab']){
  vm.runInContext(fs.readFileSync(path.join(root,'js',n+'.js'),'utf8'),v,{filename:n+'.js'});
}
const C=v.window.CLONE,s=C.fresh(417);
s.phase='playing';s.player.zone='home';
const lab=C.iridescenceLab;lab.setEnabled(true);lab.setMode('gallery');lab.setLighting('moon');
const nodes=[
  ...lab.applyShell(C.art.shell('home'),'home'),
  ...s.items.filter(i=>i.zone==='home').flatMap(i=>lab.applyItem(i,C.art.model(i))),
  ...C.art.player(s,0,C.hakuiAnimation.makeController().step('player',s.player,.016))
];
const materials=new Set(nodes.map(n=>n.m));
for(const id of [7,8,9,10])if(!materials.has(id))throw new Error('Expected material missing: '+id);
const data={
  shaders:C.polygonShaderSource,
  light:Array.from(C.polygonLightMatrix()),
  geometry:{},
  scenes:{'iridescent-home':[{id:'iridescent-home',nodes}]},
  views:{'iridescent-home':{scale:1.05,center:[64,285]}},
  lamps:{'iridescent-home':[[4,8,1.6,.6]]},
  lab:lab.snapshot()
};
for(const k of C.polygonPrimitives){
  const g=C.polygonGeometry(k);
  data.geometry[k]={vertices:Array.from(g.vertices),indices:Array.from(g.indices),triangles:g.triangles};
}
const out=path.join(root,'qa','iridescence');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'runtime-polygons.json'),JSON.stringify(data));
console.log(JSON.stringify({scene:'iridescent-home',meshes:nodes.length,materials:[...materials].sort((a,b)=>a-b)},null,2));
