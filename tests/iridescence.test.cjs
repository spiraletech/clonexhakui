'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function source(file){return fs.readFileSync(path.join(__dirname,'..',file),'utf8');}
function setup(){
  const ctx={window:{},Float32Array,Uint16Array,URL};
  vm.createContext(ctx);
  for(const file of ['js/core.js','js/renderer.js','js/hakui-embodiment.js','js/assets.js','js/iridescence-lab.js']){
    vm.runInContext(source(file),ctx,{filename:file});
  }
  return ctx.window.CLONE;
}
test('four distinct deterministic surface codes are registered',()=>{
  const C=setup(),ids=Object.values(C.iridescenceLab.MATERIALS).map(x=>x.id);
  assert.equal(new Set(ids).size,4);
  assert.equal(JSON.stringify(ids),JSON.stringify([7,8,9,10]));
});
test('home projection exposes all four materials and does not change world truth',()=>{
  const C=setup(),world=C.fresh(123),before=JSON.stringify(world);
  const shell=C.art.shell('home'),original=JSON.stringify(shell);
  const rendered=C.iridescenceLab.applyShell(shell,'home');
  let ids=new Set(rendered.map(n=>n.m));
  for(const kind of ['fridge','shower','wardrobe','computer']){
    const asset=world.items.find(i=>i.kind===kind);
    const beforeMesh=C.art.model(asset);
    const afterMesh=C.iridescenceLab.applyItem(asset,beforeMesh);
    assert.equal(beforeMesh.length,afterMesh.length);
    for(const [a,b] of afterMesh.entries()){
      assert.equal(JSON.stringify(a.p),JSON.stringify(beforeMesh[b].p));
      assert.equal(JSON.stringify(a.s),JSON.stringify(beforeMesh[b].s));
      assert.equal(JSON.stringify(a.r),JSON.stringify(beforeMesh[b].r));
      ids.add(a.m);
    }
  }
  for(const id of [7,8,9,10])assert.ok(ids.has(id),'missing surface '+id);
  assert.equal(rendered.length,shell.length);
  assert.equal(JSON.stringify(shell),original);
  assert.equal(JSON.stringify(world),before);
});
test('disable restores the exact original visual surface projection',()=>{
  const C=setup(),L=C.iridescenceLab,world=C.fresh(2),shell=C.art.shell('home'),base=JSON.stringify(shell);
  L.setEnabled(false);
  assert.equal(JSON.stringify(L.applyShell(shell,'home')),base);
  const fridge=world.items.find(x=>x.kind==='fridge'),nodes=C.art.model(fridge);
  assert.equal(JSON.stringify(L.applyItem(fridge,nodes)),JSON.stringify(nodes));
});
test('mode, lighting and parameters reject invalid changes',()=>{
  const C=setup(),L=C.iridescenceLab;
  assert.equal(L.setMode('neon-alien'),false);
  assert.equal(L.setLighting('solar-flare'),false);
  assert.equal(L.setParameter('thickness',NaN),false);
  assert.equal(L.setParameter('unknown',.5),false);
  assert.equal(L.setMode('opal'),true);
  assert.equal(L.setLighting('warm'),true);
  L.setParameter('thickness',3000);
  assert.equal(L.snapshot().thickness,900);
  L.setParameter('roughness',-5);
  assert.equal(L.snapshot().roughness,0);
  const scene=L.applyShell(C.art.shell('home'),'home').filter(n=>n.m>=7&&n.m<=10);
  assert.ok(scene.length>0);
  assert.ok(scene.every(n=>n.m===9));
});
test('shader has thin-film control uniforms and color output path',()=>{
  const C=setup(),f=C.polygonShaderSource.fragment;
  for(const symbol of ['uLabEnabled','uLabLighting','uFilmStrength','uFilmThickness','uFilmRoughness','interference','cos(phase)']){
    assert.ok(f.includes(symbol),'missing shader symbol '+symbol);
  }
  assert.ok(f.includes('kind>=7.&&kind<=10.'));
});
test('browser boot declares lab after art and before game',()=>{
  const html=source('index.html');
  assert.ok(html.includes('id="iridescence"'));
  const art=html.indexOf('js/assets.js'),lab=html.indexOf('js/iridescence-lab.js'),game=html.indexOf('js/game.js');
  assert.ok(art>=0&&lab>art&&game>lab);
});
