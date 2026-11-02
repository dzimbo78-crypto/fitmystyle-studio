import {joinWooVariations} from './woocommerce-variants.mjs';
/** Authorized supplier sync. No authentication bypass, anti-bot evasion or external proxy. */
import {licensedFetch,getRobots} from './catalog-transport.mjs';
import {parsePartnerFeed,mergeCatalog} from './catalog-connectors.mjs';
import {catalogReadiness,publicHttpsURL} from './source-discovery.mjs';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
export function validateSupplier(x){
 if(!x||x.permission!==true||!String(x.licenseReference||'').trim())throw Error('Każde źródło musi mieć prawo do użycia (permission, licenseReference)');
 const u=publicHttpsURL(x.url);if(!['feed','woo','shopify','page'].includes(x.kind||'feed'))throw Error('Nieobsługiwany rodzaj źródła');
 const pages=Math.max(1,Math.min(10,Math.floor(Number(x.maxPages)||1)));
 if(/(?:(?:^|[?&])(?:token|key|secret|password|authorization)=)/i.test(u.search))throw Error('Brak zgody na tokeny w publicznym URL');
 return {...x,url:u.toString(),kind:x.kind||'feed',maxPages:pages,licenseReference:String(x.licenseReference).slice(0,128)};
}
export function pageAddress(source,page){const u=publicHttpsURL(source.url);if(page>1&&!['woo','shopify'].includes(source.kind))throw Error('Stronicowanie tylko Woo/Shopify');if(source.kind==='woo'){u.searchParams.set('page',String(page));u.searchParams.set('per_page',String(Math.min(50,Number(u.searchParams.get('per_page'))||50)))}if(source.kind==='shopify'){u.searchParams.set('page',String(page));u.searchParams.set('limit','50')}return u.toString()}
export async function syncOneSupplier(rawSource,{fetcher=fetch,resolver,wait=pause}={}){
 const source=validateSupplier(rawSource),robots=await getRobots(source.url,{fetcher,resolver});if(!robots.allowed)throw Error(robots.reason);
 let products=[],reports=[],requests=0;let parentRows=[];const baseUrl=source.storeUrl?publicHttpsURL(source.storeUrl).origin:new URL(source.url).origin;
 for(let page=1;page<=source.maxPages;page++){
  const url=pageAddress(source,page);const {response,delaySeconds}=await licensedFetch(source,url,{fetcher,resolver,robots});requests++;
  if(response.status===404&&page>1)break;
  if(response.status!==200)throw Error(`Feed HTTP ${response.status}`);
  if(source.kind==='woo'){try{const obj=JSON.parse(response.text);if(Array.isArray(obj))parentRows.push(...obj)}catch{}}
  const detected=source.format||({woo:'woocommerce',shopify:'shopify',page:'jsonld'}[source.kind]||'auto');
  const {products:part,report}=parsePartnerFeed(response.text,{format:detected,source:String(source.name||new URL(url).hostname),baseUrl,defaultCurrency:source.currency||'EUR',fx:source.fx||{},permission:'supplier-approved'});
  products=mergeCatalog(products,part,5000);reports.push({page,accepted:report.accepted,rejected:report.rejected,reasons:report.reasons});
  // Do not guess there are further pages if no pages were requested or the last page was partial.
  if(!['woo','shopify'].includes(source.kind)||page>=source.maxPages)break;
  let rawCount=0;try{const parsed=JSON.parse(response.text);rawCount=Array.isArray(parsed)?parsed.length:(parsed.products||[]).length}catch{break}
  if(rawCount<50)break;
  await wait(Math.max(1000,Math.min(120000,delaySeconds*1000)));
 }
 if(source.kind==='woo'&&source.withVariations===true&&parentRows.some(p=>p.type==='variable')){
  // One additional public Store API request for variant details, explicitly opt-in.
  const url=new URL(source.url);url.searchParams.set('type','variation');url.searchParams.set('per_page','50');url.searchParams.set('page','1');
  const {response}=await licensedFetch(source,url.toString(),{fetcher,resolver,robots});requests++;
  if(response.status===200){
   const rows=JSON.parse(response.text);if(Array.isArray(rows)){
    const joined=joinWooVariations(parentRows,rows);
    const parsed=parsePartnerFeed(JSON.stringify(joined),{format:'woocommerce',source:source.name,baseUrl,defaultCurrency:source.currency||'EUR',fx:source.fx||{},permission:'supplier-approved'});
    products=mergeCatalog(products,parsed.products,5000);reports.push({page:'variants',accepted:parsed.report.accepted,rejected:parsed.report.rejected,reasons:parsed.report.reasons});
   }
  }
 }
 return {products:products.map(p=>({...p,permission:'supplier-approved',priceVerifiedAt:null,availabilityVerifiedAt:null})),summary:{name:source.name||baseUrl,domain:new URL(source.url).hostname,licenseReference:source.licenseReference,requests,importedAt:new Date().toISOString(),accepted:products.length,reports,quality:catalogReadiness(products)}};
}
export async function syncAllSuppliers(manifest,options={}){
 if(!Array.isArray(manifest?.sources)||manifest.sources.length>20)throw Error('Maksymalnie 20 zatwierdzonych źródeł');
 if(!manifest.sources.length)return {products:[],suppliers:[]};
 let all=[],suppliers=[];for(const source of manifest.sources){const r=await syncOneSupplier(source,options);all=mergeCatalog(all,r.products,5000);suppliers.push(r.summary);if(options.wait)await options.wait(1000)}
 return {products:all,suppliers};
}