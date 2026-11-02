/** FitMyStyle private wardrobe. Local-only owned items, not listings or saleable inventory. */
import {validateProduct,STYLES,COLORS} from './core.mjs';
export const WARDROBE_LIMIT=250;
export function makeWardrobeItem(raw){
 if(!raw||typeof raw!=='object')throw Error('Nieprawidłowy element szafy');
 const ownerId=String(raw.ownerId||'').trim();
 if(!/^(adult-[12]|child-[1-5])$/.test(ownerId))throw Error('Wybierz właściciela ubrania');
 if(!STYLES[raw.style]||!COLORS[raw.color])throw Error('Wybierz styl i kolor');
 const id=String(raw.id||'').trim()||`owned-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
 const p=validateProduct({id,name:raw.name,role:raw.role,style:raw.style,color:raw.color,size:raw.size,price:0,shipping:0,currency:'EUR',source:'Moja szafa',stock:'in',description:'Własne ubranie, nie jest ofertą sprzedaży'});
 if(!p.name||p.name.length<2||!String(raw.size||'').trim())throw Error('Podaj nazwę i rozmiar');
 return {...p,id,status:'owned',ownerId,price:0,shipping:0,sourceUrl:'',stock:'in',importedAt:new Date().toISOString()};
}
export function validateWardrobe(list){
 if(!Array.isArray(list)||list.length>WARDROBE_LIMIT)throw Error('Szafa przekracza limit 250 pozycji');
 const seen=new Set();return list.map(x=>{const p=makeWardrobeItem(x);if(seen.has(p.id))throw Error('Powtórzony identyfikator ubrania');seen.add(p.id);return p});
}
export function wardrobeStats(items){
 const byOwner={};const byStyle={};for(const p of items){byOwner[p.ownerId]=(byOwner[p.ownerId]||0)+1;byStyle[p.style]=(byStyle[p.style]||0)+1}
 return {total:items.length,byOwner,byStyle};
}
export function sizeGuide({role='woman',chest,waist,hips,height}){
 const nums=[chest,waist,hips,height].map(x=>Number(x));if(nums.some(n=>!Number.isFinite(n)||n<20||n>260))throw Error('Wprowadź prawidłowe wymiary w cm');
 const [b,w,h,t]=nums;
 if(role==='child'){
  const sizes=[[86,'2Y'],[98,'3Y'],[104,'4Y'],[116,'6Y'],[128,'8Y'],[140,'10Y'],[152,'12Y'],[164,'14Y']];
  return {size:(sizes.find(x=>t<=x[0])||sizes.at(-1))[1],confidence:'orientational',message:'Dobór na podstawie wzrostu; sprawdź tabelę konkretnej marki.'};
 }
 const value=role==='man'?Math.max(b,w*1.07):Math.max(b,h);
 const limits=role==='man'?[[90,'XS'],[97,'S'],[104,'M'],[112,'L'],[120,'XL'],[130,'XXL']]:[[84,'XS'],[92,'S'],[100,'M'],[108,'L'],[116,'XL'],[124,'XXL']];
 return {size:(limits.find(x=>value<=x[0])||['','3XL'])[1],confidence:'orientational',message:'Wstępna wskazówka. Rozmiar zależy od marki, fasonu i materiału — zawsze sprawdź tabelę producenta.'};
}