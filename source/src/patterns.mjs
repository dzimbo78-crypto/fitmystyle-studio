/** FitMyStyle Pattern Studio — original, offline parametric *drafts* (millimetres).
 * These are educational prototyping blocks, NOT production-certified patterns.
 * Every fit, seam, notch and grain must be checked with a toile and technician.
 */
export const MEASUREMENT_FIELDS = [
  ['height','Wzrost',60,215],['bust','Klatka / biust',40,155],['waist','Talia',38,150],
  ['hip','Biodra',42,170],['shoulder','Szerokość ramion',20,60],['neck','Obwód szyi',20,55],
  ['bicep','Biceps',12,55],['wrist','Nadgarstek',9,32],['arm','Długość ręki',16,80],
  ['inseam','Długość nogi wewn.',18,100],['back','Długość pleców',17,63],['head','Obwód głowy',35,68]
];
export const DEFAULT_MEASUREMENTS={height:172,bust:96,waist:80,hip:100,shoulder:43,neck:38,bicep:31,wrist:17,arm:59,inseam:78,back:43,head:56};
export const BASE_PATTERNS={
 top:{label:'Koszulki i bluzki',en:'Tops',icon:'◒',description:'Przód + tył, opcjonalne rękawy',material:'Dzianina / tkanina zależnie od fasonu'},
 shirt:{label:'Koszule',en:'Shirts',icon:'▤',description:'Przód + tył, rękaw, kołnierz i listwa (szkic)',material:'Tkanina koszulowa'},
 hoodie:{label:'Bluzy i hoodies',en:'Sweatshirts',icon:'⌂',description:'Przód + tył, rękaw, kaptur, kieszeń (szkic)',material:'Dzianina dresowa'},
 dress:{label:'Sukienki / tuniki',en:'Dresses',icon:'♧',description:'Przód + tył, wariant rękawów',material:'Dzianina / tkanina'},
 skirt:{label:'Spódnice',en:'Skirts',icon:'◠',description:'Panel przodu, panel tyłu, pasek',material:'Tkanina lub dzianina'},
 pants:{label:'Spodnie / szorty',en:'Pants',icon:'♜',description:'Nogawka przód i tył, pas',material:'Tkanina / dzianina'},
 vest:{label:'Kamizelki',en:'Vests',icon:'⏣',description:'Przód i tył bez rękawów',material:'Tkanina'},
 apron:{label:'Fartuchy',en:'Aprons',icon:'◇',description:'Korpus, pasek na szyję, troki, kieszeń',material:'Tkanina bawełniana'}
};
const PRESET_GROUPS={
 top:[['T-shirt klasyczny','classic'],['T-shirt oversize','relaxed'],['Top bez rękawów','sleeveless'],['Koszulka cropped','cropped'],['Bluzka z krótkim rękawem','short'],['Longsleeve','long'],['Tunika basic','tunic'],['Top sportowy','sport']],
 shirt:[['Koszula klasyczna','classic'],['Koszula z krótkim rękawem','short'],['Koszula oversize','relaxed'],['Koszula lniana','linen'],['Koszula dziecięca','mini'],['Koszula z długim rękawem','long']],
 hoodie:[['Bluza klasyczna','classic'],['Hoodie z kapturem','hood'],['Bluza oversize','relaxed'],['Bluza cropped','cropped'],['Bluza bez kaptura','crew'],['Bluza dziecięca','mini']],
 dress:[['Sukienka prosta','classic'],['Sukienka z rękawem','long'],['Sukienka letnia','sleeveless'],['Sukienka midi','midi'],['Sukienka mini','mini'],['Tunika długa','tunic']],
 skirt:[['Spódnica prosta','classic'],['Spódnica midi','midi'],['Spódnica mini','mini'],['Spódnica A-line','aline'],['Spódnica maxi','maxi']],
 pants:[['Spodnie proste','classic'],['Spodnie szerokie','relaxed'],['Szorty','short'],['Spodnie joggery','sport'],['Spodnie dziecięce','mini']],
 vest:[['Kamizelka prosta','classic'],['Kamizelka elegancka','tailored'],['Kamizelka oversize','relaxed'],['Kamizelka dziecięca','mini']],
 apron:[['Fartuch kuchenny','classic'],['Fartuch dziecięcy','mini'],['Fartuch z kieszenią','pocket'],['Fartuch roboczy','work']]
};
export const DESIGN_LIBRARY=Object.entries(PRESET_GROUPS).flatMap(([base,items])=>items.map(([name,variant])=>({id:`${base}-${variant}`,base,variant,name,category:BASE_PATTERNS[base].label,description:BASE_PATTERNS[base].description}))); // 44 editable presets built on 8 base drafts
const cm=x=>x*10;
const round=(x)=>Math.round(x*10)/10;
const point=(x,y)=>[round(x),round(y)];
const linear=(a,b,n)=>Array.from({length:n+1},(_,i)=>point(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n));
const bezier=(a,b,c,d,n=10)=>Array.from({length:n+1},(_,i)=>{const t=i/n,u=1-t;return point(u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]);});
const arc=(rx,ry,ox,oy,n=9)=>Array.from({length:n+1},(_,i)=>{const t=Math.PI*i/2/n;return point(ox+rx*Math.sin(t),oy+ry*Math.cos(t))});
const area=pts=>pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+(p[0]*q[1]-q[0]*p[1]);},0)/2;
function crossing(a,d,b,e){const det=d[0]*e[1]-d[1]*e[0];if(Math.abs(det)<1e-8)return null;const t=((b[0]-a[0])*e[1]-(b[1]-a[1])*e[0])/det;return point(a[0]+t*d[0],a[1]+t*d[1]);}
export function offsetPolygon(pts,offset){if(!offset)return pts.map(p=>[...p]);let cw=area(pts)>0?1:-1;const shifted=[];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1;const nx=cw*dy/l,ny=-cw*dx/l;shifted.push([point(p[0]+offset*nx,p[1]+offset*ny),[dx,dy]]);}return pts.map((p,i)=>{const prev=shifted[(i+pts.length-1)%pts.length],curr=shifted[i],x=crossing(prev[0],prev[1],curr[0],curr[1]);if(x&&Math.hypot(x[0]-p[0],x[1]-p[1])<offset*3)return x;return point((prev[0][0]+curr[0][0])/2,(prev[0][1]+curr[0][1])/2)});}
export function validateMeasurements(raw){const m={};for(const [key,label,min,max] of MEASUREMENT_FIELDS){const val=Number(raw[key]);if(!Number.isFinite(val)||val<min||val>max)throw Error(`${label}: dozwolony zakres ${min}–${max} cm`);m[key]=val;}if(m.waist>m.hip*1.2)throw Error('Sprawdź obwód talii oraz bioder');return m;}
const polygon=(name,points,qty=1,notes='',fold=false,details=[])=>({name,points:points.map(p=>point(...p)),qty,notes,fold,details});
function bodyBlock(m,opt,{type='top',front=true,withoutSleeves=false}={}){
 const length=cm(type==='dress'?opt.length:(type==='vest'?opt.length:opt.length));
 const qBust=cm((m.bust+opt.ease)/4),qWaist=cm((m.waist+opt.ease*.7)/4),qHip=cm((m.hip+opt.ease*.8)/4);
 const armhole=cm(m.bust/6+7.5+opt.ease*.06),neckWidth=cm(m.neck/6+0.5),neckDepth=cm(front?8.5:2.7);
 const shoulder=cm(m.shoulder/2); const shoulderY=cm(2.1), armUpper=cm(5.5);
 const hemWidth=type==='dress'?Math.max(qHip+cm(opt.flare),qBust+cm(2)):type==='vest'?qHip:Math.max(qBust,qHip);
 const waistY=Math.min(cm(m.back),length*.58);
 const top=arc(neckWidth,neckDepth,0,0);const line=[point(shoulder,shoulderY)];
 const arm=bezier(point(shoulder,shoulderY),point(shoulder+cm(1.4),armUpper),point(qBust-cm(3),armhole-cm(2.5)),point(qBust,armhole),12).slice(1);
 const p=[...top,...line,...arm,point(qWaist,waistY),point(hemWidth,length),point(0,length)];
 const details=[{type:'line',points:[point(0,neckDepth+cm(3)),point(0,length-cm(3))],label:'ZŁOŻENIE / FOLD'}];
 return polygon(front?'Przód — 1 × na złożeniu':'Tył — 1 × na złożeniu',p,1,`Pół wykrój; cięcie na złożeniu. ${withoutSleeves?'Wykończenie pach wymaga osobnego opracowania.':''}`,true,details);
}
function sleeveBlock(m,opt){
 const len=cm(Math.min(opt.sleeveLength,m.arm+5));if(len<90)return null;
 const halfBicep=cm((m.bicep+Math.max(6,opt.ease*.5))/2),halfWrist=cm((m.wrist+Math.max(9,opt.ease*.45))/2),cap=cm(Math.min(16,m.bust/8+2));
 const hemHalf=len<cm(32)?halfBicep*.83:halfWrist;
 const left=bezier(point(halfBicep,0),point(halfBicep*.4,cap*.12),point(0,cap*.55),point(0,cap),12);
 const right=bezier(point(halfBicep*2,cap),point(halfBicep*2,cap*.55),point(halfBicep*1.6,cap*.12),point(halfBicep,0),12);
 return polygon('Rękaw — 2 × lustrzane',[...left,point(halfBicep-hemHalf,cap+len),point(halfBicep+hemHalf,cap+len),...right],2,'Dopasuj główkę rękawa do pachy po uszyciu próbki.',false,[{type:'line',points:[point(halfBicep,cm(3)),point(halfBicep,cap+len-cm(3))],label:'OSNOWA'}]);
}
function skirtBlock(m,opt){const waist=cm((m.waist+opt.ease*.45)/4),hip=cm((m.hip+opt.ease*.7)/4),len=cm(opt.length),hem=hip+cm(opt.flare);const waistY=0,hipY=cm(Math.min(23,opt.length*.4));return [polygon('Spód przód — 1 × na złożeniu',[point(0,0),point(waist,waistY),point(hip,hipY),point(hem,len),point(0,len)],1,'Uproszczony blok bez zaszewek; do sprawdzenia.',true),polygon('Spód tył — 1 × na złożeniu',[point(0,0),point(waist+cm(1),0),point(hip,hipY),point(hem,len),point(0,len)],1,'Korekta talii i zaszewki zależne od sylwetki.',true),polygon('Pasek — 1 ×',[point(0,0),point(cm(m.waist+opt.ease*.5+3),0),point(cm(m.waist+opt.ease*.5+3),cm(6)),point(0,cm(6))],1,'Długość paska do korekty przy zapięciu.')];}
function pantsBlock(m,opt){const wide=cm((m.hip+opt.ease)/4),waist=cm((m.waist+opt.ease*.65)/4),rise=cm(m.hip/4+6),length=cm(opt.length),total=rise+length,ankle=opt.variant==='short'?wide*.88:opt.variant==='relaxed'?wide*.9:wide*.66;let p=[point(cm(2),0),point(waist,0),point(wide,rise*.5),point(wide+cm(4),rise),point(wide*.6, rise+cm(5)),point(wide*.55+ankle*.5,total),point(wide*.55-ankle*.5,total),point(wide*.4,rise+cm(5)),point(0,rise)];let back=p.map(([x,y])=>point(x*1.06,y));return [polygon('Nogawka przód — 2 ×',p,2,'Schemat bryły nogawki; linie kroku i biodra wymagają dopasowania.'),polygon('Nogawka tył — 2 ×',back,2,'Schemat bryły; sprawdź krzywiznę siedzenia.'),polygon('Pas — 1 ×',[point(0,0),point(cm(m.waist+opt.ease*.5+5),0),point(cm(m.waist+opt.ease*.5+5),cm(7)),point(0,cm(7))],1,'Pasek z zapasem na zapięcie.')];}
function apronBlock(m,opt){const w=cm(Math.min(65,m.bust*.68)),l=cm(opt.length);const p=[point(w*.26,0),point(w*.74,0),point(w*.85,l*.35),point(w,l),point(0,l),point(w*.15,l*.35)];const bar=(name,w,h,n=1)=>polygon(name,[point(0,0),point(cm(w),0),point(cm(w),cm(h)),point(0,cm(h))],n,'Pas do podwinięcia i doszycia.');return [polygon('Fartuch — 1 ×',p,1,'Podwiń brzegi i dodaj paski mocujące.'),bar('Pasek na szyję — 1 ×',Math.max(42,m.head+5),6),bar('Troki boczne — 2 ×',75,6,2),bar('Kieszeń — 1 ×',25,20)];}
function hoodBlock(m){const w=cm(m.head*.60),h=cm(m.head*.69);return polygon('Kaptur — 2 ×',[point(0,h*.6),point(w*.1,h*.14),point(w*.65,0),point(w,h*.24),point(w*.87,h),point(w*.25,h)],2,'Orientacyjna forma. Dopasuj dolną krawędź do obwodu dekoltu.');}
function detailsFor(base,m,opt){if(base==='shirt'){return [polygon('Kołnierz — 2 ×',[point(0,0),point(cm((m.neck+5)/2),0),point(cm((m.neck+5)/2),cm(7)),point(0,cm(6))],2,'Sprawdź długość stójki, podklejenie i podkrój szyi.'),polygon('Listwa guzikowa — 2 ×',[point(0,0),point(cm(5),0),point(cm(5),cm(opt.length)),point(0,cm(opt.length))],2,'Uproszczona listwa. Zapięcie do opracowania.')];}
if(base==='hoodie'&&['hood','relaxed','mini'].includes(opt.variant))return [hoodBlock(m),polygon('Kieszeń kangurka — 1 ×',[point(cm(3),0),point(cm(35),0),point(cm(38),cm(21)),point(0,cm(21))],1,'Dodaj odpowiednie podwinięcia otworów.')];return [];}
export function getDefaultsForDesign(designId){const d=DESIGN_LIBRARY.find(p=>p.id===designId)||DESIGN_LIBRARY[0];const short=['short','cropped','mini'].includes(d.variant);return {designId:d.id,length:d.base==='dress'?d.variant==='midi'?102:d.variant==='mini'?82:94:d.base==='skirt'?d.variant==='maxi'?95:d.variant==='midi'?70:d.variant==='mini'?45:58:d.base==='pants'?d.variant==='short'?24:78:d.base==='apron'?65:65, sleeveLength:d.variant==='sleeveless'?0:d.variant==='short'?22:d.base==='shirt'?59:d.base==='top'?23:d.base==='vest'||d.base==='apron'||d.base==='skirt'||d.base==='pants'?0:58,ease:d.variant==='relaxed'?18:d.variant==='sport'?6:12,flare:d.variant==='aline'?15:d.base==='dress'?10:3,seamAllowance:10,variant:d.variant};}
export function draftPattern(measurements,options={}){
 const m=validateMeasurements(measurements);const opt={...getDefaultsForDesign(options.designId||'top-classic'),...options};
 const design=DESIGN_LIBRARY.find(d=>d.id===opt.designId);if(!design)throw Error('Nieznany projekt z biblioteki');
 for(const [key,min,max] of [['length',15,160],['sleeveLength',0,90],['ease',0,35],['flare',0,35],['seamAllowance',0,30]]){const val=Number(opt[key]);if(!Number.isFinite(val)||val<min||val>max)throw Error(`Parametr ${key} musi mieć zakres ${min}–${max}`);opt[key]=val;}
 let pieces=[];const base=design.base;
 if(['top','shirt','hoodie','dress','vest'].includes(base)){pieces.push(bodyBlock(m,opt,{type:base,front:true}),bodyBlock(m,opt,{type:base,front:false}));if(!['vest'].includes(base)&&opt.sleeveLength>=9)pieces.push(sleeveBlock(m,opt));pieces.push(...detailsFor(base,m,opt));}
 else if(base==='skirt')pieces=skirtBlock(m,opt);else if(base==='pants')pieces=pantsBlock(m,opt);else if(base==='apron')pieces=apronBlock(m,opt);
 // Non-overlapping packing on a 950 mm wide virtual sheet, at original 1:1 scale.
 let x=24,y=24,rowHeight=0,totalWidth=0;const laid=[];for(const p of pieces){if(!p)continue;const points=p.points;const all=offsetPolygon(points,opt.seamAllowance);const minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));const w=maxX-minX,h=maxY-minY;if(x+w>950&&x>24){x=24;y+=rowHeight+65;rowHeight=0;}laid.push({...p,cut:all,offsetX:round(x-minX),offsetY:round(y-minY),width:round(w),height:round(h)});x+=w+45;rowHeight=Math.max(rowHeight,h);totalWidth=Math.max(totalWidth,x);}
 const result={schema:'fitmystyle.pattern.v2',design,options:opt,measurements:m,pieces:laid,width:round(Math.max(320,totalWidth+10)),height:round(y+rowHeight+42),unit:'mm',generated:new Date().toISOString(),warning:'Szkic parametryczny — NIE zweryfikowany wykrój produkcyjny; uszyć próbkę i skontrolować wszystkie połączenia, naddatki i dopasowanie.'};
 if(!laid.length||laid.some(p=>!Number.isFinite(p.width)||p.width<=0||p.height<=0))throw Error('Błąd geometrii projektu');return result;
}
const escapeXml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const pathD=pts=>pts.map(([x,y],i)=>`${i===0?'M':'L'}${round(x)} ${round(y)}`).join(' ')+' Z';
export function renderPatternSVG(draft,{preview=false}={}){const lines=draft.pieces.map((p,i)=>{const transform=`translate(${p.offsetX} ${p.offsetY})`;const crop=pathD(p.cut),stitch=pathD(p.points);const tx=round(Math.max(3,Math.min(...p.points.map(pt=>pt[0]))+5)),ty=round(Math.min(...p.points.map(pt=>pt[1]))+40);const details=(p.details||[]).filter(d=>d.type==='line').map(d=>`<path d="M${d.points.map(x=>x.join(' ')).join(' L')}" stroke="#a38370" stroke-width=".8" stroke-dasharray="6 5" fill="none"/>`).join('');return `<g transform="${transform}"><path d="${crop}" fill="${preview?'#e9eee3':'none'}" stroke="#182d25" stroke-width="1.3"/><path d="${stitch}" fill="none" stroke="#52715c" stroke-dasharray="7 4" stroke-width=".75"/>${details}<text x="${tx}" y="${ty}" font-size="10" font-family="Arial,sans-serif" fill="#233a2e">${escapeXml(p.name)}</text><text x="${tx}" y="${ty+14}" font-size="7" font-family="Arial,sans-serif" fill="#577462">CUT ${p.qty} | ${p.fold?'FOLD':'OPEN'}</text></g>`}).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="${draft.width}mm" height="${draft.height}mm" viewBox="0 0 ${draft.width} ${draft.height}"><title>FitMyStyle | ${escapeXml(draft.design.name)} | szkic, niecertyfikowany</title><rect width="100%" height="100%" fill="#fff"/>${lines}<line x1="20" y1="${draft.height-16}" x2="70" y2="${draft.height-16}" stroke="#111" stroke-width=".8"/><text x="20" y="${draft.height-21}" font-size="7">KONTROLA: 50 mm</text></svg>`}
export function techPack(draft){return {project:'FitMyStyle Pattern Studio',status:'PROTOTYPE - FIT TEST REQUIRED',design:draft.design.name,measurementsCm:draft.measurements,options:draft.options,units:'mm',sizeMm:{width:draft.width,height:draft.height},billOfPieces:draft.pieces.map(p=>({piece:p.name,cut:p.qty,onFold:p.fold,boundingBoxMm:[p.width,p.height],notes:p.notes})),preProductionChecklist:['Uszyj próbkę z materiału zastępczego','Sprawdź rozmiar testowego kwadratu 50 mm','Zweryfikuj długość zszywanych krawędzi i obwód pachy','Sprawdź zapięcia, zaszewki, krawędzie i zapasy na podwinięcie','Wykonaj stopniowanie rozmiarów i test rozmiarówki','Zatwierdź przez konstruktora odzieży przed produkcją'],disclaimer:draft.warning};}
/** Offline Polish command interpreter; deliberately rule based, NOT an LLM. */
export function interpretPatternRequest(text,currentOptions=getDefaultsForDesign('top-classic')){
 const t=String(text||'').toLocaleLowerCase('pl').replaceAll(',','.');
 if(t.length>600)throw Error('Opis jest zbyt długi (maks. 600 znaków)');
 const result={...currentOptions};let changes=[];
 const categories=[['hoodie',/bluz[ayę]|hoodie|kaptur/],['shirt',/koszul[aeę]|shirt\b/],['dress',/sukienk[aię]|tunika/],['skirt',/spódnic[aeę]|spodnic/],['pants',/spodni[ea]|szort[ya]/],['vest',/kamizelk[aię]/],['apron',/fartuch/],['top',/t-?shirt|top\b|bluzk[aię]/]];
 const category=categories.find(([,r])=>r.test(t))?.[0];if(category&&category!==result.designId.split('-')[0]){result.designId=DESIGN_LIBRARY.find(x=>x.base===category)?.id||result.designId;result.variant=DESIGN_LIBRARY.find(x=>x.id===result.designId)?.variant||'classic';changes.push('rodzaj ubrania');}
 const get=(r)=>{const m=t.match(r);return m?Number(m[1]):null};
 let sleeve=get(/(?:rękaw(?:y|a|em|ów)?|rekaw(?:y|a|em|ow)?)\s*(?:na|o|=|:|długość|dlugosc)?\s*(\d+(?:\.\d+)?)\s*cm/);
 if(sleeve===null)sleeve=get(/(?:długość|dlugosc)\s*rękaw[a-ząęółśżźćń]*\s*(\d+(?:\.\d+)?)\s*cm/);
 if(sleeve!==null){result.sleeveLength=sleeve;changes.push('rękaw '+sleeve+' cm')}
 else if(/bez\s+rękaw|bez\s+rekaw/.test(t)){result.sleeveLength=0;changes.push('bez rękawów')}
 else if(/krótk(?:i|ie)\s+rękaw|krotk(?:i|ie)\s+rekaw/.test(t)){result.sleeveLength=22;changes.push('krótki rękaw')}
 else if(/dług(?:i|ie)\s+rękaw|dlug(?:i|ie)\s+rekaw/.test(t)){result.sleeveLength=58;changes.push('długi rękaw')}
 const plus=get(/rękaw\w*\s*(?:dłuższ\w*|dluzsz\w*|wydłuż\w*|wydluz\w*)\s*(?:o\s*)?(\d+(?:\.\d+)?)\s*cm/);
 const minus=get(/rękaw\w*\s*(?:krótsz\w*|krotsz\w*|skróć|skroc)\s*(?:o\s*)?(\d+(?:\.\d+)?)\s*cm/);
 if(plus!==null){result.sleeveLength=Math.min(90,result.sleeveLength+plus);changes.push('wydłużenie rękawa')}
 if(minus!==null){result.sleeveLength=Math.max(0,result.sleeveLength-minus);changes.push('skrócenie rękawa')}
 const body=get(/(?:długość|dlugosc)\s*(?:ubrania|koszul[iaęy]?|bluzy|sukienki|spódnicy|spodnicy|fartucha|ciała|ciala)?\s*(?:na|=|:)?\s*(\d+(?:\.\d+)?)\s*cm/);
 if(body!==null){result.length=body;changes.push('długość ubrania')}
 const ease=get(/(?:luz|oversize\s*|ease)\s*(?:na|=|:)?\s*(\d+(?:\.\d+)?)\s*cm/);
 if(ease!==null){result.ease=ease;changes.push('luz odzieżowy')}
 else if(/oversize|luźn[eyą]|luzn/.test(t)){result.ease=20;changes.push('luźny fason')}
 if(/kaptur/.test(t)&&result.designId.split('-')[0]==='hoodie'){result.designId='hoodie-hood';result.variant='hood';changes.push('kaptur')}
 if(/bez kaptura/.test(t)){if(result.designId.startsWith('hoodie-')){result.designId='hoodie-crew';result.variant='crew'}changes.push('bez kaptura')}
 for(const [key,min,max] of [['length',15,160],['sleeveLength',0,90],['ease',0,35]])if(result[key]<min||result[key]>max)throw Error(`Polecenie ustawia ${key} poza zakresem ${min}–${max}`);
 return {options:result,changes,recognized:changes.length>0,notice:changes.length?'Zinterpretowano wyłącznie obsługiwane parametry, pozostałe słowa nie wpływają na konstrukcję.':'Nie rozpoznano polecenia. Wpisz np. „koszula, rękaw 40 cm, długość 70 cm”.'};
}