const FMS_PRESETS=[{"id": "01", "name": "Heritage Hoodie", "cut": "hoodie", "color": "#e6dccb", "fabric": "french-terry", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "02", "name": "Quiet Luxury Crew", "cut": "sweatshirt", "color": "#968578", "fabric": "french-terry", "pattern": "solid", "fit": "relaxed", "sleeve": "long", "body": "woman"}, {"id": "03", "name": "Merino Essential", "cut": "sweater", "color": "#695144", "fabric": "merino", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "04", "name": "Cable Weekend", "cut": "sweater", "color": "#e6dccb", "fabric": "cotton-knit", "pattern": "cable-knit", "fit": "relaxed", "sleeve": "long", "body": "woman"}, {"id": "05", "name": "Sage Half Zip", "cut": "quarterzip", "color": "#9ea58d", "fabric": "merino", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "06", "name": "Navy Office Polo", "cut": "polo", "color": "#253448", "fabric": "jersey", "pattern": "solid", "fit": "regular", "sleeve": "short", "body": "woman"}, {"id": "07", "name": "Ivory Oxford", "cut": "shirt", "color": "#f0ece3", "fabric": "poplin", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "08", "name": "Pinstripe Studio", "cut": "shirt", "color": "#829aaa", "fabric": "poplin", "pattern": "fine-pinstripe", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "09", "name": "Minimal Box Tee", "cut": "tshirt", "color": "#343738", "fabric": "jersey", "pattern": "solid", "fit": "oversize", "sleeve": "short", "body": "woman"}, {"id": "10", "name": "Sand Classic Tee", "cut": "tshirt", "color": "#d7bea0", "fabric": "jersey", "pattern": "solid", "fit": "regular", "sleeve": "short", "body": "woman"}, {"id": "11", "name": "Mocha Cardigan", "cut": "cardigan", "color": "#695144", "fabric": "cotton-knit", "pattern": "solid", "fit": "relaxed", "sleeve": "long", "body": "woman"}, {"id": "12", "name": "Winter Turtleneck", "cut": "mockneck", "color": "#f0ece3", "fabric": "merino", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "13", "name": "Modern Knit Vest", "cut": "knitvest", "color": "#968578", "fabric": "merino", "pattern": "solid", "fit": "regular", "sleeve": "sleeveless", "body": "woman"}, {"id": "14", "name": "Burgundy Bomber", "cut": "bomber", "color": "#76505b", "fabric": "french-terry", "pattern": "solid", "fit": "relaxed", "sleeve": "long", "body": "woman"}, {"id": "15", "name": "Weekend Softshell", "cut": "jacket", "color": "#636947", "fabric": "softshell", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "16", "name": "Casual Knit Dress", "cut": "dress", "color": "#9ea58d", "fabric": "cotton-knit", "pattern": "solid", "fit": "relaxed", "sleeve": "long", "body": "woman"}, {"id": "17", "name": "Heritage Plaid", "cut": "shirt", "color": "#a77e5a", "fabric": "poplin", "pattern": "heritage-plaid", "fit": "relaxed", "sleeve": "long", "body": "woman"}, {"id": "18", "name": "Cream Family Crew", "cut": "sweatshirt", "color": "#f0ece3", "fabric": "french-terry", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "19", "name": "Soft Grey Joggers", "cut": "pants", "color": "#968578", "fabric": "french-terry", "pattern": "solid", "fit": "regular", "sleeve": "long", "body": "woman"}, {"id": "20", "name": "Child Everyday Tee", "cut": "tshirt", "color": "#829aaa", "fabric": "jersey", "pattern": "solid", "fit": "regular", "sleeve": "short", "body": "child"}];
/** FitMyStyle Studio 9: procedural, fabric-shaped 3D garment preview. No external API, no physical simulation. */
import {calculateGarment,getTechnicalPack,FABRICS} from './garment-engine.mjs';
import {TEXTILE_PATTERNS,drawTextileTile,getPattern} from './surface-textures.mjs';
const TAU=Math.PI*2,PI=Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rgb=(hex)=>{const h=/^#[0-9a-f]{6}$/i.test(hex||'')?hex.substring(1):'c9b79c';return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const tone=(hex,m)=>`rgb(${rgb(hex).map(x=>clamp(Math.round(x*m),0,255)).join(',')})`;
const $=id=>document.getElementById(id);
export function initAtelier(){
 const canvas=$('atelier-canvas');if(!canvas||canvas.dataset.initialized)return;canvas.dataset.initialized='1';
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const select=$('atelier-pattern');if(select){select.replaceChildren(...TEXTILE_PATTERNS.map(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.group+' · '+p.name;return opt}));select.value='solid';const swatches=$('atelier-textile-swatches');if(swatches){for(const motif of TEXTILE_PATTERNS){const btn=document.createElement('button');btn.type='button';btn.title=motif.name;btn.dataset.motif=motif.id;btn.setAttribute('aria-label',motif.name);const tex=document.createElement('canvas');drawTextileTile(tex,motif.id);btn.append(tex);const label=document.createElement('span');label.textContent=motif.name;btn.append(label);btn.addEventListener('click',()=>{select.value=motif.id;select.dispatchEvent(new Event('change'));swatches.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===btn))});if(motif.id==='solid')btn.classList.add('selected');swatches.append(btn)}}}

 let angle=-.22,zoom=1,auto=false,pointer=null,frame=0,lastFrame=0;const faces=[],strokes=[];const tileCache=new Map();
 const patternTile=id=>{if(tileCache.has(id))return tileCache.get(id);const cnv=document.createElement('canvas');drawTextileTile(cnv,id);const t=ctx.createPattern(cnv,'repeat');tileCache.set(id,t);return t};
 const val=(id,fallback='')=>$(id)?.value??fallback;
 const checked=(id,fallback=false)=>$(id)?.checked??fallback;
 const palette=[['Ivory','#f0ece3'],['Warm white','#e6dccb'],['Sand','#d7bea0'],['Camel','#a77e5a'],['Taupe','#968578'],['Olive','#636947'],['Charcoal','#343738'],['Navy','#253448'],['Dusty blue','#829aaa'],['Burgundy','#76505b'],['Sage','#9ea58d'],['Mocha','#695144']];
 let artworkImage=null,artworkUrl='';
 const colorBox=$('atelier-colors-library');if(colorBox)palette.forEach(([name,hex])=>{let b=document.createElement('button');b.type='button';b.title=name;b.setAttribute('aria-label','Kolor '+name);b.style.background=hex;b.onclick=()=>{if($('atelier-color')){$('atelier-color').value=hex;$('atelier-color').dispatchEvent(new Event('input'))}colorBox.querySelectorAll('button').forEach(v=>v.classList.toggle('active',v===b))};colorBox.append(b)});
 const fileInput=$('atelier-overlay-file');fileInput?.addEventListener('change',async()=>{const f=fileInput.files?.[0];if(!f)return;if(f.size>2_000_000||!['image/png','image/svg+xml'].includes(f.type)){alert('Wybierz PNG lub SVG do 2 MB');fileInput.value='';return;}if(artworkUrl)URL.revokeObjectURL(artworkUrl);artworkUrl=URL.createObjectURL(f);const im=new Image();im.onload=()=>{artworkImage=im;draw()};im.onerror=()=>{alert('Grafika nie może zostać odczytana.');artworkImage=null};im.src=artworkUrl});
 $('atelier-overlay-clear')?.addEventListener('click',()=>{artworkImage=null;if(artworkUrl)URL.revokeObjectURL(artworkUrl);artworkUrl='';if(fileInput)fileInput.value='';if($('atelier-overlay-text'))$('atelier-overlay-text').value='';draw()});
 let selectedPreset=null;
 const presetHost=$('atelier-template-library');
 const templateControls={cut:'atelier-cut',color:'atelier-color',fabric:'atelier-fabric',pattern:'atelier-pattern',fit:'atelier-fit',sleeve:'atelier-sleeve',body:'atelier-body'};
 const applyTemplate=t=>{if(!t)return;selectedPreset=t;for(const [key,id] of Object.entries(templateControls)){const node=$(id);if(node&&t[key]!=null&&[...node.options||[]].some(o=>o.value===t[key]))node.value=t[key]}
  // The custom artwork/text remains an independent layer and is not overwritten by preset selection.
  if(t.body==='child')updateBodyPreset();document.querySelectorAll('#atelier-template-library button').forEach(b=>b.classList.toggle('active',b.dataset.templateId===t.id));
  if($('atelier-selected-template'))$('atelier-selected-template').textContent=t.name+' · edytowalna baza';
  const opts=$('atelier-pattern');opts?.dispatchEvent(new Event('change'));draw();};
 if(presetHost){FMS_PRESETS.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='atelier-template-card';b.dataset.templateId=t.id;b.setAttribute('aria-label','Wybierz szablon '+t.name);
  const view=document.createElement('span');view.className='atelier-template-swatch';view.style.setProperty('--garment-color',t.color);view.textContent=t.cut==='shirt'?'♧':t.cut==='pants'?'▥':t.cut==='dress'?'♢':'♧';
  const title=document.createElement('strong');title.textContent=t.name;const meta=document.createElement('small');meta.textContent=t.cut+' · '+t.fit;
  b.append(view,title,meta);b.addEventListener('click',()=>applyTemplate(t));presetHost.append(b)});
 }
 $('atelier-reset-template')?.addEventListener('click',()=>applyTemplate(selectedPreset||FMS_PRESETS[0]));
 $('atelier-save-template')?.addEventListener('click',()=>{const out={schema:'fitmystyle-template-v1',templateId:selectedPreset?.id??null,createdAt:new Date().toISOString(),garment:config()};saveBlob(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),'fitmystyle-template.json')});
 $('atelier-load-template')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>200_000){alert('Plik projektu jest za duży');return}try{const data=JSON.parse(await file.text());if(data.schema!=='fitmystyle-template-v1'||!data.garment||typeof data.garment!=='object')throw Error('Nieprawidłowy format');for(const [k,id]of Object.entries(templateControls)){const el=$(id),v=data.garment[k];if(el&&typeof v==='string'&&[...el.options||[]].some(o=>o.value===v))el.value=v}for(const [k,id]of Object.entries({skin:'atelier-skin',overlayText:'atelier-overlay-text',overlayColor:'atelier-overlay-color',overlayPosition:'atelier-overlay-position',stitch:'atelier-stitch',bottomColor:'atelier-bottom-color'})){const el=$(id),v=data.garment[k];if(el&&typeof v==='string'&&v.length<100)el.value=v}selectedPreset=FMS_PRESETS.find(t=>t.id===data.templateId)||null;const pats=$('atelier-pattern');pats?.dispatchEvent(new Event('change'));draw()}catch(err){alert('Nie udało się odczytać projektu: '+err.message)}finally{e.target.value=''}});
 const config=()=>({cut:val('atelier-cut','hoodie'),body:val('atelier-body','woman'),color:val('atelier-color','#d8c3a4'),skin:val('atelier-skin','#d5a57f'),overlayText:val('atelier-overlay-text',''),overlayColor:val('atelier-overlay-color','#efe5d4'),overlayPosition:val('atelier-overlay-position','center'),stitch:val('atelier-stitch','#705442'),fit:val('atelier-fit','regular'),fabric:val('atelier-fabric','french-terry'),sleeve:val('atelier-sleeve','long'),hem:val('atelier-hem','rib'),seams:checked('atelier-seams',true),wire:checked('atelier-wire'),silhouette:checked('atelier-silhouette',true),bottom:checked('atelier-bottom',true),bottomColor:val('atelier-bottom-color','#8d8b80'),pattern:val('atelier-pattern','solid'),chest:Number(val('atelier-chest',92)),waist:Number(val('atelier-waist',76)),hip:Number(val('atelier-hip',98)),height:Number(val('atelier-height',168)),seamAllowanceCm:1,seamType:val('atelier-seam-type','auto')});
 function project(p){const cs=Math.cos(angle),sn=Math.sin(angle),xx=p[0]*cs+p[2]*sn,zz=p[2]*cs-p[0]*sn;const focus=val('atelier-view-mode','garment')==='garment'&&val('atelier-cut','hoodie')!=='pants';const sc=zoom*(focus?145:98)/(1+zz*.035);return [450+xx*sc,focus?385-(p[1]-1.50)*sc:405-p[1]*sc,zz]}
 function face(p,material,kind='cloth',wire=false){const coords=p.map(project),depth=coords.reduce((s,v)=>s+v[2],0)/4;
  // Per-facet lighting with stronger rim shading and a soft cloth texture variation.
  const u=[p[1][0]-p[0][0],p[1][1]-p[0][1],p[1][2]-p[0][2]],v=[p[3][0]-p[0][0],p[3][1]-p[0][1],p[3][2]-p[0][2]];
  let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1;n=n.map(x=>x/len);
  const light=.62+.22*Math.abs(n[0]*-.42+n[1]*.6+n[2]*-.7)+.17*Math.max(0,n[0]*-.3+n[2]*-.93);
  const fabric=FABRICS[kind]||FABRICS.jersey;const grain=kind==='skin'?0:(fabric.texture||.3)*.02*Math.sin(depth*21+p[0][1]*16);
  faces.push({coords,depth,color:tone(material,light+grain),wire,kind});
 }
 function mesh(rows,color,material='jersey',wire=false){for(let i=0;i<rows.length-1;i++)for(let j=0;j<rows[i].length-1;j++)face([rows[i][j],rows[i][j+1],rows[i+1][j+1],rows[i+1][j]],color,material,wire)}
 function ellipsoid(cx,cy,cz,rx,ry,rz,col,mat='skin',wire=false){const rows=[];for(let i=0;i<=16;i++){const a=PI*i/16;const row=[];for(let j=0;j<=28;j++){const t=TAU*j/28;row.push([cx+rx*Math.sin(a)*Math.cos(t),cy+ry*Math.cos(a),cz+rz*Math.sin(a)*Math.sin(t)])}rows.push(row)}mesh(rows,col,mat,wire)}
 function loft(sections,col,mat='jersey',wire=false,fold=.015){const rows=[];for(let i=0;i<sections.length;i++){const s=sections[i],row=[];for(let j=0;j<=48;j++){const a=TAU*j/48;const foldAmount=fold*(.55+.45*Math.sin(i*1.13))*(Math.sin(7*a+i*.8)+.4*Math.cos(12*a-i*.37));let rx=s.rx+foldAmount,rz=s.rz+foldAmount*.62;row.push([s.x+Math.cos(a)*rx,s.y,s.z+Math.sin(a)*rz])}rows.push(row)}mesh(rows,col,mat,wire);return rows}
 function line(pts,col,width=1.3,{dash=[],visibility='all'}={}){strokes.push({p:pts.map(project),col,width,dash,visibility})}
 function ring(y,cx,cz,rx,rz,col,width=1.3,material='all'){const p=[];for(let i=0;i<=48;i++){const a=TAU*i/48;p.push([cx+Math.cos(a)*rx,y,cz+Math.sin(a)*rz])}line(p,col,width,{visibility:material})}
 function curve(pts,col,w=1.1,opts={}){const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];for(let j=0;j<5;j++){let t=j/5;out.push(a.map((x,k)=>x*(1-t)+b[k]*t))}}out.push(pts.at(-1));line(out,col,w,opts)}
 function renderGarment(){faces.length=0;strokes.length=0;const c=config(),m=calculateGarment(c),fabric=m.fabric,fp=m.fabricProperties,cloth=c.color,accent=c.stitch,lightHem=tone(cloth,.84),wire=c.wire;
  const scale=(m.body.height/168)*(.97),body=m.bodyType,shoulderFactor=m.body.shoulder/(body==='man'?46:body==='child'?30:40),chest=m.garment.chest/(body==='child'?72:body==='man'?112:101),waist=m.garment.waist/(body==='child'?67:body==='man'?94:84),hips=m.garment.hip/(body==='child'?77:body==='man'?108:108);
  const g=x=>x*scale,sh=g(.70*shoulderFactor),rCh=g(.65*chest),rWa=g(.48*waist),rHip=g(.54*hips),rz=g(.37);const fold=(.012+fp.drape*.026)*(m.fit==='oversize'?1.25:1);
  // Visible model body, anatomically smoother than cylinder-and-sphere demo.
  if(c.silhouette){ellipsoid(0,g(3.38),0,g(.295),g(.405),g(.28),c.skin);loft([{x:0,y:g(3.08),z:0,rx:g(.14),rz:g(.14)},{x:0,y:g(2.91),z:0,rx:g(.15),rz:g(.15)}],c.skin,'skin',false,0)}
  // Pant legs use tapered elliptical cuts with slight cloth gathers around knees.
  const pantsOnly=c.cut==='pants',showPants=pantsOnly||c.bottom;
  for(const dir of [-1,1]){
   let legCol=showPants?(pantsOnly?cloth:c.bottomColor):c.skin;let legMat=showPants?(pantsOnly?fabric:'denim'):'skin';
   const rows=[];for(let i=0;i<=17;i++){const t=i/17,y=g(.42-3.08*t),x=g(dir*(.26+.038*Math.sin(t*2.8))),rad=g((showPants?.266:.20)*(1-.32*t)+.025*Math.sin(t*PI*2));rows.push({x,y,z:0,rx:rad,rz:rad*.85})}loft(rows,legCol,legMat,wire,showPants?fold*.42:0);
   if(c.seams&&showPants){curve([[g(dir*.46),g(.2),g(-.15)],[g(dir*.43),g(-.55),g(-.18)],[g(dir*.4),g(-1.45),g(-.13)],[g(dir*.36),g(-2.52),g(-.11)]],accent,1.15,{visibility:'front'});ring(g(-2.59),g(dir*.28),0,g(.18),g(.16),accent,1)}
  }
  const torsoEnd=c.cut==='dress'?g(.39):g(.48),torsoTop=g(2.79);
  if(c.cut!=='pants'){
   const sections=[];for(let i=0;i<=43;i++){const t=i/43,y=torsoTop-(torsoTop-torsoEnd)*t;const chestToWaist=t<.56?t/.56:1;const rad= t<.56?rCh*(1-chestToWaist)+rWa*chestToWaist:rWa+(rHip-rWa)*(t-.56)/.44;
    const upper=t<.12?Math.sqrt(Math.max(.64,1-((.12-t)/.38)**2)):1;
    sections.push({x:0,y,z:0,rx:rad*upper,rz:rz*(t<.58?1-t*.12:.93+(t-.58)*.18)});
   }
   loft(sections,cloth,fabric,wire,fold);
   // Shoulder caps and natural sleeve drape, continuous from armhole to cuff.
   let short=m.sleeveType==='short',three=m.sleeveType==='three-quarter',none=m.sleeveType==='sleeveless';
   if(!none)for(const dir of [-1,1]){
    const sleeveLength=short?.49:three?1.22:1.93;const rows=[];
    for(let i=0;i<=32;i++){const t=i/32,shoulderT=Math.min(1,t*5),x=g(dir*(.64*shoulderFactor + .09*Math.sin(t*PI*.6)+.15*t)),y=g(2.75-sleeveLength*t),z=g(-.015-.065*Math.sin(t*PI)),
      rad=g((short?.265:.27)*(1-.37*t)+.029*Math.sin(t*PI*2)*(1-t));
     rows.push({x,y,z,rx:rad,rz:rad*.88})
    }
    loft(rows,cloth,fabric,wire,fold*.7);
    const end=rows.at(-1);ring(end.y,end.x,end.z,end.rx,end.rz,accent,1.8);
    if(!short&&c.hem==='rib')loft([{...rows.at(-5),rx:rows.at(-5).rx*.95,rz:rows.at(-5).rz*.95},{...end,rx:end.rx*.95,rz:end.rz*.95}],lightHem,fabric,wire,0);
    if(c.seams){curve([[g(dir*.55),g(2.71),g(-.36)],[g(dir*.72),g(2.63),g(-.19)],[g(dir*.83),g(2.43),g(-.14)]],accent,2,{visibility:'front'});curve([[g(dir*.72),g(2.5),g(.13)],[g(dir*.84),g(2.05),g(.05)],[end.x,end.y,g(.03)]],accent,1.15,{visibility:'back'});}
   }
   if(c.hem==='rib'&&c.cut!=='dress'){
    loft([{x:0,y:g(.70),z:0,rx:rHip*1.01,rz:rz*1.05},{x:0,y:g(.47),z:0,rx:rHip*.92,rz:rz*.98}],lightHem,fabric,wire,fold*.16);
   }
   if(c.cut==='dress'){
    const end=m.fit==='oversize'?-1.25:-.9;loft([{x:0,y:g(.52),z:0,rx:rWa,rz:rz},{x:0,y:g(.12),z:0,rx:rHip*.99,rz:rz*1.1},{x:0,y:g(end),z:0,rx:rHip*1.32,rz:rz*1.38}],cloth,fabric,wire,fold*1.6);
    if(c.seams)ring(g(end+.025),0,0,rHip*1.32,rz*1.38,accent,1.5);
   }
   // Neck rib and neckline with subtle contour, no hard cylinder head collision.
   ring(g(2.78),0,0,g(.27),g(.18),tone(cloth,.70),3);
   if(c.cut==='hoodie'){
     // Hood shell behind the neck, contour peeking behind shoulders and head.
     loft([{x:0,y:g(2.77),z:g(.28),rx:g(.35),rz:g(.22)},{x:0,y:g(3.12),z:g(.29),rx:g(.44),rz:g(.34)},{x:0,y:g(3.43),z:g(.26),rx:g(.37),rz:g(.30)},{x:0,y:g(3.53),z:g(.25),rx:g(.19),rz:g(.13)}],cloth,fabric,wire,fold*.35);
     if(c.seams&&body!=='child'){curve([[g(-.13),g(2.70),g(-.39)],[g(-.16),g(2.38),g(-.39)]],accent,2,{visibility:'front'});curve([[g(.13),g(2.70),g(-.39)],[g(.16),g(2.38),g(-.39)]],accent,2,{visibility:'front'});
       // Kangaroo pocket lines, visible on front surface only.
       curve([[g(-.39),g(1.46),g(-.40)],[g(-.44),g(1.19),g(-.40)],[g(-.26),g(.91),g(-.44)],[g(.26),g(.91),g(-.44)],[g(.44),g(1.19),g(-.40)],[g(.39),g(1.46),g(-.40)]],accent,1.4,{visibility:'front'});
     }
   }
   if(['shirt','polo','jacket','cardigan','quarterzip','bomber'].includes(c.cut)){
     // collar points and central button placket (z negative = front in this renderer).
     const frontZ=g(-.39);curve([[g(-.30),g(2.81),frontZ],[g(-.18),g(2.54),g(-.48)],[g(0),g(2.62),g(-.52)]],accent,2,{visibility:'front'});
     curve([[g(.30),g(2.81),frontZ],[g(.18),g(2.54),g(-.48)],[0,g(2.62),g(-.52)]],accent,2,{visibility:'front'});
     if(c.seams)curve([[0,g(2.60),g(-.53)],[0,g(.57),g(-.42)]],accent,1.4,{visibility:'front'});
     for(let j=0;j<6;j++)if(c.seams)line([[0,g(2.28-j*.30),g(-.505-j*.016)],[g(.012),g(2.28-j*.30),g(-.505-j*.016)]],tone(accent,.77),3,{visibility:'front'});
     if(['shirt','cardigan'].includes(c.cut)&&c.seams)for(const dir of [-1,1]){
       curve([[g(dir*.21),g(2.28),g(-.45)],[g(dir*.48),g(2.27),g(-.4)],[g(dir*.48),g(1.88),g(-.41)],[g(dir*.21),g(1.88),g(-.45)],[g(dir*.21),g(2.28),g(-.45)]],accent,1.15,{visibility:'front'});
     }
   }
   if(['sweater','mockneck','quarterzip','cardigan','knitvest','sweatshirt','bomber'].includes(c.cut)){
     const neckY=g(2.84);const collarHeight=c.cut==='mockneck'?.24:c.cut==='quarterzip'?.16:.08;
     loft([{x:0,y:neckY,z:0,rx:g(.275),rz:g(.22)},{x:0,y:neckY+g(collarHeight),z:0,rx:g(.265),rz:g(.214)}],tone(cloth,.80),fabric,wire,.003);
     if(c.cut==='quarterzip'&&c.seams){curve([[0,g(2.81),g(-.29)],[0,g(2.35),g(-.43)]],accent,3,{visibility:'front'});ring(g(2.36),0,g(-.44),g(.015),g(.015),accent,1)}
     if(c.cut==='cardigan'&&c.seams){curve([[0,g(2.79),g(-.38)],[0,g(.50),g(-.4)]],accent,2,{visibility:'front'});for(let j=0;j<6;j++)line([[0,g(2.40-j*.28),g(-.46)],[g(.018),g(2.4-j*.28),g(-.46)]],tone(accent,.8),2.4,{visibility:'front'})}
     if(c.cut==='bomber'){ring(g(.51),0,0,rHip*.94,rz*.96,accent,2);}
   }
   if(c.seams){for(const dir of [-1,1])curve([[dir*rCh*.94,g(2.5),g(-.12)],[dir*rWa*.99,g(1.48),g(-.09)],[dir*rHip*.95,g(.62),g(-.08)]],accent,1.1,{visibility:'side'});
      ring(g(.49),0,0,rHip,rz,accent,1.3);
     }
  }
  return {c,m};
 }
 function draw(){const {c,m}=renderGarment();ctx.clearRect(0,0,900,700);const grad=ctx.createRadialGradient(440,310,25,440,330,540);grad.addColorStop(0,'#4d514c');grad.addColorStop(.55,'#232825');grad.addColorStop(1,'#131917');ctx.fillStyle=grad;ctx.fillRect(0,0,900,700);
  ctx.save();ctx.strokeStyle='#d4b98918';ctx.lineWidth=1;for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(450,635,i*37,Math.max(2,i*10),0,0,TAU);ctx.stroke()}ctx.restore();
  faces.sort((a,b)=>b.depth-a.depth);
  // Textiles are drawn on the surface facets, not on top of the silhouette: folds and depth shade the motif.
  const textile=patternTile(c.pattern);const patterned=c.pattern!=='solid';
  for(const f of faces){ctx.beginPath();f.coords.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();
    if(patterned&&f.kind===m.fabric){ctx.save();ctx.globalAlpha=.43;ctx.fillStyle=textile;ctx.fill();ctx.restore()}
    if(f.wire){ctx.strokeStyle='#f6f0df38';ctx.lineWidth=.42;ctx.stroke()}}
  // Subtle contour shading under the stitching; deliberately not presented as calibrated fabric physics.

  if(c.seams){for(const s of strokes){const viewing=Math.cos(angle);if(s.visibility==='front'&&viewing<-.17)continue;if(s.visibility==='back'&&viewing>.17)continue;
   if(s.visibility==='side'&&Math.abs(Math.sin(angle))<.35)continue;ctx.beginPath();s.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=s.col;ctx.lineWidth=s.width;ctx.setLineDash(s.dash);ctx.stroke();ctx.setLineDash([])}}
  // Editable print overlay: deliberately front/back only, projected as a perspective-scaled 2D artwork.
  const isFront=Math.cos(angle)>.32,isBack=Math.cos(angle)<-.32;
  const printSide=c.overlayPosition==='back'?'back':'front';
  if(c.cut!=='pants'&&((printSide==='front'&&isFront)||(printSide==='back'&&isBack))){
    const frontFactor=Math.abs(Math.cos(angle));
    const position=c.overlayPosition==='left'?[.29,2.05]:c.overlayPosition==='low'?[0,1.24]:[0,1.95];
    const faceZ=printSide==='back'?.43:-.43;
    const point=project([position[0],position[1],faceZ]);
    const sx=Math.max(.12,frontFactor)*zoom*(c.overlayPosition==='left'?.48:1);
    ctx.save();ctx.translate(point[0],point[1]);ctx.transform(sx,0,-Math.sin(angle)*.07,1,0,0);
    if(artworkImage){const sz=c.overlayPosition==='left'?58:118;ctx.globalAlpha=.9;ctx.drawImage(artworkImage,-sz/2,-sz/2,sz,sz)}
    else if(c.overlayText){const text=c.overlayText.replace(/[\r\n]/g,' ').slice(0,32);ctx.font=`700 ${c.overlayPosition==='left'?19:30}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=c.overlayColor;ctx.strokeStyle='#29231e66';ctx.lineWidth=2;ctx.strokeText(text,0,0,c.overlayPosition==='left'?110:260);ctx.fillText(text,0,0,c.overlayPosition==='left'?110:260)}
    ctx.restore();
  }
  ctx.fillStyle='#e6cb9c';ctx.font='bold 13px system-ui';ctx.fillText('FitMyStyle · TEXTILE ATELIER 10.0',24,670);
  ctx.font='12px system-ui';ctx.fillStyle='#d3c1a1';ctx.fillText(m.fabricProperties.name+'  ·  '+getPattern(c.pattern).name+'  ·  '+m.fit,24,690);
  if($('atelier-angle'))$('atelier-angle').textContent=(((Math.round(angle*180/PI)%360)+360)%360)+'°';
  const result=$('atelier-measure-result');if(result)result.textContent=`Ciało ${m.body.chest.toFixed(0)} / ${m.body.waist.toFixed(0)} / ${m.body.hip.toFixed(0)} cm  →  ubranie ${m.garment.chest.toFixed(0)} / ${m.garment.waist.toFixed(0)} / ${m.garment.hip.toFixed(0)} cm  • luz w klatce +${m.ease.chest} cm`;
  const caution=$('atelier-garment-warning');if(caution)caution.textContent=m.warnings.join(' ')||'Podgląd poglądowy. Wymiary odzieży i sylwetki wymagają przymiarki i walidacji fizycznego odszywu.';
 }
 function updateBodyPreset(){const d=calculateGarment({body:val('atelier-body','woman')}).body;for(const k of ['height','chest','waist','hip'])if($('atelier-'+k))$('atelier-'+k).value=d[k];draw()}
 for(const id of ['cut','body','view-mode','skin','overlay-text','overlay-color','overlay-position','color','stitch','fit','fabric','sleeve','hem','seam-type','seams','wire','silhouette','bottom','bottom-color','pattern','height','chest','waist','hip'])$('atelier-'+id)?.addEventListener('input',id==='body'?updateBodyPreset:draw);
 $('atelier-zoom')?.addEventListener('input',e=>{zoom=Number(e.target.value)/100;draw()});
 canvas.addEventListener('pointerdown',e=>{pointer=e.clientX;canvas.setPointerCapture(e.pointerId);auto=false;updateRotateState()});canvas.addEventListener('pointermove',e=>{if(pointer===null)return;angle+=(e.clientX-pointer)*.012;pointer=e.clientX;draw()});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('wheel',e=>{if(!$('#mannequin')?.classList.contains('active-page'))return;e.preventDefault();zoom=clamp(zoom-e.deltaY*.001,.7,1.45);$('atelier-zoom').value=Math.round(zoom*100);draw()},{passive:false});
 function updateRotateState(){const b=$('atelier-rotate');if(b){b.textContent=auto?'Ⅱ Zatrzymaj obrót':'▶ Autoobrót';b.setAttribute('aria-pressed',String(auto));b.classList.toggle('is-spinning',auto)}}
 $('atelier-rotate')?.addEventListener('click',()=>{auto=!auto;updateRotateState();lastFrame=0;if(auto)draw()});

 $('atelier-front')?.addEventListener('click',()=>{auto=false;updateRotateState();angle=0;draw()});$('atelier-back')?.addEventListener('click',()=>{auto=false;updateRotateState();angle=PI;draw()});
 $('atelier-left')?.addEventListener('click',()=>{auto=false;updateRotateState();angle=-PI/2;draw()});$('atelier-right')?.addEventListener('click',()=>{auto=false;updateRotateState();angle=PI/2;draw()});
 $('atelier-snapshot')?.addEventListener('click',()=>{canvas.toBlob(blob=>{if(!blob)return;saveBlob(blob,'fitmystyle-9-preview.png')},'image/png')});
 function saveBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
 const comparisons={A:null,B:null};const savedKey='fitmystyle-atelier-comparisons-v9';
 try{const saved=JSON.parse(sessionStorage.getItem(savedKey)||'null');if(saved&&typeof saved==='object'){comparisons.A=saved.A||null;comparisons.B=saved.B||null}}catch{}
 function compareVariants(){const {A,B}=comparisons,el=$('atelier-ab-output');if(!el)return;
  if(!A||!B){el.textContent='Zapisano '+(A?'A':'')+(B?' B':'')+'. Zapisz oba warianty, aby porównać konstrukcję.';return}
  const a=calculateGarment(A),b=calculateGarment(B);el.textContent=`A: ${a.type}, ${a.fit}, ${a.fabricProperties.name}, klatka ubrania ${a.garment.chest} cm.  B: ${b.type}, ${b.fit}, ${b.fabricProperties.name}, klatka ${b.garment.chest} cm. Różnica: ${(b.garment.chest-a.garment.chest).toFixed(1)} cm. Podgląd techniczny, nie przymiarka.`
 }
 for(const key of ['A','B'])$('atelier-save-'+key.toLowerCase())?.addEventListener('click',()=>{comparisons[key]=config();try{sessionStorage.setItem(savedKey,JSON.stringify(comparisons))}catch{}compareVariants()});compareVariants();
 $('atelier-spec')?.addEventListener('click',()=>{saveBlob(new Blob([JSON.stringify(getTechnicalPack(config()),null,2)],{type:'application/json'}),'fitmystyle-9-tech-pack.json')});
 $('atelier-sheet')?.addEventListener('click',()=>{const current=angle;angle=0;draw();const front=canvas.toDataURL('image/png');angle=PI;draw();const back=canvas.toDataURL('image/png');angle=current;draw();const m=getTechnicalPack(config());const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));const rows=Object.entries({...m.body,...Object.fromEntries(Object.entries(m.garment).map(([k,v])=>['odzież_'+k,v]))}).map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)} cm</td></tr>`).join('');const w=window.open('','_blank','width=950,height=900');if(!w){alert('Zezwól na wyskakujące okna, aby wydrukować kartę.');return}w.opener=null;w.document.write(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>FitMyStyle – karta techniczna</title><style>body{font:14px Arial;margin:26px;color:#202522}h1{font-size:23px}.views{display:flex;gap:12px}.views img{width:48%;object-fit:contain}table{border-collapse:collapse;width:100%}th,td{padding:5px;border:1px solid #ccc;text-align:left}small{color:#634}@media print{button{display:none}}</style></head><body><h1>FitMyStyle · karta techniczna / CONCEPT</h1><p><strong>Fason:</strong> ${esc(m.type)} · ${esc(m.fit)} · ${esc(m.fabricProperties.name)}</p><div class="views"><img src="${front}" alt="Przód"><img src="${back}" alt="Tył"></div><h2>Wymiary i konstrukcja</h2><table>${rows}</table><p>Luz klatki: +${m.ease.chest} cm. Zapas na szew: ${m.seamAllowanceCm} cm — osobno od luzu.</p><small>Wizualizacja poglądowa; nie jest dopuszczeniem do produkcji. Przed krojeniem wykonaj profesjonalny wykrój CAD i prototyp.</small><p><button onclick="window.print()">Drukuj / Zapisz PDF</button></p></body></html>`);w.document.close()});
 $('atelier-patterns')?.addEventListener('click',()=>{window.FitMyStyleBridge?.navigate('patterns');document.dispatchEvent(new CustomEvent('fms:navigation',{detail:{page:'patterns'}}))});
 window.addEventListener('fms:preview',event=>{const {member,product}=event.detail||{};if(!product)return;const name=String(product.name||'').toLowerCase();const cut=/sweter|sweater|knit/.test(name)?'sweater':/dress|sukien/.test(name)?'dress':/hood|bluz/.test(name)?'hoodie':/koszul|shirt/.test(name)?'shirt':/polo/.test(name)?'polo':/jacket|kurtk/.test(name)?'jacket':/trouser|pants|spodn/.test(name)?'pants':'tshirt';$('atelier-cut').value=cut;$('atelier-body').value=member?.role==='child'?'child':member?.role==='man'?'man':'woman';if(/^#[0-9a-f]{6}$/i.test(product.colorHex||''))$('atelier-color').value=product.colorHex;$('atelier-bottom').checked=cut!=='pants';const old=$('atelier-note-product');old?.remove();const note=document.createElement('p');note.id='atelier-note-product';note.className='atelier-note';note.textContent='Wybrano: '+String(product.name||'projekt')+'. Dopasowany jest typ fasonu i kolor — to nie jest zeskanowany produkt sklepu.';document.querySelector('.atelier-form')?.prepend(note);updateBodyPreset()});
 function animate(now){
   // Run independently of route-class transitions, with frame pacing for slower laptops.
   if(auto&&!document.hidden&&canvas.isConnected&&now-lastFrame>=38){const step=lastFrame?Math.min((now-lastFrame)/1000,.1):.038;angle=(angle+step*.5)%TAU;lastFrame=now;draw()}
   frame=requestAnimationFrame(animate)
 }
 $('atelier-pattern')?.addEventListener('change',()=>{const t=getPattern(val('atelier-pattern'));$('atelier-pattern-info').textContent=t.name+' · '+t.description;document.querySelectorAll('#atelier-textile-swatches button').forEach(b=>b.classList.toggle('selected',b.getAttribute('data-motif')===t.id));draw()});
 applyTemplate(FMS_PRESETS[0]);draw();updateRotateState();frame=requestAnimationFrame(animate);window.addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
}