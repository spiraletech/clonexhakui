/* RSA's local WebGL2 renderer. Shared indexed meshes, instanced transforms and one material atlas. */
(function () {
  'use strict';
  const R=window.CLONE, STRIDE=14, MAX=16384;
  const VS=`#version 300 es
  precision highp float;
  layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNormal;
  layout(location=2) in vec3 iPos; layout(location=3) in vec3 iSize;
  layout(location=4) in vec3 iRot; layout(location=5) in vec3 iColor;
  layout(location=6) in vec2 iSurface;
  uniform vec4 uView; uniform mat4 uLight; uniform bool uDepth;
  out vec3 vPos; out vec3 vNormal; out vec3 vColor; out vec2 vSurface; out vec4 vShadow;
  mat3 rotation(vec3 r){vec3 c=cos(r),s=sin(r);return mat3(c.z,s.z,0.,-s.z,c.z,0.,0.,0.,1.)*mat3(c.y,0.,-s.y,0.,1.,0.,s.y,0.,c.y)*mat3(1.,0.,0.,0.,c.x,s.x,0.,-s.x,c.x);}
  void main(){mat3 m=rotation(iRot);vec3 p=m*(aPos*iSize)+iPos;
    vPos=p;vNormal=normalize(m*(aNormal/max(iSize,vec3(.001))));vColor=iColor;vSurface=iSurface;vShadow=uLight*vec4(p,1.);
    gl_Position=uDepth?vShadow:vec4((p.x-p.y)*64.*uView.x+uView.z,((p.x+p.y)*32.-p.z*56.)*uView.y+uView.w,.55-(p.x+p.y+p.z*1.142857)*.018,1.);
  }`;
  const FS=`#version 300 es
  precision highp float;
  in vec3 vPos;in vec3 vNormal;in vec3 vColor;in vec2 vSurface;in vec4 vShadow;
  uniform sampler2D uAtlas;uniform sampler2D uShadow;uniform bool uDepth;uniform float uDay;uniform float uTime;
  uniform vec4 uLamps[4];uniform int uLampCount;
  out vec4 frag;
  float visibility(vec3 n){vec3 p=vShadow.xyz*.5+.5;if(p.x<0.||p.y<0.||p.x>1.||p.y>1.||p.z>1.)return 1.;
    float bias=max(.0023,.005*(1.-dot(n,normalize(vec3(-.6,-.4,1.))))),s=0.;
    for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)s+=p.z-bias<=texture(uShadow,p.xy+vec2(x,y)*1.7/2048.).r?1.:0.;return s/9.;}
  void main(){if(uDepth){frag=vec4(1.);return;}
    vec3 n=normalize(vNormal),an=abs(n);float kind=vSurface.x;
    vec2 uv=an.z>.65?vPos.xy:an.x>an.y?vPos.yz:vPos.xz;
    uv*=kind==1.?vec2(.7,1.2):kind==2.?vec2(6.):kind==3.?vec2(2.):vec2(1.5);
    vec2 tile=vec2(mod(kind,4.),floor(kind/4.));vec3 tex=texture(uAtlas,(tile+(fract(uv)*.98+.01))/vec2(4.,2.)).rgb;
    float textureStrength=kind==1.?.85:kind==2.?.62:.38;
    vec3 base=pow(vColor,vec3(2.2))*mix(vec3(1.),tex*1.48,textureStrength);
    if(kind==6.){float ripple=sin(vPos.x*24.+vPos.y*19.-uTime*2.)*.06+sin(vPos.y*31.+uTime*1.6)*.025;base*=1.+ripple;}
    vec3 L=normalize(vec3(-.6,-.4,1.));float ndl=max(0.,dot(n,L)),sh=visibility(n);
    float hemi=.40+.18*n.z+.035*n.y;float ao=mix(.78,1.,smoothstep(0.,.45,vPos.z));
    vec3 light=vec3(.86,.91,1.)*hemi*ao+vec3(1.16,1.04,.87)*ndl*(.18+.82*sh)*1.45;
    float metal=kind==4.?1.:0.;vec3 V=normalize(vec3(1.,1.,1.142857)),H=normalize(L+V);
    vec3 spec=vec3(.2+.65*metal)*pow(max(dot(n,H),0.),(kind==2.?12.:mix(38.,110.,metal)))*(.25+.75*sh);
    for(int i=0;i<4;i++){if(i>=uLampCount)break;vec3 delta=uLamps[i].xyz-vPos;float d=length(delta);float local=max(dot(n,delta/max(d,.01)),0.)*uLamps[i].w/(1.+d*d*.7);light+=vec3(1.1,.82,.48)*local;}
    vec3 c=base*light*mix(.57,1.,uDay)+spec*(kind==2.?.06:.25)+base*vSurface.y*1.8;
    c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);c=pow(clamp(c,0.,1.),vec3(1./2.2));frag=vec4(c,1.);
  }`;
  function geometry(kind){
    const verts=[],norms=[],idx=[];
    function tri(a,b,c,na,nb,nc){const k=verts.length/3;verts.push(...a,...b,...c);norms.push(...na,...(nb||na),...(nc||na));idx.push(k,k+1,k+2);}
    if(kind==='box'||kind==='round'||kind==='soft'){
      const b=kind==='soft'?.22:kind==='round'?.055:0, grid=b?[-.5,-.5+b,.5-b,.5]:[-.5,.5];
      for(let axis=0;axis<3;axis++)for(const side of [-1,1]){
        const u=(axis+1)%3,v=(axis+2)%3;
        function point(x,y){const p=[0,0,0];p[axis]=side*.5;p[u]=x;p[v]=y;const q=p.map(t=>Math.max(-.5+b,Math.min(.5-b,t))),d=p.map((t,i)=>t-q[i]),len=Math.hypot(...d);const n=b?d.map(t=>t/len):[0,0,0];if(!b)n[axis]=side;return {p:b?q.map((t,i)=>t+n[i]*b):p,n};}
        for(let j=0;j<grid.length-1;j++)for(let i=0;i<grid.length-1;i++){
          const p=[point(grid[i],grid[j]),point(grid[i+1],grid[j]),point(grid[i+1],grid[j+1]),point(grid[i],grid[j+1])];
          for(const ids of side>0?[[0,1,2],[0,2,3]]:[[0,2,1],[0,3,2]])tri(...ids.map(k=>p[k].p),...ids.map(k=>p[k].n));
        }
      }
    }else if(kind==='leaf'){
      for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;tri([0,0,.05],[Math.cos(a)*.5,Math.sin(a)*.5,0],[Math.cos(b)*.5,Math.sin(b)*.5,0],[0,0,1]);}
    }else if(kind==='cylinder'||kind==='cone'){
      const count=16,top=kind==='cone'?.31:.5;
      for(let i=0;i<count;i++){
        const a=i/count*Math.PI*2,b=(i+1)/count*Math.PI*2;
        const p=[Math.cos(a)*.5,Math.sin(a)*.5,-.5],q=[Math.cos(b)*.5,Math.sin(b)*.5,-.5],s=[Math.cos(a)*top,Math.sin(a)*top,.5],t=[Math.cos(b)*top,Math.sin(b)*top,.5],n=[Math.cos(a),Math.sin(a),kind==='cone'?.19:0],m=[Math.cos(b),Math.sin(b),kind==='cone'?.19:0];
        tri(p,q,t,n,m,m);tri(p,t,s,n,m,n);tri([0,0,.5],s,t,[0,0,1]);tri([0,0,-.5],q,p,[0,0,-1]);
      }
    }else{
      const nx=12,ny=8;
      function point(i,j){const a=i/nx*Math.PI*2,b=j/ny*Math.PI;return [Math.sin(b)*Math.cos(a),Math.sin(b)*Math.sin(a),Math.cos(b)];}
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const p=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];for(const ids of [[0,1,2],[0,2,3]])tri(...ids.map(k=>p[k].map(t=>t*.5)),...ids.map(k=>p[k]));}
    }
    return {vertices:new Float32Array(verts.flatMap((_,i)=>i%3?[]:[...verts.slice(i,i+3),...norms.slice(i,i+3)])),indices:new Uint16Array(idx),triangles:idx.length/3};
  }
  function atlas(gl){
    const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const c=cv.getContext('2d'),im=c.createImageData(1024,512);
    let seed=73421;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let y=0;y<512;y++)for(let x=0;x<1024;x++){
      const k=Math.floor(x/256)+4*Math.floor(y/256),u=x%256,v=y%256,noise=rnd()-.5;
      let value=.69+noise*.055;
      if(k===1)value+=Math.sin(v*.18+Math.sin(u*.025)*2.7)*.055+Math.sin(v*.05+Math.sin(u*.05))*.04;
      if(k===2)value+=((u%4<2)===(v%4<2)?.045:-.04)+noise*.04;
      if(k===3)value+=Math.sin(u*.18+v*.09)*Math.sin(v*.21)*.025+noise*.07;
      if(k===5)value+=noise*.15+Math.sin(u*.04+v*.07)*.035;
      const i=(y*1024+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=Math.round(Math.max(.2,Math.min(1,value))*255);im.data[i+3]=255;
    }
    c.putImageData(im,0,0);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;
  }
  function lightMatrix(){
    const z=[-.6,-.4,1],zl=Math.hypot(...z);for(let i=0;i<3;i++)z[i]/=zl;
    const x=[-z[1],z[0],0],xl=Math.hypot(...x);for(let i=0;i<3;i++)x[i]/=xl;
    const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]],c=[8,6,0];
    const dot=a=>a.reduce((s,n,i)=>s+n*c[i],0);
    return new Float32Array([x[0]/17,y[0]/17,-z[0]/24,0,x[1]/17,y[1]/17,-z[1]/24,0,x[2]/17,y[2]/17,-z[2]/24,0,-dot(x)/17,-dot(y)/17,dot(z)/24,1]);
  }
  class Renderer {
    constructor(overlay){
      this.canvas=document.createElement('canvas');this.canvas.id='polygon-world';this.canvas.setAttribute('aria-hidden','true');overlay.before(this.canvas);
      const gl=this.gl=this.canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:false});if(!gl){this.canvas.remove();throw new Error('WebGL2 is unavailable');}
      const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
      this.program=gl.createProgram();gl.attachShader(this.program,compile(gl.VERTEX_SHADER,VS));gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,FS));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
      this.u=Object.fromEntries(['uView','uLight','uDepth','uDay','uAtlas','uShadow','uLamps[0]','uLampCount','uTime'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.meshes={};
      for(const key of ['box','round','soft','cylinder','cone','sphere','leaf']){
        const g=geometry(key),vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,g.vertices,gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
        const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,g.indices,gl.STATIC_DRAW);
        const instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferData(gl.ARRAY_BUFFER,MAX*STRIDE*4,gl.DYNAMIC_DRAW);
        for(const [loc,size,offset]of [[2,3,0],[3,3,3],[4,3,6],[5,3,9],[6,2,12]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,STRIDE*4,offset*4);gl.vertexAttribDivisor(loc,1);}
        this.meshes[key]={vao,instances,count:g.indices.length,triangles:g.triangles,data:new Float32Array(MAX*STRIDE),used:0};
      }
      this.atlas=atlas(gl);this.shadow=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shadow);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,2048,2048,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      this.fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,this.shadow,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Shadow framebuffer unavailable');gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      this.light=lightMatrix();this.lost=false;this.stats={renderer:'WebGL2 instanced polygon meshes',drawCalls:0,triangles:0,instances:0,materialAtlasBytes:2796204,shadowBytes:16777216};
      this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;R.ui&&R.ui.toast('3D graphics interrupted. Restoring the scene…');});
      this.canvas.addEventListener('webglcontextrestored',()=>{this.canvas.remove();location.reload();});
    }
    render(nodes,view,day,lamps=[]){
      if(this.lost)return false;const gl=this.gl,w=view.w,h=view.h;if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
      for(const m of Object.values(this.meshes)){m.previous=m.used;m.used=0;}
      let dirty=!this.shadowValid;
      let triangles=0,count=0;
      for(const n of nodes){const m=this.meshes[n.g||'round'];if(m.used>=MAX)throw new Error('3D instance budget exceeded');const off=m.used++*STRIDE;const row=[...n.p,...n.s,...(n.r||[0,0,0]),...n.c,n.m||0,n.e||0];for(let i=0;i<STRIDE;i++){if(Math.abs(m.data[off+i]-row[i])>.000001)dirty=true;m.data[off+i]=row[i];}triangles+=m.triangles;count++;}
      for(const m of Object.values(this.meshes))if(m.used!==m.previous)dirty=true;
      const active=Object.values(this.meshes).filter(m=>m.used);if(dirty)for(const m of active){gl.bindBuffer(gl.ARRAY_BUFFER,m.instances);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.data.subarray(0,m.used*STRIDE));}
      gl.useProgram(this.program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.uniformMatrix4fv(this.u.uLight,false,this.light);gl.uniform4f(this.u.uView,2*view.scale/w,-2*view.scale/h,2*view.tx/w-1,1-2*view.ty/h);gl.uniform1f(this.u.uDay,day);gl.uniform1f(this.u.uTime,view.time||0);const ls=new Float32Array(16);lamps.slice(0,4).forEach((l,i)=>ls.set(l,i*4));gl.uniform4fv(this.u['uLamps[0]'],ls);gl.uniform1i(this.u.uLampCount,Math.min(4,lamps.length));
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.atlas);gl.uniform1i(this.u.uAtlas,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.atlas);gl.uniform1i(this.u.uShadow,1);
      if(dirty){gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.viewport(0,0,2048,2048);gl.clearDepth(1);gl.clear(gl.DEPTH_BUFFER_BIT);gl.uniform1i(this.u.uDepth,1);
      for(const m of active){gl.bindVertexArray(m.vao);gl.drawElementsInstanced(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0,m.used);}this.shadowValid=true;}
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1i(this.u.uDepth,0);gl.bindTexture(gl.TEXTURE_2D,this.shadow);
      for(const m of active){gl.bindVertexArray(m.vao);gl.drawElementsInstanced(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0,m.used);}
      gl.bindVertexArray(null);this.stats={...this.stats,drawCalls:active.length*(dirty?2:1),shadowUpdated:dirty,triangles,instances:count,framebuffer:[w,h],glError:gl.getError()};return true;
    }
  }
  R.polygonPrimitives=['box','round','soft','cylinder','cone','sphere','leaf']; R.PolygonRenderer=Renderer; R.polygonGeometry=geometry; R.polygonShaderSource={vertex:VS,fragment:FS}; R.polygonLightMatrix=lightMatrix;
})( );
