/** FitMyStyle independent, deterministic styling and commerce planning. No paid APIs. */
import {PALETTES,STYLES,COLORS,validateProduct} from './core.mjs';
const fold=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function parseStyleBrief(input){
 const s=fold(input).slice(0,1400), result={original:String(input||'').slice(0,1400),style:null,palette:null,budget:null,matching:'coordinated',priority:'balanced',notes:[]};
 const styles={holiday:['wakac','plaz','urlop','morze','beach','summer','vacation','resort'],elegant:['slub','wese','komuni','chrzest','swiet','elegan','formal','wedding','ceremony','christmas','fotograf','sesj','photo'],active:['sport','aktywn','rower','biegan','gym','running','athletic'],everyday:['codzien','szkol','spacer','casual','everyday','weekend','praca']};
 for(const [k,words] of Object.entries(styles))if(words.some(w=>s.includes(w))){result.style=k;result.notes.push(`Okazja: ${STYLES[k].name}`);break}
 const colors={sage:['szalwi','szałwi','oliwk','green','sage','zielon'],coastal:['niebies','blekit','błękit','blue','navy','morski'],rose:['rozow','różow','pink','rose','bordow'],mono:['czarn','bial','biał','mono','black','white'],sand:['bezow','beżow','krem','sand','cream','neutral'],autumn:['jesien','jesień','rudz','autumn','rust'],lavender:['lawend','fiolet','purple','lilac'],terracotta:['terakot','cegl','terracotta'],denim:['jeans','denim'],sunset:['zolty','żółt','sunset'],forest:['butelkow','forest','ciemnoziel'],pastel:['pastel','delikatn']};
 for(const [k,words] of Object.entries(colors))if(PALETTES[k]&&words.some(w=>s.includes(w))){result.palette=k;result.notes.push(`Paleta: ${PALETTES[k].name}`);break}
 const amount=s.match(/(?:budzet|budżet|do|under|max|maximum|limit|za)\s*([1-9][\d\s]{1,5})\s*(?:€|eur|euro)?/i)||s.match(/([1-9][\d\s]{1,5})\s*(?:€|eur|euro)\b/i);
 if(amount){const value=Number(amount[1].replace(/\s/g,''));if(value>=30&&value<=10000){result.budget=value;result.notes.push(`Budżet: ${value} €`)}}
 if(/identycz|takie same|ten sam|matching|identical/.test(s))result.matching='identical';
 if(/tani|najtan|oszczed|budget|cheapest|econom/.test(s))result.priority='price';
 if(/jakosc|premium|eleganc|quality/.test(s))result.priority='harmony';
 return result;
}
export function normalizedSizes(p){
 const raw=String(p.sizes||p.size||'all').trim();
 return raw.split(/[|;,/]/).map(x=>x.trim().toUpperCase()).filter(Boolean);
}
export function compatibleSize(product,desired){
 if(product.status==='demo')return true;
 const available=normalizedSizes(product);
 if(available.includes('ALL')||available.includes('ONE SIZE'))return true;
 if(!desired||desired==='?')return true;
 return available.includes(String(desired).toUpperCase());
}
export function eligibility(product,member,{realOnly=false}={}){
 if(!product||product.role!==member.role)return false;
 if(product.status==='owned'&&product.ownerId!==member.id)return false;
 if(realOnly&&(product.status==='demo'||!product.sourceUrl))return false;
 if(String(product.stock||'unknown').toLowerCase()==='out')return false;
 return compatibleSize(product,member.size);
}
function mixSeed(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function productScore(product,member,options){
 let points=0;
 if(product.style===options.style)points+=36;
 if(product.palette===options.palette)points+=26;
 if(PALETTES[options.palette]?.colors.includes(product.color))points+=22;
 if(product.status!=='demo')points+=5;
 if(product.status==='owned')points+=58;
 if(product.stock==='in')points+=4;
 if(product.status!=='demo'){const age=Date.parse(product.importedAt||'');if(Number.isFinite(age)){const days=(Date.now()-age)/86400000;if(days>7)points-=8;else if(days>1)points-=3}if(product.stock==='unknown')points-=3}
 if(options.matching==='identical')points+=product.kind==='set'?6:0;
 if(options.priority==='price')points-=product.price*0.6;
 if(options.priority==='harmony')points+=product.palette===options.palette?16:0;
 return points;
}
function rankLook(items,opts){
 const products=items.map(x=>x.product).filter(Boolean);
 const subtotal=products.reduce((s,x)=>s+x.price,0);
 const merchants=new Map();
 for(const p of products)if(p.status!=='demo'&&p.status!=='owned'){
  const key=String(p.source||(p.sourceUrl?new URL(p.sourceUrl).hostname:'Unknown merchant')).toLowerCase();
  merchants.set(key,Math.max(merchants.get(key)||0,Number(p.shipping||0)));
 }
 const shipping=[...merchants.values()].reduce((a,b)=>a+b,0); // Known estimate, unknown shipping not invented.
 const missingShipping=products.some(p=>p.status!=='demo'&&p.status!=='owned'&&p.shipping===null);
 const total=subtotal+shipping;
 const colors=products.map(p=>p.color), share=colors.length?colors.filter(c=>PALETTES[opts.palette]?.colors.includes(c)).length/colors.length:0;
 const harmonized=colors.length?colors.filter(c=>c===colors[0]).length/colors.length:0;
 const samePalette=products.length?products.filter(p=>p.palette===opts.palette).length/products.length:0;
 const complete=products.length===items.length;
 const under=total<=opts.budget;
 const match=Math.max(0,Math.min(100,Math.round(45*share+30*samePalette+25*(opts.matching==='identical'?harmonized:1)-Math.max(0,total-opts.budget)/Math.max(1,opts.budget)*35)));
 const ownedCount=products.filter(p=>p.status==='owned').length;
 const score=(complete?150:0)+(under?80:0)+ownedCount*28+match*1.8-total*(opts.priority==='price'?0.33:0.06)-(missingShipping?4:0);
 return {items,subtotal,shipping,shippingUnknown:missingShipping,total,match,score,complete,withinBudget:under,sourceCount:merchants.size,allDemo:products.every(p=>p.status==='demo'),ids:items.map(x=>x.product?.id||'missing').join('|')};
}
/** Bounded beam search, price/budget/shipping-aware; skips duplicate stock and rejects unlisted sizes. */
export function recommendPro({members,style='everyday',palette='sage',budget=300,count=6,seed=0,realOnly=false,matching='coordinated',priority='balanced'},catalog){
 if(!Array.isArray(members)||!members.length||members.length>12)throw Error('Invalid family');
 if(!STYLES[style]||!PALETTES[palette])throw Error('Unknown style or palette');
 const opts={style,palette,budget:Number(budget)||300,matching,priority};
 const candidates=members.map((m,index)=>catalog.filter(p=>eligibility(p,m,{realOnly})).map(p=>({p,quality:productScore(p,m,opts),variation:(mixSeed(`${p.id}-${m.id}-${seed}`)%1000)/1000})).sort((a,b)=>(b.quality+b.variation*7)-(a.quality+a.variation*7)||a.p.price-b.p.price||a.p.id.localeCompare(b.p.id)).slice(0,30));
 if(candidates.some(c=>!c.length))return [{...rankLook(members.map((m,i)=>({member:m,product:candidates[i][0]?.p||null})),opts),id:'incomplete',missing:members.filter((_,i)=>!candidates[i].length).map(m=>m.label)}];
 let beam=[{items:[],score:0,used:new Set()}];
 for(let i=0;i<members.length;i++){
  const next=[];
  for(const partial of beam)for(const {p,quality} of candidates[i]){
   // Demo template can be reused for multiple children, while unique imported SKUs are not duplicated by accident.
   if(p.status!=='demo'&&partial.used.has(p.id))continue;
   const used=new Set(partial.used);if(p.status!=='demo')used.add(p.id);
   const item={member:members[i],product:p};
   const estimate=rankLook([...partial.items,item],opts);
   next.push({items:[...partial.items,item],used,score:quality+partial.score+(estimate.withinBudget?15:0)-Math.max(0,estimate.total-budget)*.2});
  }
  next.sort((a,b)=>b.score-a.score||a.items.map(x=>x.product.id).join('|').localeCompare(b.items.map(x=>x.product.id).join('|')));
  beam=next.slice(0,65);
  if(!beam.length)break;
 }
 const ranked=beam.map(b=>{const look=rankLook(b.items,opts);return {...look,score:look.score+(mixSeed(`${seed}-${look.ids}`)%1000)/1000*12}}).sort((a,b)=>b.score-a.score||a.total-b.total);
 const result=[],seen=new Set();
 for(const look of ranked){if(seen.has(look.ids))continue;seen.add(look.ids);result.push({...look,id:`p${seed}-${result.length}`,missing:[]});if(result.length>=count)break}
 return result;
}
/** Reliable alternatives only: same person role and exact declared size, never invented. */
export function findAlternatives({member,chosen,style='everyday',palette='sage',budget=300,onlyImported=true},catalog,limit=8){
 if(!member||!Array.isArray(catalog)||!STYLES[style]||!PALETTES[palette])throw Error('Invalid alternatives request');
 return catalog.filter(p=>p.id!==chosen?.id&&eligibility(p,member,{realOnly:onlyImported}))
  .map(p=>({product:p,score:productScore(p,member,{style,palette,priority:'balanced',matching:'coordinated'}),difference:Number((p.price-(chosen?.price||0)).toFixed(2))}))
  .sort((a,b)=>b.score-a.score||a.product.price-b.product.price).slice(0,limit);
}
export function customizeLook(look,memberId,newProduct,{style='everyday',palette='sage',budget=300,matching='coordinated',priority='balanced'}={}){
 if(!look?.items?.length||!memberId||!newProduct)throw Error('Invalid customization');const row=look.items.find(x=>x.member.id===memberId);if(!row||!eligibility(newProduct,row.member))throw Error('Replacement not available for member size');
 const items=look.items.map(x=>x.member.id===memberId?{member:x.member,product:newProduct}:x);
 return {...rankLook(items,{style,palette,budget,matching,priority}),id:`custom-${look.id}`,missing:[]};
}
export function prepareShoppingPlan(look){
 if(!look||!Array.isArray(look.items))throw Error('Invalid look');
 const groups=new Map(),unavailable=[],owned=[];
 for(const row of look.items){const p=row.product;
  if(p?.status==='owned'){owned.push({person:row.member.label,name:p.name,size:row.member.size});continue}
  if(!p||p.status==='demo'||!p.sourceUrl){unavailable.push(row.member.label);continue}
  const key=p.source||(p.sourceUrl?new URL(p.sourceUrl).hostname:'Unknown merchant');
  if(!groups.has(key))groups.set(key,{merchant:key,items:[],shippingEstimate:0,shippingKnown:true});
  const g=groups.get(key);g.items.push({person:row.member.label,size:row.member.size,sku:p.sku||null,name:p.name,price:p.price,url:p.sourceUrl,stock:p.stock||'unknown'});
  if(p.shipping===null)g.shippingKnown=false;else g.shippingEstimate=Math.max(g.shippingEstimate,Number(p.shipping)||0);
 }
 return {owned,status:'shopping-plan-not-an-order',notice:'External product links; each merchant checkout is separate. Recheck size, total and stock. No purchase or payment has been made.',createdAt:new Date().toISOString(),groups:[...groups.values()],unavailable};
}
export function normalizeLibrary(data){if(!Array.isArray(data))throw Error('Expected array');if(data.length>10000)throw Error('Too many products');return data.map(validateProduct)}