/** Build optimized atlases, independently cleaned masks, and real catalog thumbnails. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(new URL('../next-app/package.json',import.meta.url));
const sharp=require('sharp'),out=fileURLToPath(new URL('../site/assets/photo-v4/',import.meta.url));
const sources=JSON.parse(await readFile(process.argv[2],'utf8'));await mkdir(out,{recursive:true});
const manifest={version:'4.0.0',source:'ORIGINAL_GENERATED_TEMPLATE',supplierVerified:false,width:1600,height:800,items:{}};
for(const {id,path} of sources){
 const {data,info}=await sharp(path).resize(1600,800,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width:w,height:h}=info;
 const cleaned=new Uint8Array(w*h),sides={};
 for(const [side,left] of [['front',0],['back',800]]){
  const seen=new Uint8Array(w*h),components=[];
  for(let y=1;y<h-1;y++)for(let x=left+1;x<left+799;x++){
   const idx=y*w+x;if(seen[idx]||data[idx*4+3]<100)continue;const queue=[idx];seen[idx]=1;
   for(let j=0;j<queue.length;j++){const i=queue[j],ix=i%w;for(const n of [i-w,i+w,ix>left?i-1:-1,ix<left+799?i+1:-1])if(n>=0&&n<w*h&&!seen[n]&&data[n*4+3]>=100){seen[n]=1;queue.push(n);}}
   components.push(queue);
  }
  const largest=Math.max(...components.map(c=>c.length)),keep=components.filter(c=>c.length>=Math.max(1200,largest*.022));let minX=w,minY=h,maxX=0,maxY=0,count=0;
  for(const c of keep)for(const i of c){cleaned[i]=data[i*4+3];const x=i%w,y=Math.floor(i/w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}
  if(!count)throw Error(`${id} ${side}: empty mask`);
  sides[side]={crop:{x:Math.max(left,minX-3),y:Math.max(0,minY-3),w:Math.min(left+800,maxX+4)-Math.max(left,minX-3),h:Math.min(h,maxY+4)-Math.max(0,minY-3)},coverage:Number((count/(800*h)).toFixed(4))};
 }
 const mask=Buffer.alloc(w*h*4);for(let i=0;i<w*h;i++){mask[i*4]=mask[i*4+1]=mask[i*4+2]=255;mask[i*4+3]=cleaned[i];}
 await sharp(data,{raw:{width:w,height:h,channels:4}}).webp({quality:91,alphaQuality:100}).toFile(out+id+'.webp');
 await sharp(mask,{raw:{width:w,height:h,channels:4}}).png().toFile(out+id+'.mask.png');
 // Uniform warm ivory makes differences of construction easy to compare.
 const thumb=Buffer.from(data);for(let i=0;i<w*h;i++){const j=i*4,lum=.2126*data[j]+.7152*data[j+1]+.0722*data[j+2],s=Math.max(.16,Math.min(1.07,(lum/239)**1.42));for(let k=0;k<3;k++)thumb[j+k]=[229,223,210][k]*s;thumb[j+3]=cleaned[i];}
 for(const side of ['front','back']){const c=sides[side].crop;await sharp(thumb,{raw:{width:w,height:h,channels:4}}).extract({left:c.x,top:c.y,width:c.w,height:c.h}).resize(460,560,{fit:'contain',background:'#f0f0e9'}).flatten({background:'#f0f0e9'}).webp({quality:88}).toFile(out+id+'-'+side+'.webp');}
 manifest.items[id]={atlas:id+'.webp',mask:id+'.mask.png',...sides};
}
await writeFile(out+'manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('20 atlases, 20 masks, 40 catalog views');
