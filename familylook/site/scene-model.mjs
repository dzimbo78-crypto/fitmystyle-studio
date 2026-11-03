/** Pure preview math. Never writes illustrative defaults into body measurements. */
import {PALETTES, chooseTemplate} from './domain.mjs';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const safeColor=(v,fallback='#ddb699')=>/^#[0-9a-f]{6}$/i.test(v||'')?v:fallback;
export const SKIN_TONES=['#efcfb5','#ddb699','#c79875','#a67450','#785038','#4e3429'];
export const TEXTILE_PATTERNS=[['plain','Gładki'],['rib','Drobny prążek'],['cable','Warkocz'],['waffle','Wafel'],['herringbone','Mikrojodełka'],['stripe','Breton'],['pinstripe','Prążki'],['check','Krata'],['gingham','Mini vichy'],['houndstooth','Pepitka'],['argyle','Argyle'],['fairisle','Nordic'],['seed','Splot ryżowy'],['fisherman','Splot rybacki'],['boucle','Bouclé'],['melange','Melanż'],['dots','Mikrokropki'],['windowpane','Windowpane'],['diamond','Małe romby'],['twill','Twill']];
export function bodyDimensions(p){
 const m=p.measurements||{},num=(k,d,a,b)=>clamp(Number(String(m[k]??'').replace(',','.'))||d,a,b);
 const suggested=Number(p.size||p.heightHint);
 const defaultHeight=Number.isFinite(suggested)&&suggested>=38&&suggested<=164&&p.group!=='adult'?suggested:p.group==='infant'?68:p.group==='child'?110:p.shape==='male'?178:168;
 return {height:num('height',defaultHeight,38,230)/100,chest:num('chest',p.group==='infant'?46:p.group==='child'?58:p.shape==='male'?100:90,25,180)/100,waist:num('waist',p.group==='infant'?46:p.group==='child'?54:76,25,180)/100,hip:num('hip',p.group==='infant'?48:p.group==='child'?62:98,25,190)/100};
}
export function modelSpec(person,project,index=0){
 const d=bodyDimensions(person),baby=person.group==='infant',child=person.group==='child',s=d.height/1.75;
 const headYRadius=d.height*(baby?.135:child?.095:.066);
 const shoulderY=d.height-headYRadius*2.02-(baby?.025:.045)*s;
 const hipY=d.height*(baby?.40:child?.48:.51);
 const chestR=d.chest/5.3,waistR=d.waist/5.3,hipR=d.hip/5.3;
 const measuredShoulder=Number(person.measurements?.shoulder)/200;
 const shoulder=clamp(measuredShoulder||chestR*1.12+.022*s,chestR*.85,chestR*1.5);
 const t=chooseTemplate(person),fit=person.fit||t.fit;
 const ease=({slim:.011,regular:.023,relaxed:.034,oversized:.05}[fit]||.023)*s;
 const palette=(PALETTES.find(p=>p.id===project.paletteId)||PALETTES[0]).colors;
 return {...d,baby,child,s,headYRadius,shoulderY,hipY,chestR,waistR,hipR,shoulder,ease,template:t,
  color:safeColor(person.preview?.color,palette[index%palette.length]),
  skin:safeColor(person.preview?.skin,SKIN_TONES[1]),pattern:TEXTILE_PATTERNS.some(p=>p[0]===person.preview?.pattern)?person.preview.pattern:'plain',
  hair:['none','short','bob'].includes(person.preview?.hair)?person.preview.hair:'none',
  measured:['height','chest','waist','hip'].filter(k=>Number(person.measurements?.[k])>0).length};
}
export function familyLayout(members,project,focus=null){
 const visible=focus?members.filter(p=>p.id===focus):members;
 const rows=[];for(let i=0;i<visible.length;i+=6)rows.push(visible.slice(i,i+6));
 return rows.flatMap((row,rowIndex)=>{let x=0;const items=row.map(person=>{const spec=modelSpec(person,project,members.indexOf(person)),w=Math.max(spec.shoulder*2+.22*spec.s,.42);const item={person,spec,x:x+w/2,z:rowIndex*-.8,width:w};x+=w;return item;});return items.map(item=>({...item,x:item.x-x/2}));});
}
export function printPlacement(spec,artwork){
 const scale=clamp(Number(artwork.scale)||1,.25,1.7),offsetX=clamp(Number(artwork.offsetX)||0,-.4,.4),offsetY=clamp(Number(artwork.offsetY)||0,-.3,.3);
 const pants=spec.template.kind==='pants';
 return {scale,offsetX,offsetY,back:artwork.position==='back',width:Math.min(spec.chestR*1.4,.235*spec.s)*scale,height:.14*spec.s*scale,centerY:spec.shoulderY-(pants?.72:.205)*spec.s+offsetY*spec.s};
}
