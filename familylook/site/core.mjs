export const USER_TYPES=['adultM','adultF','child','baby'];
export const MAX_MEMBERS=8;
export const SKIN_TONES=['#f1c9a5','#d8ae8b','#ba865c','#946444','#6c4635','#422a23'];
export const PRINT_DPI=300;
export const DEFAULT_MEMBERS=[
 {id:'papa',name:'Tata',type:'adultM',size:'M',skin:'#d8ae8b'},
 {id:'mama',name:'Mama',type:'adultF',size:'S',skin:'#f1c9a5'},
 {id:'kid',name:'Dziecko',type:'child',size:'110',skin:'#f1c9a5'},
 {id:'baby',name:'Niemowlę',type:'baby',size:'68',skin:'#d8ae8b'}
];
export const SIZE_OPTIONS={adultM:['S','M','L','XL','XXL'],adultF:['XS','S','M','L','XL'],child:['86','92','98','104','110','116','122','128','134','140','146'],baby:['56','62','68','74','80','86']};
export const htmlEsc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chooseTemplate(templates,member,preferredId,category){
 const t=templates.find(x=>x.id===preferredId&&x.sizes?.[member.type]?.includes(member.size));if(t)return t;
 const c=templates.find(x=>x.category===category&&x.sizes?.[member.type]?.includes(member.size));if(c)return c;
 if(member.type==='baby')return templates.find(x=>x.category==='bodysuit'&&x.sizes?.baby?.includes(member.size))||null;
 return templates.find(x=>x.category==='tshirt'&&x.sizes?.[member.type]?.includes(member.size))||null;
}
export function resolveFamily(catalog,state){
 const base=catalog.templates.find(x=>x.id===state.templateId)||catalog.templates[0];const palette=catalog.palettes.find(x=>x.id===state.paletteId)||catalog.palettes[0];
 return state.members.map((m,i)=>{const t=chooseTemplate(catalog.templates,m,m.templateId||base.id,base.category);
  return {member:{...m},template:t,color:state.paletteMode==='coordinated'?palette.colors[i%palette.colors.length]:state.color||palette.colors[0],valid:!!t};
 });
}
export function validateConfiguration(state,catalog){
 const errors=[];if(!Array.isArray(state.members)||state.members.length<1||state.members.length>MAX_MEMBERS)errors.push('Rodzina musi liczyć od 1 do 8 osób');
 const ids=new Set();for(const m of state.members||[]){if(!USER_TYPES.includes(m.type))errors.push('Nieznany typ osoby');if(ids.has(m.id))errors.push('Duplikat osoby');ids.add(m.id);
 if(!SIZE_OPTIONS[m.type]?.includes(m.size))errors.push('Nieprawidłowy rozmiar: '+m.name);}
 if(!catalog.templates.some(t=>t.id===state.templateId))errors.push('Nieznany szablon');
 if(!catalog.palettes.some(p=>p.id===state.paletteId))errors.push('Nieznana paleta');
 if(String(state.printText||'').length>35)errors.push('Napis za długi (maksymalnie 35 znaków)');
 if(!['front','back'].includes(state.view))errors.push('Nieznany widok');
 return errors;
}
export function printSizePx(mm,dpi=PRINT_DPI){return Math.ceil(mm/25.4*dpi)}
export function printReadiness(t,art){const requiredW=printSizePx(t.printAreaMm.width),requiredH=printSizePx(t.printAreaMm.height);const issues=[];
 if(!t.providerMapping)issues.push('Brak zatwierdzonego wariantu produktu u dostawcy');
 if(art?.type==='raster'&&((art.width||0)<requiredW||(art.height||0)<requiredH))issues.push(`Grafika rasterowa ma zbyt małą rozdzielczość; potrzebne minimum ${requiredW} × ${requiredH} px dla całego pola`);
 if(t.safety)issues.push('Wymagane sprawdzenie bezpieczeństwa odzieży dziecięcej');
 issues.push('Wymiary pola nadruku są orientacyjne; zweryfikuj specyfikację konkretnego dostawcy');
 return {status:'manual-review',issues,requiredPx:{width:requiredW,height:requiredH}};
}
export function buildQuoteDraft(catalog,state){const issues=validateConfiguration(state,catalog);if(issues.length)throw Error(issues.join('; '));const items=resolveFamily(catalog,state);return {
 schema:'fitmystyle-familylook-quote-v1',status:'draft',createdAt:new Date().toISOString(),noPayment:true,noSupplierOrder:true,
 paletteId:state.paletteId,templateId:state.templateId,pattern:state.pattern,printText:state.printText||'',view:state.view,
 items:items.map(({member,template,color})=>({memberId:member.id,role:member.type,displayName:member.name,size:member.size,conceptTemplateId:template?.id||null,conceptColor:color,verifiedSupplierVariant:null,printAreaMm:template?.printAreaMm||null,artReview:template?printReadiness(template,state.artwork):null})),
 notices:['Wycena wymaga ręcznej weryfikacji produktu, materiału i nadruku','Brak aktywnego checkoutu i automatycznych zleceń do szwalni']
 };}
export function initialState(){return {members:DEFAULT_MEMBERS.map(x=>({...x})),templateId:'FMS-T05',paletteId:'nordic',paletteMode:'coordinated',color:'#8f9d88',pattern:'solid',printText:'',view:'front',artwork:null,overlayPosition:'chest',activeMemberId:'mama'};}