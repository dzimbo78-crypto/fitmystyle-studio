import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {normalizeOffer} from '../site/shopping-core.mjs';
import {classifyGarment,classifyColor} from './catalog-classification.mjs';
const official={hm:'www2.hm.com',ca:'www.c-and-a.com',decathlon:'www.decathlon.pl',reserved:'www.reserved.com',sinsay:'www.sinsay.com',cropp:'www.cropp.com',house:'www.housebrand.com',mohito:'www.mohito.com',bonprix:'www.bonprix.pl'};
export function buildObservedCatalog(base,research,batches){
 const records=[...(base.offers||[]),...(research.offers||[])],sources=[...(research.sources||[])];
 for(const b of batches){if(new URL(b.url).hostname!=='www.reserved.com')throw Error('Unexpected observed merchant');sources.push({url:b.url,checkedAt:b.checkedAt,evidenceType:'visible-listing-dom'});
  for(const r of b.rows){const amount=r.priceText.match(/([\d\s\u00a0]+,\d{2})\s*PLN/);if(!amount)throw Error('Unrecognized visible price');const color=(r.alt||'').split(' - ').slice(1,-1).join(' - '),gender=b.url.includes('/dziewczynka/')?'female':b.url.includes('/chlopiec/')?'male':'neutral';
   records.push({id:'reserved-'+r.url.split('/').at(-1).match(/[a-z0-9]+-[a-z0-9]+$/i)?.[0],storeId:'reserved',name:r.name,url:r.url,price:Number(amount[1].replace(/[\s\u00a0]/g,'').replace(',','.')),currency:'PLN',audience:b.audience,gender,...classifyGarment(r.name,b.url.endsWith('/buty')?'shoes':b.url.includes('/spodnie')?'bottom':'top'),colorFamily:classifyColor(color),color,sizes:[],sizesKnown:false,availability:'unknown',checkedAt:b.checkedAt,image:r.image,images:[r.image,r.imageBack],sourcePage:b.url,ageNote:b.audience==='child'?'1–6 lat':b.audience==='infant'?'0–12 miesięcy':'',source:'verified-page',market:'PL'});
  }
 }
 const index=new Map();
 for(const raw of records){const classified=raw.sourcePage?classifyGarment(raw.name,raw.category):{category:raw.category,garmentKind:raw.garmentKind};const o=normalizeOffer({...raw,...classified,colorFamily:raw.color?classifyColor(raw.color):raw.colorFamily,sizesKnown:raw.sizesKnown===true||Array.isArray(raw.sizeAvailability)&&raw.sizeAvailability.length>0,gender:raw.gender||(raw.sourcePage?.includes('/dziewczynka')?'female':raw.sourcePage?.includes('/chlopiec')?'male':'neutral')});
  if(!o||!o.image||!o.checkedAt||o.price<=0||new URL(o.url).hostname!==official[o.storeId])throw Error('Invalid official observation: '+raw.id);
  const old=index.get(o.id);if(old&&old.audience!==o.audience){const baby=[old.audience,o.audience].every(a=>['child','infant'].includes(a)),adult=[old.audience,o.audience].every(a=>['woman','man','adult'].includes(a));if(!baby&&!adult)throw Error('Conflicting audience: '+o.url);o.audiences=[...new Set([...old.audiences,...o.audiences])];o.audience=baby?'infant':'adult';}if(old&&old.gender!==o.gender)o.gender='neutral';if(!old||Date.parse(o.checkedAt)>=Date.parse(old.checkedAt))index.set(o.id,o);
 }
 const offers=[...index.values()].sort((a,b)=>a.storeId.localeCompare(b.storeId)||a.audience.localeCompare(b.audience)||a.id.localeCompare(b.id));
 if(new Set(offers.map(o=>o.id)).size!==offers.length)throw Error('Duplicate product identity');
 const sourceIndex=new Map(sources.map(s=>[s.url+'|'+s.checkedAt,s]));
 return {schema:'familylook.retail.v2',checkedAt:new Date(Math.max(...offers.map(o=>Date.parse(o.checkedAt)))).toISOString(),builtAt:new Date().toISOString(),sourceType:'official_page_snapshot',priceMode:'dated-page-snapshot',liveStock:false,offers,sources:[...sourceIndex.values()].map(s=>({url:s.url,checkedAt:s.checkedAt,evidenceType:s.evidenceType||'public-listing-html'}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [basePath,researchPath,batchesPath,outPath]=process.argv.slice(2);if(!outPath)throw Error('Usage: node build-observed-catalog.mjs BASE.json OBSERVATIONS.json DOM-BATCHES.json OUTPUT.json');
 const [base,research,batches]=await Promise.all([basePath,researchPath,batchesPath].map(p=>readFile(resolve(p),'utf8').then(JSON.parse)));
 const result=buildObservedCatalog(base,research,batches),temp=resolve(outPath)+'.tmp';const {offers,...metadata}=result;const encoded=JSON.stringify(metadata,null,2).slice(0,-2)+',\n  \"offers\": [\n'+offers.map(o=>'    '+JSON.stringify(o)).join(',\n')+'\n  ]\n}\n';await writeFile(temp,encoded);await rename(temp,resolve(outPath));console.log(JSON.stringify({offers:result.offers.length,stores:[...new Set(result.offers.map(o=>o.storeId))],knownSizes:result.offers.filter(o=>o.sizesKnown).length}));
}
