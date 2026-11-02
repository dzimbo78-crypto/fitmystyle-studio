/** FitMyStyle sizing model: explicit BODY cm vs GARMENT cm, not professional pattern CAD. */
export const GARMENT_TYPES=Object.freeze({
  hoodie:{label:'Bluza hoodie',fit:'relaxed',sleeve:'long',material:'french-terry'},
  sweatshirt:{label:'Bluza crewneck',fit:'regular',sleeve:'long',material:'french-terry'},
  shirt:{label:'Koszula',fit:'regular',sleeve:'long',material:'poplin'},
  sweater:{label:'Sweter klasyczny',fit:'regular',sleeve:'long',material:'merino'},
  cardigan:{label:'Kardigan',fit:'relaxed',sleeve:'long',material:'cotton-knit'},
  knitvest:{label:'Kamizelka dzianinowa',fit:'regular',sleeve:'sleeveless',material:'merino'},
  quarterzip:{label:'Sweter half-zip',fit:'regular',sleeve:'long',material:'merino'},
  mockneck:{label:'Golf / mock neck',fit:'regular',sleeve:'long',material:'cotton-knit'},
  bomber:{label:'Bluza bomber bez kaptura',fit:'relaxed',sleeve:'long',material:'french-terry'},
  tshirt:{label:'T-shirt',fit:'regular',sleeve:'short',material:'jersey'},
  polo:{label:'Polo',fit:'regular',sleeve:'short',material:'jersey'},
  jacket:{label:'Kurtka',fit:'relaxed',sleeve:'long',material:'softshell'},
  dress:{label:'Sukienka',fit:'regular',sleeve:'short',material:'linen'},
  pants:{label:'Spodnie',fit:'regular',sleeve:'long',material:'denim'}
});
export const FABRICS=Object.freeze({
 'merino':{name:'Dzianina merino (wizualizacja)',drape:.56,stretch:18,thickness:.84,texture:.85},
 'cotton-knit':{name:'Dzianina swetrowa bawełniana',drape:.48,stretch:15,thickness:1.18,texture:.9},
 'boucle':{name:'Bouclé strukturalne',drape:.39,stretch:5,thickness:1.6,texture:.95},
 'jersey':{name:'Jersey bawełniany',drape:.7,stretch:18,thickness:0.55,texture:0.7},
 'french-terry':{name:'French terry',drape:.51,stretch:12,thickness:1.15,texture:.8},
 'fleece':{name:'Dresówka drapana',drape:.45,stretch:10,thickness:1.4,texture:.9},
 'poplin':{name:'Popelina',drape:.35,stretch:1,thickness:.38,texture:.37},
 'linen':{name:'Len',drape:.62,stretch:0,thickness:.58,texture:.85},
 'softshell':{name:'Softshell',drape:.26,stretch:4,thickness:1.2,texture:.28},
 'denim':{name:'Denim',drape:.28,stretch:2,thickness:1.32,texture:.5}
});
export const FIT_EASE_CM=Object.freeze({slim:{chest:3,waist:3,hip:3},regular:{chest:9,waist:8,hip:8},relaxed:{chest:17,waist:14,hip:13},oversize:{chest:27,waist:23,hip:21}});
export const DEFAULT_BODY_CM=Object.freeze({man:{height:178,chest:100,waist:86,hip:100,shoulder:46,arm:64},woman:{height:168,chest:92,waist:76,hip:98,shoulder:40,arm:59},child:{height:128,chest:66,waist:59,hip:69,shoulder:30,arm:44}});
export const clampNumber=(x,min,max,fallback)=>(Number.isFinite(Number(x))?Math.max(min,Math.min(max,Number(x))):fallback);
export function calculateGarment(input={}){
 const type=GARMENT_TYPES[input.cut]?input.cut:'hoodie',preset=GARMENT_TYPES[type];
 const bodyType=['man','woman','child'].includes(input.body)?input.body:'woman';
 const defaults=DEFAULT_BODY_CM[bodyType];
 const body={};for(const [name,min,max] of [['height',80,210],['chest',46,160],['waist',40,150],['hip',46,165],['shoulder',22,62],['arm',25,83]])body[name]=clampNumber(input[name]??defaults[name],min,max,defaults[name]);
 const fit=FIT_EASE_CM[input.fit]?input.fit:preset.fit;
 const fabric=FABRICS[input.fabric]?input.fabric:preset.material;
 const ease=FIT_EASE_CM[fit];
 // Positive wearing ease is not a seam allowance. Industry tables vary by cut and material.
 const measures={chest:body.chest+ease.chest,waist:body.waist+ease.waist,hip:body.hip+ease.hip};
 const baseLength=type==='dress'?.57:type==='jacket'?.39:type==='shirt'?.42:.38;
 const lengthCm=clampNumber(input.lengthCm??(body.height*baseLength),32,145,body.height*.4);
 const sleeveType=['long','short','three-quarter','sleeveless'].includes(input.sleeve)?input.sleeve:(type==='dress'?'short':preset.sleeve);
 const sleeveCm=sleeveType==='sleeveless'?0:sleeveType==='short'?Math.round(body.arm*.32):sleeveType==='three-quarter'?Math.round(body.arm*.72):body.arm;
 const warnings=[];
 if(bodyType==='child'&&type==='hoodie')warnings.push('Produkty dziecięce: sprawdź bezpieczeństwo sznurków i troczków kaptura, zgodnie z obowiązującymi normami.');
 if((type==='shirt'||type==='jacket')&&fabric==='jersey')warnings.push('Wybrana dzianina może wymagać innej konstrukcji i stabilizacji szwów.');
 if((type==='pants')&&input.sleeve)warnings.push('Długość rękawa nie dotyczy spodni.');
 if(input.seamType==='overlock'&&['poplin','linen','denim'].includes(fabric))warnings.push('Overlock może służyć do obrzucania tkaniny, ale sprawdź wymagany szew łączący.');
 if(input.seamType==='lockstitch'&&['jersey','french-terry','fleece','merino','cotton-knit','boucle'].includes(fabric))warnings.push('Szew prosty na dzianinie może pękać podczas rozciągania — sprawdź ścieg elastyczny.');
 if((type==='sweater'||type==='cardigan'||type==='mockneck'||type==='quarterzip')&&['poplin','softshell','denim'].includes(fabric))warnings.push('Sweter wymaga odpowiedniej dzianiny i technologii dziewiarskiej lub szycia dzianin.');
 if(fit==='slim'&&FABRICS[fabric].stretch<4)warnings.push('Niewielki luz i nierozciągliwa tkanina: zweryfikuj zakres ruchów na próbce.');
 return {type,bodyType,body,garment:measures,fit,ease:{...ease},fabric,fabricProperties:FABRICS[fabric],recommendedSeam:['jersey','french-terry','fleece','merino','cotton-knit','boucle'].includes(fabric)?'elastyczny/overlock + coverstitch':'stebnowy / odpowiedni do tkaniny',sleeveType,sleeveCm,lengthCm:Number(lengthCm.toFixed(1)),warnings,productionApproved:false};
}
export function getTechnicalPack(input={}){
 const m=calculateGarment(input);
 return {application:'FitMyStyle',version:'10.0',motif:String(input.pattern||'solid').slice(0,60),colour:/^#[0-9a-f]{6}$/i.test(input.color||'')?input.color:'#d8c3a4',productConstructionNotes:['Grubość, gramatura i skład surowca do potwierdzenia przez dostawcę','Sprzedawca musi podać rzeczywisty skład włókien przed zakupem','Wymagany próbny odszyw i weryfikacja tabeli pomiarowej'],documentType:'CONCEPT_TECH_PACK',productionStatus:'NOT_APPROVED',measureUnit:'cm',measurementBasis:'BODY_CIRCUMFERENCE_PLUS_EASE',seamAllowanceCm:clampNumber(input.seamAllowanceCm??1,0,3,1),...m,views:['front','back'],operations:['Zatwierdź materiał, gramaturę i kurczliwość','Sprawdź długości łączonych szwów w wykroju CAD','Wykonaj próbny odszyw i przymiarkę','Zweryfikuj oznakowanie i bezpieczeństwo'],legalNote:'Projekt koncepcyjny. Nie jest gotową dokumentacją produkcyjną ani gwarancją dopasowania.'};
}