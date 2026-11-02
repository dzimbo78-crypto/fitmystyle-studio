/** FitMyStyle local recommendation engine: offline, no API keys, no request limits. */
export const PALETTES = {
  sand: { name: 'Warm Sand', colors: ['cream','sand','tan','brown'], hex: ['#F5EEE4','#D7BA99','#AD896A','#5C493B'] },
  sage: { name: 'Sage & Linen', colors: ['cream','sage','forest','sand'], hex: ['#F5EEE4','#91A695','#425C4E','#D7BA99'] },
  coastal: { name: 'Coastal Blue', colors: ['white','sky','navy','sand'], hex: ['#FAFAF5','#98B8C7','#2E4561','#D7BA99'] },
  rose: { name: 'Rosewood', colors: ['cream','rose','wine','brown'], hex: ['#F5EEE4','#D4A3A2','#854F5D','#5C493B'] },
  mono: { name: 'Monochrome', colors: ['white','charcoal','black','grey'], hex: ['#FAFAF5','#474747','#191919','#A0A0A0'] },
  autumn: { name: 'Autumn Walk', colors: ['cream','rust','brown','olive'], hex: ['#F5EEE4','#BA7756','#5C493B','#777F5A'] },
  lavender: { name: 'Lavender Days', colors: ['cream','lilac','violet','grey'], hex: ['#F5EEE4','#C3B5D3','#8C779F','#A0A0A0'] },
  terracotta: { name: 'Terracotta', colors: ['sand','rust','cream','wine'], hex: ['#D7BA99','#BA7756','#F5EEE4','#854F5D'] },
  denim: { name: 'Denim Blue', colors: ['sky','navy','cream','charcoal'], hex: ['#98B8C7','#2E4561','#F5EEE4','#474747'] },
  sunset: { name: 'Golden Hour', colors: ['cream','gold','rose','sand'], hex: ['#F5EEE4','#E1B46F','#D4A3A2','#D7BA99'] },
  forest: { name: 'Forest & Stone', colors: ['forest','olive','cream','grey'], hex: ['#425C4E','#777F5A','#F5EEE4','#A0A0A0'] },
  pastel: { name: 'Soft Pastels', colors: ['sky','lilac','rose','cream'], hex: ['#98B8C7','#C3B5D3','#D4A3A2','#F5EEE4'] }
};
export const COLORS = {
  cream:'#F5EEE4',sand:'#D7BA99',tan:'#AD896A',brown:'#5C493B',
  sage:'#91A695',forest:'#425C4E',white:'#FAFAF5',sky:'#98B8C7',navy:'#2E4561',
  rose:'#D4A3A2',wine:'#854F5D',charcoal:'#474747',black:'#191919',grey:'#A0A0A0',rust:'#BA7756',olive:'#777F5A',lilac:'#C3B5D3',violet:'#8C779F',gold:'#E1B46F'
};
export const STYLES = {
  everyday: {name:'Codzienny', labels:['essential','relaxed','classic']},
  elegant: {name:'Elegancki', labels:['tailored','refined','ceremony']},
  holiday: {name:'Wakacyjny', labels:['linen','beach','resort']},
  active: {name:'Sportowy', labels:['sport','comfort','weekend']}
};
export const ROLES = ['woman','man','child'];
const garmentNames = {
  woman:{everyday:['Soft Knit Co-ord','Everyday Cotton Set','Relaxed Rib Ensemble'],elegant:['Tailored Two-Piece','Silk-Look Ensemble','Occasion Dress Set'],holiday:['Linen Holiday Set','Resort Dress Ensemble','Breezy Summer Co-ord'],active:['Comfort Jersey Set','Soft Active Duo','Weekend Athleisure']},
  man:{everyday:['Classic Cotton Outfit','Relaxed Weekend Set','Everyday Overshirt Look'],elegant:['Tailored Smart Set','Clean-Line Formal Outfit','Modern Ceremony Look'],holiday:['Linen Shirt & Shorts','Light Resort Outfit','Coastal Holiday Set'],active:['Active Essentials Set','Soft Jersey Duo','Athletic Weekend Outfit']},
  child:{everyday:['Little Explorer Set','Mini Cotton Co-ord','Playtime Essentials'],elegant:['Mini Ceremony Outfit','Little Classic Ensemble','Occasion Outfit'],holiday:['Mini Linen Set','Beach Day Outfit','Summer Adventure Duo'],active:['Junior Sport Set','Play Active Duo','Weekend Movement Set']}
};
export function generateDemoProducts() {
  const items=[];
  for(const [paletteKey,palette] of Object.entries(PALETTES)) {
    for(const style of Object.keys(STYLES)) {
      for(const role of ROLES) {
        for(let variant=0;variant<3;variant++) {
          const color=palette.colors[(variant+(role==='child'?1:role==='man'?2:0))%palette.colors.length];
          const base=role==='child'?16:role==='woman'?37:34;
          items.push({id:`demo-${paletteKey}-${style}-${role}-${variant}`,name:garmentNames[role][style][variant],
            role,style,palette:paletteKey,color,colorHex:COLORS[color],kind:'set',size:'all',
            price:base+variant*7, currency:'EUR',source:'Demo Studio',sourceUrl:'',status:'demo',
            description:'Illustrative concept, not a purchasable product',sku:''});
        }
      }
    }
  }
  return items;
}
const slug = value => String(value||'').trim().toLowerCase();
export function validateProduct(raw) {
  if(!raw || typeof raw!=='object') throw Error('Invalid product record');
  const name=String(raw.name||'').trim().slice(0,120);
  const role=slug(raw.role),style=slug(raw.style),color=slug(raw.color);
  const price=Number(raw.price);
  if(!name) throw Error('Product name is required');
  if(!ROLES.includes(role)) throw Error('Role must be woman, man or child');
  if(!STYLES[style]) throw Error('Invalid style');
  if(!COLORS[color]) throw Error('Unknown color');
  if(!Number.isFinite(price)||price<0||price>100000) throw Error('Invalid price');
  const u=String(raw.sourceUrl||raw.url||'').trim();
  if(u && !/^https?:\/\//i.test(u)) throw Error('Store URL must start with http:// or https://');
  if(u) {let parsed;try {parsed=new URL(u)}catch {throw Error('Store URL is invalid')};if(!['http:','https:'].includes(parsed.protocol)) throw Error('Unsupported URL protocol')}
  const imageUrl=String(raw.imageUrl||raw.image||'').trim();
  if(imageUrl){let parsed;try{parsed=new URL(imageUrl)}catch{throw Error('Invalid product image URL')};if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw Error('Product image must have an HTTPS URL without credentials')}
  const palette=PALETTES[slug(raw.palette)]?slug(raw.palette):Object.keys(PALETTES).find(k=>PALETTES[k].colors.includes(color))||'sand';
  const sizes=String(raw.sizes||raw.size||'all').trim().slice(0,200);
  const status=slug(raw.stock||raw.inStock||'unknown');
  const stock=['in','yes','true','available','1'].includes(status)?'in':['out','no','false','unavailable','0'].includes(status)?'out':'unknown';
  const rawShipping=raw.shipping===undefined||raw.shipping===null||String(raw.shipping).trim()===''?null:Number(raw.shipping);
  if(rawShipping!==null&&(!Number.isFinite(rawShipping)||rawShipping<0||rawShipping>10000))throw Error('Invalid shipping cost');
  const currency=String(raw.currency||'EUR').toUpperCase();
  if(currency!=='EUR')throw Error('Only EUR prices are supported (convert at feed import with a documented exchange rate)');
  return {id:String(raw.id||raw.sku||`import-${Math.random().toString(36).slice(2,11)}`).slice(0,90),name,role,style,palette,color,
    colorHex:COLORS[color],kind:'set',size:sizes,sizes,price,stock,shipping:rawShipping,imageUrl,
    currency:'EUR',source:String(raw.source||'Imported catalogue').trim().slice(0,100),sourceUrl:u,
    status:u?'external':'catalogue',description:String(raw.description||'Imported product — availability not verified').slice(0,240),sku:String(raw.sku||'').slice(0,80),
    feedFormat:String(raw.feedFormat||'legacy').slice(0,24),importedAt:/^\d{4}-\d\d-\d\dT/.test(String(raw.importedAt))?String(raw.importedAt):null,
    permission:String(raw.permission||'legacy-import').slice(0,40),originalCurrency:String(raw.originalCurrency||'EUR').slice(0,5),
    priceVerifiedAt:null,availabilityVerifiedAt:null};
}
export function parseCSV(csv) {
  const first=(csv.split(/\r?\n/,1)[0]||'');
  const delimiter=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  const rows=[];let cur='',record=[],inQuotes=false;
  for(let i=0;i<csv.length;i++){
    const c=csv[i];if(c==='"' && inQuotes && csv[i+1]==='"'){cur+='"';i++;continue}
    if(c==='"'){inQuotes=!inQuotes;continue}
    if(c===delimiter&&!inQuotes){record.push(cur);cur='';continue}
    if((c==='\n'||c==='\r')&&!inQuotes){if(c==='\r'&&csv[i+1]==='\n')i++;record.push(cur);cur='';if(record.some(x=>x.trim()))rows.push(record);record=[];continue}cur+=c;
  }
  if(inQuotes) throw Error('Unclosed CSV quote');record.push(cur);if(record.some(x=>x.trim()))rows.push(record);
  if(!rows.length)return [];
  const header=rows.shift().map(x=>x.trim().replace(/^\uFEFF/,''));
  const required=['name','role','style','color','price'];if(!required.every(k=>header.includes(k)))throw Error(`Required CSV columns: ${required.join(', ')}`);
  return rows.map((r,i)=>{const value={};header.forEach((k,j)=>value[k]=r[j]||'');try{return validateProduct(value)}catch(e){throw Error(`Row ${i+2}: ${e.message}`)}});
}
export function buildFamily(adults=2,children=2){
  const result=[];
  if(adults>=1)result.push({id:'adult-1',label:'Mama',role:'woman',size:'M'});
  if(adults>=2)result.push({id:'adult-2',label:'Tata',role:'man',size:'L'});
  for(let i=0;i<children;i++)result.push({id:`child-${i+1}`,label:`Dziecko ${i+1}`,role:'child',size:`${Math.min(12,4+i*2)}Y`});
  return result;
}
function score(p,role,style,palette,variant,desiredSize){
  let s=0;
  if(p.role!==role)return -Infinity;
  if(p.style===style)s+=50;else s-=20;
  if(p.palette===palette)s+=30;
  if(PALETTES[palette].colors.includes(p.color))s+=18;
  if(p.status!=='demo')s+=9;
  if(p.size==='all'||p.size===desiredSize)s+=12;else s-=65;
  if(p.id.endsWith(`-${variant}`))s+=7;
  return s;
}
const seedHash = value => {let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
/** Returns reproducible recommendations from catalogue; zero requests, zero external calls. */
export function recommend({members,style='everyday',palette='sand',budget=300,count=6,seed=0,onlyImported=false}, products){
  if(!STYLES[style]||!PALETTES[palette])throw Error('Unsupported style/palette');
  const pool=products.filter(p=>!onlyImported||p.status!=='demo');
  const choices=[];
  for(let n=0;n<count;n++){
    const items=[];let sum=0;
    for(const [index,person] of members.entries()){
      const ordered=pool.map(p=>({p,s:score(p,person.role,style,palette,(n+index+seed)%3,person.size)}))
        .filter(x=>Number.isFinite(x.s)).sort((a,b)=> b.s-a.s || a.p.price-b.p.price || a.p.id.localeCompare(b.p.id));
      const nearBudget=ordered.filter(x=>x.s>=25 && (sum+x.p.price<=budget||index===0));
      const candidates=(nearBudget.length?nearBudget:ordered).slice(0,Math.min(9,ordered.length));
      if(!candidates.length){items.push({member:person,product:null});continue}
      const preferred=candidates[seedHash(`${seed}-${n}-${index}-${palette}-${style}`)%Math.min(candidates.length,5)];
      const product=preferred.p;sum+=product.price;items.push({member:person,product});
    }
    const found=items.filter(x=>x.product).length;
    const paletteFits=items.filter(x=>x.product&&PALETTES[palette].colors.includes(x.product.color)).length;
    const match=Math.max(0,Math.min(100,Math.round((found/Math.max(1,members.length))*65 + (paletteFits/Math.max(1,members.length))*35 - Math.max(0,sum-budget)/Math.max(1,budget)*28)));
    const ids=items.map(x=>x.product?.id||'?').join('|');
    if(!choices.some(x=>x.ids===ids))choices.push({id:`look-${seed}-${n}`,items,total:sum,match,withinBudget:sum<=budget,complete:found===members.length,ids});
  }
  return choices.sort((a,b)=>Number(b.complete)-Number(a.complete)||Number(b.withinBudget)-Number(a.withinBudget)||b.match-a.match||a.total-b.total);
}
export function safeText(text){return String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
export function customDesignSvg({text='TOGETHER',color='#F5EEE4',ink='#4C4339',size=640}){
  const label=safeText(String(text).slice(0,30).toUpperCase()); const safeColor=/^#[0-9a-f]{6}$/i.test(color)?color:'#F5EEE4';const safeInk=/^#[0-9a-f]{6}$/i.test(ink)?ink:'#4C4339';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${safeColor}"/><circle cx="${size/2}" cy="${size/2}" r="${size*0.37}" stroke="${safeInk}" stroke-width="3" fill="none"/><path d="M${size*.2} ${size*.52} Q${size*.5} ${size*.18} ${size*.8} ${size*.52}" fill="none" stroke="${safeInk}" stroke-width="3"/><text x="50%" y="51%" fill="${safeInk}" font-size="${Math.min(52,Math.max(16,350/Math.max(5,label.length)))}" font-family="Arial,sans-serif" letter-spacing="3" font-weight="700" text-anchor="middle">${label}</text><text x="50%" y="62%" fill="${safeInk}" font-family="Arial,sans-serif" font-size="17" letter-spacing="5" text-anchor="middle">FAMILY COLLECTION</text></svg>`;
}