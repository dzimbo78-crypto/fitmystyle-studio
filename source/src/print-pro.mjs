import {safeText} from './core.mjs';
export const PRINT_THEMES=[
 {id:'heritage',name:'Heritage circle',hint:'Minimalistyczna kolekcja rodzinna'},
 {id:'college',name:'College',hint:'Sportowe liternictwo'},
 {id:'botanical',name:'Botanical',hint:'Liście i subtelna typografia'},
 {id:'sunshine',name:'Sunshine',hint:'Wakacyjny motyw słońca'},
 {id:'mountains',name:'Mountains',hint:'Wyjazdy i przygody'},
 {id:'modern',name:'Modern type',hint:'Nowoczesny nadruk premium'},
 {id:'badge',name:'Family badge',hint:'Emblemat rodzinny'},
 {id:'stars',name:'Little stars',hint:'Gwiazdki dla małych i dużych'}
];
const color=v=>/^#[0-9a-f]{6}$/i.test(String(v))?v:'#425C4E';
export function printArtwork({theme='heritage',headline='TOGETHER',subline='FAMILY COLLECTION',ink='#425C4E',size=1200}={}){
 if(!PRINT_THEMES.some(x=>x.id===theme))throw Error('Unknown print design');
 if(!Number.isInteger(size)||size<320||size>5000)throw Error('Invalid canvas size');
 const text=safeText(String(headline).trim().slice(0,32).toUpperCase()||'TOGETHER');
 const sub=safeText(String(subline).trim().slice(0,48).toUpperCase()||'FAMILY COLLECTION');
 const stroke=color(ink),n=text.length,fontsize=n>17?49:n>11?70:96;
 const themes={
  heritage:`<circle cx="600" cy="580" r="410" fill="none" stroke="${stroke}" stroke-width="13"/><circle cx="600" cy="580" r="378" fill="none" stroke="${stroke}" stroke-width="2"/><path d="M430 326 Q600 210 770 326" fill="none" stroke="${stroke}" stroke-width="10"/><circle cx="600" cy="320" r="21" fill="${stroke}"/>`,
  college:`<path d="M210 295H990V900H210Z" fill="none" stroke="${stroke}" stroke-width="18"/><path d="M272 365H928M272 825H928" stroke="${stroke}" stroke-width="8"/><path d="M555 225L600 147L645 225" fill="none" stroke="${stroke}" stroke-width="12"/>`,
  botanical:`<path d="M326 790Q229 525 430 287 M874 790Q971 525 770 287" stroke="${stroke}" stroke-width="11" fill="none"/>${[0,1,2,3].map(i=>`<ellipse cx="${341+i*15}" cy="${370+i*108}" rx="42" ry="81" transform="rotate(${-48+i*7} ${341+i*15} ${370+i*108})" fill="${stroke}" opacity=".77"/><ellipse cx="${859-i*15}" cy="${370+i*108}" rx="42" ry="81" transform="rotate(${48-i*7} ${859-i*15} ${370+i*108})" fill="${stroke}" opacity=".77"/>`).join('')}`,
  sunshine:`<circle cx="600" cy="600" r="310" fill="none" stroke="${stroke}" stroke-width="19"/>${Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return `<path d="M${Math.round(600+360*Math.cos(a))} ${Math.round(600+360*Math.sin(a))}L${Math.round(600+440*Math.cos(a))} ${Math.round(600+440*Math.sin(a))}" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>`}).join('')}`,
  mountains:`<path d="M165 775L418 390L595 629L743 452L1035 775Z" stroke="${stroke}" fill="none" stroke-width="22" stroke-linejoin="round"/><path d="M352 497L418 390L502 503M687 546L743 452L810 548" stroke="${stroke}" stroke-width="15" fill="none"/>`,
  modern:`<path d="M170 235H1030M170 920H1030" stroke="${stroke}" stroke-width="14"/><path d="M195 270V885M1005 270V885" stroke="${stroke}" stroke-width="3"/>`,
  badge:`<path d="M600 174L968 314V691Q954 908 600 1042Q246 908 232 691V314Z" stroke="${stroke}" fill="none" stroke-width="18"/><path d="M355 390H845" stroke="${stroke}" stroke-width="9"/><path d="M355 816H845" stroke="${stroke}" stroke-width="9"/>`,
  stars:`${Array.from({length:19},(_,i)=>{const x=270+(i*193)%665,y=235+(i*139)%710,r=12+(i%3)*12;return `<path d="M${x} ${y-r}L${x+r*.28} ${y-r*.28}L${x+r} ${y}L${x+r*.28} ${y+r*.28}L${x} ${y+r}L${x-r*.28} ${y+r*.28}L${x-r} ${y}L${x-r*.28} ${y-r*.28}Z" fill="${stroke}" opacity=".75"/>`}).join('')}`
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1200 1200" role="img" aria-label="Original vector print artwork"><title>FitMyStyle original print design</title>${themes[theme]}<g text-anchor="middle" fill="${stroke}" font-family="Arial,Helvetica,sans-serif"><text x="600" y="635" font-size="${fontsize}" font-weight="800" letter-spacing="${n>18?1:7}" textLength="${Math.min(870, Math.max(350,n*55))}" lengthAdjust="spacingAndGlyphs">${text}</text><text x="600" y="715" font-size="24" letter-spacing="5" textLength="${Math.min(700,Math.max(290,sub.length*16))}" lengthAdjust="spacingAndGlyphs">${sub}</text></g></svg>`;
}
export function printTechnicalPack({theme,headline,subline,ink}){
 return {app:'FitMyStyle Studio',kind:'vector-print-draft',status:'NOT_PRODUCTION_APPROVED',version:3,design:{theme,headline,subline,ink},canvas:{width:1200,height:1200,unit:'svg viewBox',background:'transparent'},cautions:['Convert text to curves if supplier requires path-only art.','Confirm print area, minimum line width and supported file formats.','Verify contrast and commercial rights before production.','This SVG mockup is not a licensed external product nor a manufacturing order.']};
}