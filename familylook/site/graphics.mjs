import {htmlEsc} from './core.mjs';
const rgb=(hex)=>{const h=hex.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const shade=(hex,f)=>'#'+rgb(hex).map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('');
export function garmentSVG(template,options={}){
 const c=/^#[a-f0-9]{6}$/i.test(options.color||'')?options.color:'#8f9d88';
 const skin=/^#[a-f0-9]{6}$/i.test(options.skin||'')?options.skin:'#d8ae8b';
 const type=template.category;const back=options.view==='back',person=options.type||'adultF',baby=person==='baby',child=person==='child';
 const p=options.pattern||'solid';const label=String(options.printText||'').slice(0,35).replace(/[\r\n]/g,' ');const art=options.artwork;
 const personScale=baby?.76:child?.84:1;
 const wide=template.cut==='oversize'?12:template.cut==='relaxed'?7:0;
 const id='f'+Math.random().toString(36).slice(2,8);
 const textile=`<pattern id="${id}-grain" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 4L3 1" stroke="#fff" stroke-opacity=".055" stroke-width=".7"/></pattern>
 <pattern id="${id}-rib" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M2 0V10M6 0V10" stroke="${shade(c,.52)}" stroke-opacity=".24" stroke-width="1.3"/></pattern>
 <pattern id="${id}-cable" width="20" height="34" patternUnits="userSpaceOnUse"><path d="M6 -3C22 4 -6 13 9 21S22 31 7 37" fill="none" stroke="${shade(c,.63)}" stroke-opacity=".26" stroke-width="3.1"/></pattern>
 <pattern id="${id}-stripes" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M3 0V15" stroke="${shade(c,.52)}" stroke-opacity=".3" stroke-width="1.3"/></pattern>
 <pattern id="${id}-check" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 1H32M1 0V32" stroke="${shade(c,.48)}" stroke-opacity=".27" stroke-width="1.6"/></pattern>
 <pattern id="${id}-herringbone" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 1l9 8 9-8M0 10l9 8 9-8" fill="none" stroke="${shade(c,.48)}" stroke-opacity=".2" stroke-width="1.7"/></pattern>
 <pattern id="${id}-argyle" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M22 0L44 22 22 44 0 22Z" fill="${shade(c,.75)}" fill-opacity=".14" stroke="${shade(c,.55)}" stroke-opacity=".26" stroke-width="1.1"/></pattern>
 <pattern id="${id}-botanical" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M21 42Q20 16 25 3M22 25Q3 9 8 12Q19 11 22 25M23 21Q40 6 37 19Q31 29 23 21" fill="none" stroke="${shade(c,.55)}" stroke-opacity=".34" stroke-width="1.4"/></pattern>
 <pattern id="${id}-wave" width="42" height="15" patternUnits="userSpaceOnUse"><path d="M0 8Q10 0 21 8T42 8" fill="none" stroke="${shade(c,.5)}" stroke-opacity=".28" stroke-width="2"/></pattern>
 <pattern id="${id}-dot" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.4" fill="${shade(c,.48)}" fill-opacity=".37"/></pattern>`;
 const patternName=({solid:null,rib:'rib',cable:'cable',pinstripe:'stripes',check:'check',herringbone:'herringbone',argyle:'argyle',botanical:'botanical',wave:'wave',dot:'dot'})[p]||null;
 const fillPattern=patternName?`url(#${id}-${patternName})`:`url(#${id}-grain)`;
 const defs=`<defs>
 <linearGradient id="${id}-cloth" x1="0" y1="0" x2="1" y2=".27"><stop offset="0" stop-color="${shade(c,.74)}"/><stop offset=".17" stop-color="${shade(c,1.06)}"/><stop offset=".54" stop-color="${c}"/><stop offset=".85" stop-color="${shade(c,.94)}"/><stop offset="1" stop-color="${shade(c,.67)}"/></linearGradient>
 <linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${shade(skin,.75)}"/><stop offset=".5" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin,.82)}"/></linearGradient>
 <linearGradient id="${id}-pants" x1="0" y1="0" x2=".8" y2=".15"><stop stop-color="#aea697"/><stop offset=".5" stop-color="#d0c9bd"/><stop offset="1" stop-color="#a59e93"/></linearGradient>
 <filter id="${id}-drop" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
 <clipPath id="${id}-garmentclip"><path d="${getBodyPath(type,wide)}"/></clipPath>
 ${textile}</defs>`;
 const isBottom=type==='jogger',isBaby=type==='bodysuit';
 const body=`<g opacity=".95">
 <ellipse cx="150" cy="388" rx="65" ry="9" fill="#151615" opacity=".10" filter="url(#${id}-drop"/>
 <path d="M125 45Q124 18 150 19Q176 18 175 45L178 71Q174 90 150 90Q126 90 121 71Z" fill="url(#${id}-skin)"/>
 <path d="M139 79L137 112Q152 125 165 112L162 79" fill="url(#${id}-skin)"/>
 <path d="M102 111Q76 113 72 167L57 239Q56 259 69 258Q80 260 84 242L119 159M198 111Q224 113 228 167L243 239Q244 259 231 258Q220 260 216 242L181 159" fill="url(#${id}-skin)"/>
 <path d="M124 271L113 370Q117 386 128 384L152 295 171 384Q184 385 187 371L176 271Z" fill="url(#${id}-pants)"/>
 </g>`;
 let top='';
 if(isBottom){top=`<path d="M106 164L194 164Q199 199 188 248L200 352Q188 362 175 357L154 253 147 253 123 357Q110 361 98 353L113 246Q101 194 106 164Z" fill="url(#${id}-cloth)" stroke="${shade(c,.66)}" stroke-width="1.5"/><path d="M106 175L194 175M151 176L151 254M109 344L123 347M177 346L196 342" fill="none" stroke="${shade(c,.6)}" stroke-opacity=".5" stroke-width="2"/>`}
 else{
  const path=getBodyPath(type,wide);const clip=`clip-path="url(#${id}-garmentclip)"`;
  top=`<g><path d="${path}" fill="url(#${id}-cloth)" stroke="${shade(c,.69)}" stroke-width="1.8"/>
   <rect x="45" y="94" width="210" height="280" fill="${fillPattern}" ${clip}/>
   <path d="M112 116Q122 135 124 184L119 275M187 116Q177 139 176 184L181 275" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="12" ${clip}/>
   <path d="M97 113Q107 140 101 184M203 113Q194 140 201 184" fill="none" stroke="${shade(c,.59)}" stroke-opacity=".37" stroke-width="1.4"/>
   <path d="M117 124Q125 144 125 193M182 124Q177 143 176 194" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="3"/>
   ${getDetails(type,c,back)}
   </g>`;
 }
 const artX=isBottom?170:template.printArea==='chest-small'?174:150;const artY=isBottom?248:template.printArea==='chest-small'?158:195;
 let print='';if(!back&&options.printEnabled!==false&&type!=='jogger'){
  if(art?.dataURL?.startsWith('data:image/')&&/^data:image\/(png|jpeg|webp);base64,/.test(art.dataURL)){
    print=`<image href="${art.dataURL}" x="${artX-27}" y="${artY-27}" width="54" height="54" preserveAspectRatio="xMidYMid meet"/>`;
  } else if(label){print=`<g transform="translate(${artX},${artY})"><text text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="${label.length>16?9:12}" font-weight="700" letter-spacing=".9" fill="${options.printColor||'#302b27'}">${htmlEsc(label)}</text></g>`;}
 }
 const yShift=baby?30:child?18:0;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 430" role="img" aria-label="Wizualizacja koncepcyjna ${htmlEsc(template.name)}">
 ${defs}<g transform="translate(150 210) scale(${personScale}) translate(-150 -210) translate(0 ${yShift})">
 ${body}${top}${print}
 </g></svg>`;
}
function getBodyPath(type,wide){
 const L=100-wide/2,R=200+wide/2,T=112,B=320;
 const short=type==='tshirt'||type==='polo'||type==='bodysuit';
 const sleeveL=short?165:270;
 const bodyWidth=type==='knitwear'?5:0;
 const dress=type==='dress';
 if(type==='bodysuit')return 'M120 105Q134 113 150 112Q165 113 179 105L215 131L202 177L185 170L185 299L168 322L150 309L132 322L115 299L115 170L98 177L85 131Z';
 return `M${L+18} ${T-4}Q132 118 150 118Q168 118 ${R-18} ${T-4}Q${R+9} 119 ${R+36} 132L${R+31} ${sleeveL}Q${R+13} ${sleeveL+7} ${R+1} ${sleeveL}L${R-3} 173L${R+bodyWidth+11} ${dress?365:B}Q150 ${dress?381:B+5} ${L-bodyWidth-11} ${dress?365:B}L${L+3} 173L${L-1} ${sleeveL}Q${L-13} ${sleeveL+7} ${L-31} ${sleeveL}L${L-36} 132Q${L-9} 119 ${L+18} ${T-4}Z`;
}
function getDetails(type,c,back){
 const s=shade(c,.61),light=shade(c,1.15),shadeLine=`stroke="${s}" stroke-opacity=".58" fill="none"`;
 let x=`<path d="M119 311Q150 321 181 311" ${shadeLine} stroke-width="3"/><path d="M72 259L98 258M202 258L228 259" ${shadeLine} stroke-width="3"/>`;
 if(['sweatshirt','hoodie','knitwear'].includes(type))x+=`<path d="M116 300Q150 308 184 300L183 317Q150 324 116 317Z" fill="${s}" opacity=".23"/><path d="M117 301L184 301" stroke="${light}" stroke-opacity=".25" stroke-width="1.5"/>`;
 if(type==='hoodie'&&!back)x+=`<path d="M119 107Q106 91 114 76Q127 54 150 56Q173 54 186 76Q194 92 181 107L163 116Q150 125 137 116Z" fill="${shade(c,.85)}" stroke="${s}" stroke-width="2" transform="translate(0 2)"/><path d="M122 101Q130 89 150 89Q171 89 179 101" fill="none" stroke="${light}" stroke-width="2"/><path d="M118 231L129 220H171L182 231L177 266H123Z" fill="${s}" fill-opacity=".12" stroke="${s}" stroke-opacity=".32" stroke-width="1.4"/>`;
 if(type==='knitwear')x+=`<path d="M133 117Q150 138 167 117" fill="none" stroke="${s}" stroke-width="9" stroke-opacity=".35"/>`;
 if(['shirt','polo'].includes(type)&&!back)x+=`<path d="M116 111L143 127L150 142L134 153L115 115M184 111L157 127L150 142L166 153L185 115" fill="${light}" fill-opacity=".31" stroke="${s}" stroke-opacity=".45" stroke-width="1.5"/><path d="M150 142L150 313" ${shadeLine} stroke-width="2"/>${[169,200,231,262,294].map(y=>`<circle cx="150" cy="${y}" r="1.9" fill="${s}"/>`).join('')}`;
 if(type==='dress')x+=`<path d="M121 253Q150 268 179 253" fill="none" stroke="${s}" stroke-opacity=".28" stroke-width="1.5"/>`;
 if(back)x+=`<path d="M118 120Q150 130 182 120" fill="none" stroke="${s}" stroke-opacity=".28" stroke-width="1.2"/>`;
 return x;
}
export function printArtworkSVG({widthMm,heightMm,text,color='#222222',rasterDataURL=null,position='center'}){
 const width=Math.max(40,Math.min(400,Number(widthMm)||180)),height=Math.max(40,Math.min(450,Number(heightMm)||200));
 const clean=String(text||'').slice(0,35);let body='';
 if(rasterDataURL&&/^data:image\/(png|jpeg|webp);base64,/.test(rasterDataURL))body=`<image href="${rasterDataURL}" x="10" y="10" width="${width-20}" height="${height-20}" preserveAspectRatio="xMidYMid meet"/>`;
 else body=`<text x="${width/2}" y="${height/2}" text-anchor="middle" dominant-baseline="middle" fill="${/^#[a-f0-9]{6}$/i.test(color)?color:'#222222'}" font-size="${Math.min(28,Math.max(9,width/Math.max(9,clean.length)*1.5))}" font-family="Arial,sans-serif" font-weight="700">${htmlEsc(clean)}</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}