import {paintDesign} from './design-layer.mjs';
import * as THREE from './vendor/three.module.js';
import {clamp,printPlacement,safeColor} from './scene-model.mjs';
import {clothMaterial} from './scene-materials.mjs';
const TAU=Math.PI*2;
let lowDetail=false;
function surface(fn,nu=64,nv=32){if(lowDetail){nu=Math.min(nu,24);nv=Math.min(nv,12);}const pos=[],uv=[],idx=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){pos.push(...fn(i/nu,j/nv));uv.push(i/nu,j/nv);}for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,a+1,b,b,a+1,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
export function buildMannequin(spec,person,artwork,overlayImage=null){
 lowDetail=spec.quality==='software';
 const group=new THREE.Group();group.userData.memberId=person.id;
 const {height:h,s,headYRadius:hr,shoulderY:sy,hipY:hy,chestR:cr,waistR:wr,hipR:hip,shoulder:sh,ease,baby,child,template:t}=spec;
 const skin=new THREE.MeshStandardMaterial({color:spec.skin,roughness:.64,metalness:0});
 const cloth=clothMaterial(spec),rib=clothMaterial(spec,spec.color,'ribbed','plain');
 const bottom=clothMaterial({...spec,pattern:'plain'},t.kind==='pants'||t.id==='T20'?spec.color:'#a8a293','twill','plain');
 const shoes=new THREE.MeshStandardMaterial({color:'#e4e1d7',roughness:.82});
 const seam=new THREE.MeshStandardMaterial({color:new THREE.Color(spec.color).multiplyScalar(.78),roughness:1});
 const add=(geometry,material)=>{const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const ball=(x,y,z,rx,ry,rz,mat=skin)=>{const m=add(new THREE.SphereGeometry(1,lowDetail?20:40,lowDetail?12:28),mat);m.position.set(x,y,z);m.scale.set(rx,ry,rz);return m;};
 function tube(points,radii,material,depth=.9,fold=.0){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),frames=curve.computeFrenetFrames(24,false);return add(surface((u,v)=>{const p=curve.getPointAt(v),i=Math.min(23,Math.floor(v*24)),a=-u*TAU,k=v*(radii.length-1),q=Math.min(radii.length-2,Math.floor(k)),r=(radii[q]+(radii[q+1]-radii[q])*(k-q))*(1+fold*Math.sin(v*34+Math.cos(a)*2));const vec=p.clone().addScaledVector(frames.normals[i],r*Math.sin(a)).addScaledVector(frames.binormals[i],r*depth*Math.cos(a));return vec.toArray();},40,24),material);}
 function stitch(points,r=.0009*s,mat=seam){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*3),r,5,false),mat);}
 const headY=h-hr*1.02,headW=hr*(baby?.83:.73),headD=hr*.80;
 // Smooth anatomical head, shaped jaw and natural profile. Neutral display mannequin.
 add(surface((u,v)=>{const a=u*TAU,b=(v-.5)*Math.PI,yy=Math.sin(b),jaw=yy<-.2?1-(Math.abs(yy)-.2)*.19:1;const front=Math.max(0,Math.cos(a));const nose=front**35*Math.exp(-(((yy+.12)/.18)**2))*hr*.14;return [headW*Math.cos(b)*Math.sin(a)*jaw,headY+hr*yy,headD*Math.cos(b)*Math.cos(a)+nose];},64,40),skin);
 for(const sign of [-1,1]){ball(sign*headW*.99,headY-.01*s,0,hr*.12,hr*.22,hr*.18);ball(sign*headW*.39,headY+hr*.05,headD*.94,hr*.12,hr*.022,hr*.013,new THREE.MeshStandardMaterial({color:new THREE.Color(spec.skin).multiplyScalar(.69),roughness:.8}));}
 tube([[0,sy-.03*s,0],[0,headY-hr*.70,0]],[.047*s,.044*s],skin,.85);
 if(spec.hair!=='none'){const hair=new THREE.MeshStandardMaterial({color:'#544137',roughness:.94});add(surface((u,v)=>{const a=u*TAU,b=(.18+v*.82)*Math.PI/2,limit=spec.hair==='bob'?-.3:.2;const yy=Math.sin(b);return [(headW+.005*s)*Math.cos(b)*Math.sin(a),headY+hr*(limit+(1-limit)*yy),(headD+.005*s)*Math.cos(b)*Math.cos(a)];},48,20),hair);}
 const bodyBase=(u,v)=>{const a=u*TAU,ry=v<.45?hip+(wr-hip)*v/.45:wr+(cr-wr)*(v-.45)/.55;return [ry*Math.sin(a),hy+(sy-hy)*v,ry*.71*Math.cos(a)];};
 add(surface(bodyBase,48,22),skin);
 // Articulated legs and relaxed arms. The infant keeps age-appropriate proportions.
 const legStart=hy-.015*s,kneeY=hy*.53,ankleY=.09*s;
 ball(0,hy-.014*s,0,hip+.004*s,.055*s,hip*.72,t.kind==='dress'||(t.kind==='bodysuit'&&t.id!=='T20')?skin:bottom);
 for(const sign of [-1,1]){
  const lx=sign*hip*.52,ankleX=lx+sign*.018*s;
  const legSkin=t.kind==='dress'||(t.kind==='bodysuit'&&t.id!=='T20');
  tube([[lx,legStart,0],[lx+sign*.008*s,kneeY,.009*s],[ankleX,ankleY,0]],[hip*.48,hip*.34,.040*s],legSkin?skin:bottom,.85,.012);
  ball(ankleX,.047*s,.044*s,.055*s,.045*s,.112*s,shoes);
  const armTop=[sign*(sh+.008*s),sy-.055*s,0],elbow=[sign*(sh+.067*s),sy-(sy-hy)*.57,.008*s],wrist=[sign*(sh+.065*s),hy-.05*s,.035*s];
  tube([armTop,elbow,wrist],[.058*s,.044*s,.031*s],skin,.83);
  ball(wrist[0],wrist[1]-.051*s,wrist[2]+.003*s,.032*s,.066*s,.025*s);
  ball(wrist[0]-sign*.025*s,wrist[1]-.033*s,wrist[2]+.012*s,.012*s,.031*s,.014*s);
 }
 // Body and clothing dimensions are distinct. The visible garment uses a preview ease.
 const kind=t.kind==='pants'?'tee':t.kind,short=['tee','polo'].includes(kind)||(kind==='bodysuit'&&t.id==='T19');
 const topMat=t.kind==='pants'?clothMaterial({...spec,pattern:'plain'},'#eae5da','jersey','plain'):cloth;
 const topRib=t.kind==='pants'?topMat:rib;
 const hem=kind==='dress'?h*.285:kind==='bodysuit'?hy-.065*s:hy-.006*s-(person.fit==='oversized'?.048*s:0);
 const widthAt=v=>{let r=v<.4?hip+(wr-hip)*v/.4:wr+(cr-wr)*(v-.4)/.6;if(kind==='dress')r+=.18*s*(1-v)**2;if(kind==='bodysuit')r*=.94;return r+ease;};
 const topAt=a=>sy-(kind==='sweater'&&t.id==='T12'?.12*s*Math.max(0,Math.cos(a))**12:0);
 const clothPoint=(a,v,extra=0)=>{const r=widthAt(v),fold=.0022*s*Math.sin(a*7+v*14)*Math.sin(Math.PI*v)+.0015*s*Math.sin(a*13)*Math.exp(-v*8);const bust=person.shape==='female'&&!baby&&!child?.012*s*Math.max(0,Math.cos(a))*Math.exp(-(((v-.72)/.15)**2)):0;return [(r+fold+extra)*Math.sin(a),hem+(topAt(a)-hem)*v,(r*.72+fold+extra)*Math.cos(a)+bust];};
 add(surface((u,v)=>clothPoint(u*TAU,v),72,38),topMat);
 // Shoulder yoke joins to the circular neck opening instead of sealing the top flat.
 add(surface((u,v)=>{const a=u*TAU,inner=.045*s,outer=widthAt(1),r=inner+(outer-inner)*v;return [r*Math.sin(a),topAt(a)+.012*s*(1-v)-.023*s*v*v,r*.72*Math.cos(a)];},64,10),topMat);
 const collarHeight=t.id==='T10'?.09*s:.012*s;
 tube([[0,sy-.005*s,0],[0,sy+collarHeight,0]],[t.id==='T10'?.058*s:.052*s,t.id==='T10'?.055*s:.052*s],topRib,.72);
 // Sleeve tubes, gently rounded shoulder caps, cuffs and garment hems.
 for(const sign of [-1,1]){
  const dropped=person.fit==='oversized'?.016*s:0;
  const start=[sign*(sh-.022*s+dropped),sy-.048*s,0],end=short?[sign*(sh+.065*s),sy-.22*s,.012*s]:[sign*(sh+.066*s),hy-.008*s,.033*s];
  const middle=[sign*(sh+.063*s),short?sy-.13*s:sy-(sy-hy)*.57,.01*s];
  const radius=.071*s+ease*.36;
  ball(start[0],start[1],0,radius,radius*.92,radius,topMat);
  tube([start,middle,end],[radius,short?radius*.92:.058*s+ease*.25,short?radius*.87:.041*s+ease*.25],topMat,1,.017);
  const cuffStart=[end[0],end[1]+(short?.012:.037)*s,end[2]];
  tube([cuffStart,end],[short?radius*.89:.043*s+ease*.23,short?radius*.88:.042*s+ease*.23],['shirt','polo','tee'].includes(kind)?topMat:topRib);
 }
 if(['crewneck','hoodie','sweater'].includes(kind))add(surface((u,v)=>{const a=u*TAU,p=clothPoint(a,v*.057,.0008*s);return p;},72,4),topRib);
 else stitch(Array.from({length:65},(_,i)=>clothPoint(i/64*TAU,.015,.001*s)));
 // Recognisable tailoring details for the twenty fixed template IDs.
 function button(x,y,z,r=.006*s){const m=add(new THREE.CylinderGeometry(r,r,.003*s,16),seam);m.rotation.x=Math.PI/2;m.position.set(x,y,z);}
 if(kind==='shirt'||kind==='polo'||['T07','T11','T12'].includes(t.id)){
  const end=kind==='polo'||t.id==='T11'?sy-.15*s:hem+.015*s;
  const zs=y=>widthAt(clamp((y-hem)/(sy-hem),0,1))*.72+.005*s;
  stitch([[0,sy-.01*s,zs(sy)],[0,end,zs(end)]],.004*s,topRib);
  for(let y=sy-.085*s;y>end;y-=.075*s)button(.001*s,y,zs(y)+.003*s);
  if(['T07','T11'].includes(t.id))stitch([[.005*s,sy-.04*s,zs(sy)],[.005*s,end,zs(end)]],.0012*s,new THREE.MeshStandardMaterial({color:'#a5a095',metalness:.7,roughness:.4}));
  if(kind==='shirt'||kind==='polo')for(const sign of [-1,1]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([sign*.018*s,sy+.016*s,.037*s,sign*.085*s,sy-.026*s,.087*s,sign*.041*s,sy-.105*s,.111*s],3));g.computeVertexNormals();add(g,topRib);}
 }
 if(kind==='hoodie'){
  // Folded, open hood behind the neck. Children's templates deliberately omit cords.
  add(surface((u,v)=>{const a=(u-.5)*Math.PI*1.55,r=.065*s+.043*s*Math.sin(v*Math.PI);return [r*Math.sin(a),sy-.035*s+v*.115*s,-.025*s-r*Math.cos(a)];},48,16),cloth);
  if(t.id==='T06'){const y=hem+.14*s;stitch([[-.105*s,y+.035*s,widthAt(.2)*.72+.008*s],[-.075*s,y-.04*s,widthAt(.1)*.72+.009*s],[.075*s,y-.04*s,widthAt(.1)*.72+.009*s],[.105*s,y+.035*s,widthAt(.2)*.72+.008*s]],.0014*s);}
 }
 if(kind==='bodysuit'){
  if(t.id==='T19'){stitch([[-cr*.82,sy-.055*s,.055*s],[.075*s,sy-.2*s,cr*.72+.006*s],[.072*s,hem+.05*s,hip*.72+.006*s]],.0013*s);for(const x of [-.028,0,.028])button(x*s,hem+.016*s,hip*.7,.004*s);}
 }
 if(t.kind==='pants'){
  tube([[0,hy-.006*s,0],[0,hy+.052*s,0]],[hip+ease,hip+ease],rib,.72);
  stitch([[-hip*.65,hy+.038*s,hip*.58],[0,hy+.038*s,hip*.73],[hip*.65,hy+.038*s,hip*.58]],.001*s);
 }
 // Independent, curved print surface with UVs. It follows the visible garment face.
 if(artwork.enabled!==false&&(artwork.text||overlayImage)&&t.kind!=='pants'){
  const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');
  paintDesign(ctx,artwork,overlayImage,1024);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
  const mat=new THREE.MeshStandardMaterial({map:tx,transparent:true,depthWrite:false,roughness:.88,polygonOffset:true,polygonOffsetFactor:-1,side:THREE.DoubleSide});mat.userData.ownedTexture=true;
  const place=printPlacement(spec,artwork),sign=place.back?-1:1;
  const decal=add(surface((u,v)=>{const y=place.centerY+(v-.5)*place.height,ratio=clamp((y-hem)/(sy-hem),.03,.92),rx=widthAt(ratio),x=((place.back?1-u:u)-.5)*place.width+place.offsetX*cr,theta=Math.asin(clamp(x/rx,-.88,.88));const p=clothPoint(place.back?Math.PI-theta:theta,ratio,.0016*s);p[1]=y;return p;},32,14),mat);decal.userData.print=true;
 }
 // Side seams, armhole line and subtle trouser crease provide useful construction cues.
 for(const sign of [-1,1])stitch(Array.from({length:16},(_,i)=>clothPoint(sign*Math.PI/2,i/15,.0009*s)),.00065*s);
 group.traverse(o=>{o.userData.memberId=person.id;});group.userData.spec=spec;return group;
}
