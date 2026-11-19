/* EtherTech IRIDESCENCE 001 — read-only material projection.
 * No HOME writes, mesh transforms, collision or save-schema changes.
 * Uses four deterministic surface IDs (7–10) understood by renderer.js.
 */
(function(root){
  'use strict';
  const C=root.CLONE;
  if(!C||!C.art)throw new Error('Iridescence lab requires CLONE geometry');
  const MATERIALS=Object.freeze({
    pearl:Object.freeze({id:7,label:'Moonlit Pearl',color:Object.freeze([.75,.65,.85])}),
    mercury:Object.freeze({id:8,label:'Midnight Mercury',color:Object.freeze([.31,.36,.46])}),
    opal:Object.freeze({id:9,label:'Opal Glass',color:Object.freeze([.45,.69,.74])}),
    oil:Object.freeze({id:10,label:'Obsidian Oil Film',color:Object.freeze([.19,.22,.32])})
  });
  const state={enabled:true,mode:'gallery',lighting:'moon',strength:.75,thickness:510,roughness:.22};
  const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
  function choose(kind){
    const name=state.mode==='gallery'?kind:state.mode;
    return MATERIALS[name]||MATERIALS.pearl;
  }
  function coat(node,kind){
    if(!state.enabled)return node;
    const material=choose(kind);
    return {...node,m:material.id,c:material.color.slice()};
  }
  function applyShell(nodes,zone){
    if(!state.enabled||zone!=='home')return nodes;
    // The original shell meshes (and their positions) remain unchanged.
    // Floor tile indices 1–480 have authored metre/quarter-metre coverage.
    return nodes.map((n,index)=>{
      if(index>0&&index<=480&&index%3===0)return coat(n,'oil');
      if(index>480&&n.p[2]>.75&&n.s[2]>.45&&n.s[0]>.4){
        return coat(n,n.s[1]<.09?'opal':'pearl');
      }
      return n;
    });
  }
  const surfaceFor=Object.freeze({
    fridge:'mercury',wardrobe:'pearl',shower:'opal',
    computer:'mercury',lamp:'opal',table:'pearl',
    island:'oil',sink:'mercury'
  });
  function applyItem(item,nodes){
    if(!state.enabled)return nodes;
    const surface=surfaceFor[item?.kind];
    return surface?nodes.map(n=>coat(n,surface)):nodes;
  }
  function setMode(mode){
    if(mode!=='gallery'&&!Object.hasOwn(MATERIALS,mode))return false;
    state.mode=mode;return true;
  }
  function setLighting(mode){
    if(!['moon','warm'].includes(mode))return false;
    state.lighting=mode;return true;
  }
  function setParameter(key,value){
    const limits={strength:[0,1],thickness:[300,900],roughness:[0,1]};
    if(!Object.hasOwn(limits,key)||!Number.isFinite(value))return false;
    state[key]=clamp(value,...limits[key]);return true;
  }
  const snapshot=()=>({...state});
  C.iridescenceLab={
    MATERIALS,state,snapshot,applyShell,applyItem,setMode,setLighting,setParameter,
    setEnabled(on){state.enabled=Boolean(on);return state.enabled;}
  };
  if(typeof module!=='undefined')module.exports=C.iridescenceLab;
})(typeof window!=='undefined'?window:globalThis);
