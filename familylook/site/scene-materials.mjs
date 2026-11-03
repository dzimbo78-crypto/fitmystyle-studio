import * as THREE from './vendor/three.module.js';
const cache=new Map(),size=256;
function canvas(){const c=document.createElement('canvas');c.width=c.height=size;return c;}
const noise=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
function heightAt(x,y,fabric){
 let n=noise(x,y)*.08;
 if(['knit','ribbed','cable_knit'].includes(fabric)){const u=x/size*24*Math.PI,v=y/size*32*Math.PI;n+=.38*Math.sin(u+Math.sin(v)*.9)*Math.sin(v);if(fabric==='ribbed')n+=.5*Math.sin(u*.7);if(fabric==='cable_knit')n+=.35*Math.cos(u*.3+Math.sin(v*.16)*2);}
 else if(fabric==='linen'||fabric==='oxford'||fabric==='twill')n+=.13*Math.sin(x*Math.PI/2)+.12*Math.sin(y*Math.PI/2);
 else if(fabric==='pique')n+=.22*Math.sin(x*.8)*Math.sin(y*.8);
 else if(fabric==='fleece')n+=noise(x*.7,y*.7)*.15;
 else n+=.09*Math.sin(x*1.5)*Math.sin(y*2);
 return n;
}
export function textileMaps(fabric='jersey',pattern='plain'){
 const key=fabric+':'+pattern;if(cache.has(key))return cache.get(key);
 const diffuse=canvas(),d=diffuse.getContext('2d'),pixels=d.createImageData(size,size),normal=canvas(),n=normal.getContext('2d'),np=n.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,h=heightAt(x,y,fabric),dx=heightAt((x+1)%size,y,fabric)-heightAt((x-1+size)%size,y,fabric),dy=heightAt(x,(y+1)%size,fabric)-heightAt(x,(y-1+size)%size,fabric);const v=242+h*15;pixels.data.set([v,v,v,255],i);np.data.set([128-dx*55,128+dy*55,250,255],i);}
 d.putImageData(pixels,0,0);n.putImageData(np,0,0);d.strokeStyle='rgba(40,40,36,.36)';d.fillStyle='rgba(40,40,36,.22)';
 const line=(x1,y1,x2,y2,w=2)=>{d.lineWidth=w;d.beginPath();d.moveTo(x1,y1);d.lineTo(x2,y2);d.stroke();};
 if(['stripe','pinstripe','windowpane','check','gingham'].includes(pattern)){const step=pattern==='pinstripe'?32:64;for(let i=0;i<size;i+=step){if(pattern==='stripe')d.fillRect(0,i,size,12);else line(i,0,i,size,pattern==='gingham'?20:2);if(['windowpane','check','gingham'].includes(pattern))line(0,i,size,i,pattern==='gingham'?20:2);}}
 if(['dots','seed','boucle'].includes(pattern))for(let y=8;y<size;y+=24)for(let x=8;x<size;x+=24){d.beginPath();d.arc(x+(y%48?12:0),y,pattern==='dots'?2:4,0,Math.PI*2);d.fill();}
 if(['herringbone','twill','fisherman','waffle','rib','cable','melange','fairisle','argyle','diamond','houndstooth'].includes(pattern))for(let y=0;y<size;y+=16)for(let x=0;x<size;x+=16){
  if(pattern==='waffle')d.strokeRect(x+2,y+2,12,12);
  else if(pattern==='rib')line(x,0,x,size,1);
  else if(pattern==='melange'){d.globalAlpha=.4;line(x,y,x+12,y+3,1);}
  else if(['argyle','diamond','fairisle'].includes(pattern)){d.beginPath();d.moveTo(x+8,y);d.lineTo(x+16,y+8);d.lineTo(x+8,y+16);d.lineTo(x,y+8);d.closePath();if((x/16+y/16)%2)d.fill();else d.stroke();}
  else if(pattern==='houndstooth'){d.fillRect(x,y,8,8);d.fillRect(x+8,y+8,4,4);}
  else if(pattern==='cable'){d.beginPath();d.moveTo(x,y);d.bezierCurveTo(x+14,y+4,x-6,y+12,x+8,y+16);d.stroke();}
  else line(x,y,x+16,y+(x%32?-16:16),1.1);
 }
 const map=new THREE.CanvasTexture(diffuse);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(4,4);map.anisotropy=4;
 const normalMap=new THREE.CanvasTexture(normal);normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;normalMap.repeat.set(5,5);
 const result={map,normalMap};cache.set(key,result);return result;
}
export function clothMaterial(spec,color=spec.color,fabric=spec.template.fabric,pattern=spec.pattern){const maps=textileMaps(fabric,pattern),knit=/knit|ribbed|fleece/.test(fabric);return new THREE.MeshPhysicalMaterial({color,map:maps.map,normalMap:maps.normalMap,normalScale:new THREE.Vector2(knit?.32:.16,knit?.32:.16),roughness:fabric==='linen'?.98:.88,metalness:0,sheen:knit?.65:.25,sheenRoughness:.85,sheenColor:new THREE.Color(color),side:THREE.DoubleSide});}
export function disposeModel(group){const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});for(const g of geometries)g.dispose();for(const m of materials){if(m.userData.ownedTexture)m.map?.dispose();m.dispose();}group.clear();}
