import {MODEL_MAP} from './measurements.mjs';
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeColor = s=>/^#[0-9a-f]{6}$/i.test(String(s))?s:'#91A18B';
export function garmentSvg(p,{width=270,height=300,back=false}={}){
  const model=MODEL_MAP[p.model]||MODEL_MAP.crewneck;
  const isBottom=model.type==='bottom',baby=model.type==='baby';
  const color=safeColor(p.color),id=esc(p.id),isShirt=/shirt|polo/.test(model.id),isHood=/hoodie/.test(model.id),isSweater=/sweater|halfzip|turtleneck|cardigan/.test(model.id);
  const sleeveShort=/tee|polo|baby-body/.test(model.id);
  const over=/oversize/.test(model.id);
  const bodyW=over?144:128,topX=(250-bodyW)/2; const text=(!back)?esc(p.artwork?.text||''):'';
  let shape;
  if(isBottom){shape=`<path d="M74 58 Q125 48 176 58 L189 260 Q159 270 147 260 L124 155 L101 260 Q78 268 61 257 Z" fill="url(#cloth-${id})" stroke="url(#edge-${id})" stroke-width="2.5" stroke-linejoin="round"/><path d="M74 73 Q125 80 176 73 M124 75 L124 156 M91 86 L92 152 M159 86 L158 150" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2"/><path d="M76 56 Q125 50 174 56" stroke="#fff" stroke-opacity=".3" stroke-width="8" fill="none"/>`}
  else{
    const left=topX,right=250-topX;
    const sleeveL=sleeveShort?124:225;
    const w=over?20:14;
    shape=`<path d="M${left+25} 53 Q${left+12} 57 ${left-4} 75 L${left-35} ${sleeveL} Q${left-12} ${sleeveL+9} ${left+5} ${sleeveL} L${left+17} 121 L${left+14} 260 Q125 270 ${right-14} 260 L${right-17} 121 L${right-5} ${sleeveL} Q${right+12} ${sleeveL+9} ${right+35} ${sleeveL} L${right+4} 75 Q${right-10} 57 ${right-25} 53 Q125 77 ${left+25} 53 Z" fill="url(#cloth-${id})" stroke="url(#edge-${id})" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M${left+17} 121 Q${left+17} 143 ${left+14} 165 M${right-17} 121 Q${right-17} 143 ${right-14} 165" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="6"/>
    <path d="M${left+21} 54 Q${left+31} 67 ${left+37} 88 M${right-21} 54 Q${right-31} 67 ${right-37} 88" fill="none" stroke="#161616" stroke-opacity=".12" stroke-width="2"/>
    <path d="M${left+14} 256 Q125 263 ${right-14} 256" fill="none" stroke="#000" stroke-opacity=".17" stroke-width="3"/>
    <path d="M${left-31} ${sleeveL-7} Q${left-10} ${sleeveL-2} ${left+4} ${sleeveL-7} M${right-4} ${sleeveL-7} Q${right+10} ${sleeveL-2} ${right+31} ${sleeveL-7}" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>`;
    if(isHood){shape+=`<path d="M80 70 Q70 26 100 14 Q125 -1 150 14 Q180 30 170 70 Q146 83 125 80 Q104 83 80 70" fill="url(#cloth-${id})" stroke="#000" stroke-opacity=".21" stroke-width="2"/><path d="M105 36 Q125 19 145 36" fill="none" stroke="#fff" stroke-opacity=".33" stroke-width="5"/>`}
    else if(isShirt){shape+=`<path d="M95 49 L125 91 L155 49 L142 42 L125 72 L109 42 Z" fill="#fff" fill-opacity=".17" stroke="#000" stroke-opacity=".27" stroke-width="2"/>${!back?'<path d="M125 86 L125 254" stroke="#000" stroke-opacity=".28" stroke-width="3"/>':''}`;if(!back)for(let y=104;y<240;y+=22)shape+=`<circle cx="125" cy="${y}" r="2.5" fill="#e9e9e6" stroke="#4a4a4a" stroke-width=".6"/>`}
    else if(model.id==='turtleneck'){shape+=`<path d="M102 52 L102 24 Q125 18 148 24 L148 52 Q125 63 102 52" fill="url(#cloth-${id})" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`}
    else shape+=`<path d="M102 53 Q125 81 148 53" fill="none" stroke="#141414" stroke-opacity=".35" stroke-width="3"/><path d="M108 53 Q125 74 142 53" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="5"/>`;
    if(isSweater)shape+=`<g opacity=".12" stroke="#16120c" stroke-width=".9">${Array.from({length:24},(_,i)=>`<path d="M${left+26+i*3.9} 95 Q${left+27+i*3.9} 165 ${left+26+i*3.9} 248"/>`).join('')}</g>`;
    if(/crew|sweater|halfzip/.test(model.id))shape+=`<path d="M${left+13} 246 Q125 253 ${right-13} 246" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="11"/>`;
  }
  const artwork=(!back && !isBottom&&text)?`<g clip-path="url(#print-${id})"><text x="125" y="154" fill="${safeColor(p.artwork?.color||'#F5F3EC')}" font-size="${Math.max(9,Math.min(26,15*(Number(p.artwork?.scale)||1)))}" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle">${text.slice(0,18)}</text></g>`:'';
  const shapeClip=!isBottom?`<clipPath id="print-${id}"><rect x="69" y="108" width="112" height="80" rx="2"/></clipPath>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 300" width="${width}" height="${height}" role="img" aria-label="Ilustracyjny szablon ${esc(model.name)} — ${back?'tył':'przód'}"><defs><linearGradient id="cloth-${id}" x1="0" x2="1" y1="0" y2=".5"><stop stop-color="${color}" offset="0"/><stop stop-color="${color}" stop-opacity=".86" offset=".45"/><stop stop-color="${color}" offset="1"/></linearGradient><linearGradient id="edge-${id}" x1="0" x2="1"><stop stop-color="#3e3936" stop-opacity=".5"/><stop stop-color="#fff" stop-opacity=".14"/></linearGradient>${shapeClip}</defs><ellipse cx="125" cy="281" rx="78" ry="10" fill="#0f1613" fill-opacity=".13"/>${shape}${artwork}<g opacity=".15"><path d="M97 100 Q90 145 96 180 M155 100 Q163 147 154 194" fill="none" stroke="#fff" stroke-width="2"/></g></svg>`
}
export function textileSwatch(color,pattern='plain'){
 const c=safeColor(color); if(pattern==='stripe')return `repeating-linear-gradient(90deg, ${c} 0 16px, #f6f0e6 16px 18px, ${c} 18px 22px)`;
 if(pattern==='check')return `repeating-linear-gradient(0deg, transparent 0 17px,#ffffff55 17px 19px),repeating-linear-gradient(90deg,${c} 0 17px,#ffffff88 17px 19px)`;
 return c;
}