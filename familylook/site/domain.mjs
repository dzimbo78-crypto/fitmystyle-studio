/** FitMyStyle · FamilyLook domain. No personal data leaves the browser. */
export const VERSION='2.0.0';
export const GROUPS={adult:'Dorosły',child:'Dziecko',infant:'Niemowlę'};
export const SHAPES={female:'Kobieca',male:'Męska',neutral:'Neutralna / indywidualna'};
export const PALETTES=[
 {id:'nordic',name:'Nordic Calm',colors:['#D8CCBA','#8C9787','#5C4B43']},
 {id:'sand',name:'Sand & Stone',colors:['#F1E9D9','#C5A88C','#55524D']},
 {id:'forest',name:'Forest Day',colors:['#E9E3D7','#566E57','#363D33']},
 {id:'coast',name:'Coastal Linen',colors:['#F1EEE8','#7791A3','#28394B']},
 {id:'rose',name:'Dusty Rose',colors:['#F0E1DE','#B88E94','#6B4A52']},
 {id:'espresso',name:'Espresso Studio',colors:['#EEE7DA','#9A7F69','#49352F']},
 {id:'olive',name:'Earth & Olive',colors:['#EDE5D5','#858A65','#36372E']},
 {id:'mono',name:'Monochrome',colors:['#F6F3ED','#AFAFAB','#252525']}
];
export const TEMPLATES=[
 ['T01','Everyday Tee','tee','adult,child','jersey','regular'],
 ['T02','Heavy Oversized Tee','tee','adult,child','heavy_jersey','oversized'],
 ['T03','Organic Relaxed Tee','tee','adult,child','organic_jersey','relaxed'],
 ['T04','Classic Crewneck','crewneck','adult,child','french_terry','regular'],
 ['T05','Oversized Crewneck','crewneck','adult,child','fleece','oversized'],
 ['T06','Scandi Hoodie','hoodie','adult,child','fleece','relaxed'],
 ['T07','Zip Hoodie','hoodie','adult','french_terry','regular'],
 ['T08','Fine Knit Sweater','sweater','adult,child','knit','regular'],
 ['T09','Cable Knit','sweater','adult','cable_knit','relaxed'],
 ['T10','Ribbed Turtleneck','sweater','adult','ribbed','slim'],
 ['T11','Half-Zip Knit','sweater','adult','knit','regular'],
 ['T12','Soft Cardigan','sweater','adult,child','knit','relaxed'],
 ['T13','Oxford Shirt','shirt','adult,child','oxford','regular'],
 ['T14','Linen Overshirt','shirt','adult','linen','relaxed'],
 ['T15','Everyday Polo','polo','adult,child','pique','regular'],
 ['T16','Scandi Jogger','pants','adult,child','french_terry','regular'],
 ['T17','Relaxed Trouser','pants','adult','twill','relaxed'],
 ['T18','Essential Dress','dress','adult,child','jersey','regular'],
 ['T19','Baby Wrap Body','bodysuit','infant','organic_jersey','regular'],
 ['T20','Baby Cozy Set','bodysuit','infant','french_terry','relaxed']
].map(([id,name,kind,groups,fabric,fit])=>({id,name,kind,groups:groups.split(','),fabric,fit}));
export const PRINT_ZONES={tee:{w:260,h:310},crewneck:{w:280,h:310},hoodie:{w:260,h:270},sweater:{w:220,h:260},shirt:{w:100,h:120},polo:{w:85,h:90},pants:{w:95,h:170},dress:{w:210,h:280},bodysuit:{w:110,h:125}};
export const FABRICS={jersey:'Bawełna jersey',heavy_jersey:'Jersey ciężki',organic_jersey:'Jersey organiczny',french_terry:'French terry',fleece:'Dzianina drapana',knit:'Dzianina swetrowa',cable_knit:'Dzianina warkoczowa',ribbed:'Dzianina prążkowana',oxford:'Tkanina oxford',linen:'Len / mieszanka lniana',pique:'Pika',twill:'Twill'};
export const MEASURES=[
 {key:'height',label:'Wzrost',unit:'cm',zone:'height',tip:'Bez butów, od podłoża do najwyższego punktu głowy; plecy proste, patrz przed siebie.',limits:[38,230]},
 {key:'chest',label:'Obwód klatki / biustu',zone:'chest',tip:'Miarka poziomo wokół najszerszej części klatki; przeprowadź ją pod pachami, nie uciskaj. Dla biustu użyj zwykłej, dobrze dopasowanej bielizny.',limits:[32,180]},
 {key:'underbust',label:'Obwód pod biustem',zone:'underbust',tip:'Poziomo bezpośrednio pod biustem; tylko jeśli konstrukcja tego wymaga.',limits:[45,160]},
 {key:'waist',label:'Obwód talii naturalnej',zone:'waist',tip:'W najwęższym naturalnym miejscu tułowia, zwykle między dolnym żebrem a biodrem; swobodny wydech.',limits:[30,180]},
 {key:'hip',label:'Obwód bioder / pośladków',zone:'hip',tip:'Miarka poziomo przez najszerszą część pośladków; nie ściągaj jej.',limits:[35,190]},
 {key:'neck',label:'Obwód podstawy szyi',zone:'neck',tip:'Luźno wokół nasady szyi, bez ucisku. Nie mierz u niemowlęcia, jeśli nie jest to konieczne.',limits:[18,65]},
 {key:'shoulder',label:'Szerokość ramion',zone:'shoulder',tip:'Z tyłu, od kostnego punktu jednego barku do drugiego, wzdłuż linii barków.',limits:[15,65]},
 {key:'backLength',label:'Długość pleców do talii',zone:'backLength',tip:'Od wystającego kręgu u nasady karku pionowo do zaznaczonej linii talii.',limits:[15,80]},
 {key:'frontLength',label:'Długość przodu do talii',zone:'frontLength',tip:'Od punktu przy nasadzie szyi przez przód tułowia do naturalnej talii.',limits:[15,85]},
 {key:'sleeve',label:'Długość rękawa',zone:'sleeve',tip:'Od punktu barkowego przez lekko zgięty łokieć do nadgarstka; zapisz sposób pomiaru.',limits:[10,100]},
 {key:'bicep',label:'Obwód ramienia',zone:'bicep',tip:'Wokół najszerszego miejsca ramienia przy rozluźnionym mięśniu.',limits:[9,70]},
 {key:'wrist',label:'Obwód nadgarstka',zone:'wrist',tip:'Tuż nad kostkami nadgarstka, bez zaciskania miarki.',limits:[7,35]},
 {key:'inseam',label:'Długość nogawki wewnętrzna',zone:'inseam',tip:'Od kroku wzdłuż wewnętrznej strony nogi do wybranego miejsca zakończenia nogawki; najlepiej z pomocą.',limits:[14,115]},
 {key:'outseam',label:'Długość nogawki zewnętrzna',zone:'outseam',tip:'Od linii talii przy boku ciała do miejsca zakończenia nogawki.',limits:[20,140]},
 {key:'thigh',label:'Obwód uda',zone:'thigh',tip:'W najszerszym miejscu górnej części uda, miarka poziomo.',limits:[15,95]},
 {key:'head',label:'Obwód głowy (opcjonalny)',zone:'head',tip:'Wokół najszerszego miejsca głowy, powyżej brwi i uszu; do czapek i kapturów. U niemowląt bez ucisku.',limits:[28,68]}
];
export const MEASURE_MAP=Object.fromEntries(MEASURES.map(x=>[x.key,x]));
export const REQUIRED={tee:['height','chest','waist','hip','shoulder','backLength'],crewneck:['height','chest','waist','hip','shoulder','sleeve','backLength','bicep'],hoodie:['height','chest','waist','hip','shoulder','sleeve','backLength','bicep'],sweater:['height','chest','waist','hip','shoulder','sleeve','backLength','bicep'],shirt:['height','chest','waist','hip','neck','shoulder','sleeve','backLength','bicep'],polo:['height','chest','waist','hip','shoulder','sleeve','backLength'],pants:['height','waist','hip','inseam','outseam','thigh'],dress:['height','chest','waist','hip','shoulder','backLength','frontLength'],bodysuit:['height','chest','waist','hip','backLength']};
export const FINISH_EASE={slim:{chest:4,waist:3,hip:4,bicep:3,thigh:4},regular:{chest:10,waist:8,hip:10,bicep:6,thigh:8},relaxed:{chest:16,waist:12,hip:14,bicep:9,thigh:12},oversized:{chest:24,waist:20,hip:20,bicep:12,thigh:16}};
export const UTILITY_WORDS=['Konstrukcja koncepcyjna — nie jest zatwierdzonym wykrojem produkcyjnym.','Sprawdź kurczliwość i zachowanie tkaniny po praniu; wykonaj próbkę i przymiarkę.','Przed krojeniem zatwierdź tabelę rozmiarową, szwy, zapasy, tolerancje i rozmieszczenie nadruku.'];
export function makePerson(i=0,type='adult') {return {id:`p-${Date.now()}-${i}`,name:type==='adult'?(i===0?'Mama':i===1?'Tata':`Osoba ${i+1}`):type==='child'?`Dziecko ${i+1}`:'Niemowlę',group:type,shape:i===0?'female':i===1?'male':'neutral',heightHint:type==='infant'?'68':type==='child'?'110':'',templateId:type==='infant'?'T19':type==='child'?'T04':'T04',size:'',fit:'regular',measurements:{},notes:''};}
export function makeProject(){return {version:VERSION,id:`family-${Date.now()}`,name:'Nasza rodzina',paletteId:'nordic',members:[makePerson(0),makePerson(1),makePerson(2,'child'),makePerson(3,'infant')],artwork:{text:'TOGETHER',color:'#594d43',position:'front',scale:1},createdAt:new Date().toISOString()};}
export function allowedTemplates(group){return TEMPLATES.filter(t=>t.groups.includes(group));}
export function chooseTemplate(person){const x=TEMPLATES.find(t=>t.id===person.templateId);return x&&x.groups.includes(person.group)?x:allowedTemplates(person.group)[0];}
export function requiredFor(person){let fields=REQUIRED[chooseTemplate(person).kind]||[];if(person.group==='infant') fields=fields.filter(x=>!['neck','head','shoulder','bicep'].includes(x));return fields;}
export function toCm(value){if(value==null||String(value).trim()==='')return null;const s=String(value).trim().replace(',','.');if(!/^\d{1,3}(?:\.\d{1,2})?$/.test(s))return null;const n=Number(s);return Number.isFinite(n)&&n>0?n:null;}
export function validateMember(person){const errors=[],warnings=[],required=requiredFor(person);const vals=Object.fromEntries(MEASURES.map(m=>[m.key,toCm(person.measurements?.[m.key])]));for(const k of required)if(vals[k]==null)errors.push(`Brak pomiaru: ${MEASURE_MAP[k].label}`);for(const m of MEASURES){const n=vals[m.key];if(n!=null&&(n<m.limits[0]||n>m.limits[1]))warnings.push(`${m.label}: ${n} cm — sprawdź, czy nie ma pomyłki.`)}if(vals.height&&vals.backLength&&vals.backLength>=vals.height)warnings.push('Długość pleców nie może być równa lub większa niż wzrost.');if(vals.hip&&vals.waist&&vals.hip<vals.waist*.65)warnings.push('Sprawdź relację obwodu bioder do talii.');if(person.group==='infant'&&vals.height&&vals.height>100)warnings.push('Wzrost wykracza poza typowy zakres niemowlęcy — sprawdź grupę.');if(person.group==='adult'&&vals.height&&vals.height<125)warnings.push('Sprawdź grupę wiekową i wzrost.');return {valid:errors.length===0,errors,warnings,values:vals,completion:required.length?Math.round(100*(required.length-errors.length)/required.length):100,required};}
export function calculateGarment(person){const t=chooseTemplate(person),v=validateMember(person),ease=FINISH_EASE[person.fit]||FINISH_EASE.regular;const rows=[];for(const k of ['chest','waist','hip','bicep','thigh']) {const n=v.values[k];if(n==null)continue;let extra=ease[k]||0;if(person.group==='infant'&&['chest','waist','hip'].includes(k))extra=Math.max(extra,6);if(t.kind==='shirt'&&['chest','waist'].includes(k))extra=Math.max(extra,10);rows.push({key:k,label:MEASURE_MAP[k].label,body:n,extra,garment:Math.round((n+extra)*10)/10});}for(const k of ['sleeve','inseam','outseam','backLength','frontLength','shoulder'])if(v.values[k]!=null)rows.push({key:k,label:MEASURE_MAP[k].label,body:v.values[k],extra:null,garment:null});return {template:t,validation:v,rows,disclaimer:UTILITY_WORDS};}
export function artworkSpecification(person,artwork){const t=chooseTemplate(person),zone=PRINT_ZONES[t.kind];let scale=person.group==='infant'?.5:person.group==='child'?.72:1;const w=Math.round(zone.w*scale),h=Math.round(zone.h*scale);return {personId:person.id,template:t.id,placement:artwork.position||'front',maxMm:{width:w,height:h},minimumPixels300Dpi:{width:Math.ceil(w/25.4*300),height:Math.ceil(h/25.4*300)},status:'DRAFT_VERIFY_WITH_SUPPLIER',note:'Obszar orientacyjny; dostawca może mieć inne pola druku dla każdego wariantu i rozmiaru.'};}
export function projectWarnings(project){const warnings=[];for(const p of project.members){const t=chooseTemplate(p);if(p.group!=='adult'&&t.kind==='hoodie')warnings.push(`${p.name}: nie projektuj sznurków przy kapturze; zweryfikuj EN 14682 oraz ryzyko drobnych elementów.`);if(p.group==='infant')warnings.push(`${p.name}: unikaj sznurków, luźnych aplikacji i drobnych odpinanych elementów; kontrola bezpieczeństwa obowiązkowa.`)}return [...new Set(warnings)];}
export const safeText=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export function createTechPack(project){return {version:VERSION,type:'DRAFT_TECHNICAL_PACK',projectName:project.name,generatedAt:new Date().toISOString(),palette:PALETTES.find(x=>x.id===project.paletteId)||PALETTES[0],people:project.members.map(p=>({id:p.id,name:p.name,group:p.group,shape:p.shape,size:p.size,fit:p.fit,notes:p.notes,body:validateMember(p),garment:calculateGarment(p),artwork:artworkSpecification(p,project.artwork)})),artwork:project.artwork,warnings:projectWarnings(project),productionStatus:'NOT_APPROVED',approval:{patternMaker:'',fittingDate:'',sampleVersion:'',signoff:''}};}