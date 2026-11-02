/** FitMyStyle independent catalog adapters. Zero secret keys, no access-control bypass.
 * Only import product data you are licensed/authorized to reuse.
 * Metadata inference is heuristic and rejects unclassifiable products rather than fabricating them.
 */
import {validateProduct, COLORS, PALETTES} from './core.mjs';

const MAX_RECORDS=15000;
const clean=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const fold=s=>clean(s).toLocaleLowerCase('en').normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const activeText=(obj,...names)=>{for(const name of names)if(obj?.[name]!==undefined && obj[name]!==null&&String(obj[name]).trim())return obj[name];return ''};
const matchWords=(text,words)=>words.some(w=>new RegExp(`(^|[^a-z0-9])${w}(?=$|[^a-z0-9])`,'i').test(text));
const colorTerms={
 cream:['cream','creme','ecru','ivory','kremowy','kremowa','off white'],sand:['beige','beżowy','bezowy','beżowa','beige','sand','piaskowy'],tan:['camel','cognac','tan'],brown:['brown','braun','brązowy','brazowy','brun'],
 sage:['sage','szałwia','szalwia','salvie'],forest:['forest','dark green','butelkowa zielen','grun'],white:['white','białe','biały','bialy','hvid','weiss','weiß'],sky:['blue','blau','niebieski','niebieska','blå','sky'],navy:['navy','granat','marine'],rose:['rose','pink','różowy','rozowy','rosa','lyserod'],wine:['burgundy','bordowy','wine','burgunder'],charcoal:['charcoal','graphite','grafitowy'],black:['black','czarny','czarna','schwarz','sort'],grey:['grey','gray','szary','gris','grau','grå'],rust:['rust','rudy','ceglasty'],olive:['olive','oliwkowy'],lilac:['lilac','lawendowy','lavender'],violet:['violet','purple','fioletowy'],gold:['gold','złoty','zloty','mustard']
};
const roleWords={woman:['woman','women','womens','female','lady','ladies','damska','damski','damskie','kobieta','women’s','dame','kvinder','frauen','femme','mama','mother','maternity','girls woman'],man:['men','mens','man','male','męska','meska','męski','meski','herr','herren','homme','tata','father','dad'],child:['children','child','kids','kid','baby','infant','toddler','girl','girls','boy','boys','dziecko','dzieci','dziecięce','dzieciece','junior','børn','born','kinder','bebe','bébé','niemowle']};
const clothesWords=['shirt','tee','t-shirt','tshirt','sweatshirt','hoodie','dress','skirt','trouser','pants','jeans','shorts','blouse','blazer','jacket','jumper','sweater','romper','onesie','vest','polo','legging','bodysuit','suit','coat','cardigan','sukien','koszul','bluz','spodni','spódnic','spodnic','swetr','marynark','kurtk','kombinezon','spoden','spodn','piżam','pizam','tunika','ubran','odzie','kjole','bukser','bluse','hemd','kleid','hose','pullover'];
const paletteFor=color=>Object.keys(PALETTES).find(p=>PALETTES[p].colors.includes(color))||'sand';
const normalizeRole=s=>{const t=fold(s);if(['woman','man','child'].includes(t))return t;for(const [role,terms] of Object.entries(roleWords))if(matchWords(t,terms)||terms.some(w=>w.length>5&&t.includes(w)))return role;return null};
const normalizeColor=s=>{const t=fold(s);if(COLORS[t])return t;for(const [color,terms] of Object.entries(colorTerms))if(terms.some(w=>t.includes(fold(w))))return color;return null};
const normalizeStyle=s=>{const t=fold(s);if(['everyday','elegant','holiday','active'].includes(t))return t;if(/wedding|ceremon|formal|suit|blazer|dress|sukien|slub|wesele|elegant|communion/.test(t))return 'elegant';if(/linen|summer|beach|vacation|resort|bikini|swim|wakac|plazow|plażow/.test(t))return 'holiday';if(/sport|gym|running|active|training|jogger|fitness|legging/.test(t))return 'active';return 'everyday'};
function safeURL(raw,base=''){
 if(!raw)return '';
 try{const u=new URL(String(raw).trim(),base||undefined);if(u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||u.hostname.endsWith('.local'))return '';return u.toString()}catch{return ''}
}
function currencyPrice(value,currency='EUR',fx={}){
 const v=typeof value==='number'?value:Number(String(value||'').replace(/[^\d,.-]/g,'').replace(/,(?=\d{1,2}$)/,'.').replace(/,/g,''));
 if(!Number.isFinite(v)||v<=0)return null;
 const c=String(currency||'EUR').toUpperCase();if(c==='EUR')return Math.round(v*100)/100;
 const rate=Number(fx[c]);return Number.isFinite(rate)&&rate>0?Math.round(v*rate*100)/100:null;
}
function normalizeSizes(s){
 const raw=Array.isArray(s)?s.join('|'):String(s??'');
 const vals=raw.split(/[|;,/]/).map(s=>s.trim().toUpperCase().replace(/^SIZE\s+/,'')).filter(Boolean);
 const allowed=/^(?:XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|ONE SIZE|OS|UNI|UNIVERSAL|\d{1,3}(?:\/\d{1,3})?|\d{1,2}\s*(?:M|Y)|\d{2,3}\s*CM)$/;
 const uniq=[...new Set(vals.filter(x=>allowed.test(x)).map(x=>x==='OS'||x==='UNI'||x==='UNIVERSAL'?'ONE SIZE':x.replace(' ','').replace(/^2XL$/,'XXL')))];
 return uniq.join('|');
}
function isClothing(text,explicitCategory){if(explicitCategory&&/clothing|apparel|fashion|odzie|ubran|mode|bekleidung|tøj|toj|textil|dress|shirt|sweatshirt|sukien|bluz|koszul|pants|skirt/.test(fold(explicitCategory)))return true;return clothesWords.some(w=>fold(text).includes(w))}
const productKey=s=>String(s||'').replace(/[^a-z0-9-_:.]/gi,'_').slice(0,90);
/** Generic supplier entry -> validated internal product. Returns null + reason for unsupported rows. */
export function adaptRecord(row,{source='Partner feed',baseUrl='',fx={},format='generic',importedAt=new Date().toISOString(),permission='user-confirmed',defaultCurrency='EUR'}={}){
 if(!row||typeof row!=='object')return {error:'Niepoprawny rekord'};
 const name=clean(activeText(row,'name','title','product_name','productTitle','productname','item_title','merchant_product_name','g:title')).slice(0,120);
 const category=clean(activeText(row,'product_type','productType','category','categories','product_category','merchant_category','google_product_category','g:product_type','g:google_product_category'));
 if(!name)return {error:'Brak nazwy'};
 if(!isClothing(name+' '+category+' '+clean(row.description),category)&& !(row.role&&row.style&&row.color))return {error:'Poza kategorią odzieży'};
 const role=normalizeRole(activeText(row,'role','gender','age_group','g:gender','department')+' '+name+' '+category);
 if(!role)return {error:'Nieokreślone: dorosły/dziecko lub płeć'};
 const style=normalizeStyle(activeText(row,'style','occasion')+' '+name+' '+category);
 const color=normalizeColor(activeText(row,'color','colour','g:color','variant_color')+' '+name);
 if(!color)return {error:'Nieznany kolor (brak dopasowania do palety)'};
 const sizes=normalizeSizes(activeText(row,'sizes','size','g:size','variant_size'));
 if(!sizes)return {error:'Nieznany rozmiar: nie wolno zakładać dostępności wszystkich'};
 const currency=String(activeText(row,'currency','priceCurrency','currency_code','g:currency')||defaultCurrency);
 const price=currencyPrice(activeText(row,'price','sale_price','current_price','g:price','unit_price'),currency,fx);
 if(price===null)return {error:`Brak prawidłowej ceny EUR lub kursu ${currency}`};
 const sourceUrl=safeURL(activeText(row,'sourceUrl','url','link','product_url','product_link','deeplink','aw_deep_link','merchant_deep_link','merchant_product_url','g:link','permalink'),baseUrl);
 if(!sourceUrl)return {error:'Brak bezpiecznego adresu HTTPS produktu'};
 const imageUrl=safeURL(activeText(row,'imageUrl','image','image_link','g:image_link','thumbnail','merchant_image_url'),baseUrl);
 const id=productKey(activeText(row,'id','sku','product_id','merchant_product_id','aw_product_id','item_group_id','g:id')||`${sourceUrl}-${sizes}`);
 let rawStock=fold(activeText(row,'stock','availability','stock_status','in_stock','inStock','g:availability'));
 const stock=/^(true|yes|in stock|instock|available|in|1|onbackorder|backorder)$/.test(rawStock)?'in':/^(false|no|out of stock|outofstock|unavailable|out|0|sold out)$/.test(rawStock)?'out':'unknown';
 const shippingValue=activeText(row,'shipping','shipping_cost','delivery_cost','g:shipping');
 const shipping=shippingValue===''?null:Number(shippingValue);
 try{
 const product=validateProduct({id,sku:String(activeText(row,'sku','id')||id),name,role,style,color,palette:paletteFor(color),sizes,price,stock,shipping:Number.isFinite(shipping)&&shipping>=0?shipping:undefined,source,sourceUrl,imageUrl,description:clean(row.description||'').slice(0,240),currency:'EUR'});
 return {product:{...product,feedFormat:format,importedAt,permission,originalCurrency:currency.toUpperCase(),priceVerifiedAt:null,availabilityVerifiedAt:null},error:null};
 }catch(e){return {error:e.message}}
}

function csvRows(text){
 const first=(text.split(/\r?\n/,1)[0]||'');const delimiter=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
 const rows=[];let cur='',rec=[],quote=false;
 for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){cur+='"';i++}else quote=!quote;continue}if(c===delimiter&&!quote){rec.push(cur);cur='';continue}if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;rec.push(cur);if(rec.some(v=>v.trim()))rows.push(rec);cur='';rec=[];continue}cur+=c}
 if(quote)throw Error('Niezamknięty cudzysłów CSV');rec.push(cur);if(rec.some(v=>v.trim()))rows.push(rec);if(!rows.length)return [];
 const header=rows.shift().map(s=>s.trim().replace(/^\uFEFF/,''));if(header.length<2)throw Error('Brak kolumn w CSV');return rows.map(r=>Object.fromEntries(header.map((k,i)=>[k,r[i]||''])));
}
function xmlEntities(s){return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));}
function xmlTag(xml,tag){const escaped=tag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const match=xml.match(new RegExp(`<(?:(?:[a-z]+):)?${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-z]+:)?${escaped}>`,'i'));return match?clean(xmlEntities(match[1])):''}
function xmlRecords(text){
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('XML DTD i encje zewnętrzne są niedozwolone');
 const segments=[...text.matchAll(/<(?:item|entry|product)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry|product)>/gi)].slice(0,MAX_RECORDS);
 return segments.map(x=>{const s=x[1],r={};for(const t of ['title','name','description','link','id','sku','price','sale_price','image_link','image','size','color','gender','age_group','availability','product_type','google_product_category','brand','shipping'])r[t]=xmlTag(s,t);const price=r.sale_price||r.price;const m=price.match(/([\d.,]+)\s*([A-Z]{3})?/);if(m){r.price=m[1];r.currency=m[2]||'EUR'}return r});
}
function ldNodes(data){if(Array.isArray(data))return data.flatMap(ldNodes);if(!data||typeof data!=='object')return [];const nodes=[...(Array.isArray(data['@graph'])?data['@graph'].flatMap(ldNodes):[])];const type=data['@type'];if((Array.isArray(type)?type:[type]).some(t=>String(t||'').split('/').pop()==='Product'))nodes.push(data);return nodes}
function ldRecords(text){const fragments=[...text.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];const nodes=fragments.flatMap(x=>{try{return ldNodes(JSON.parse(x[1]))}catch{return []}});return nodes.map(x=>{const offer=Array.isArray(x.offers)?x.offers[0]:x.offers||{};return {id:x.sku||x.productID||x['@id'],name:x.name,description:x.description,price:offer.price||offer.lowPrice,currency:offer.priceCurrency,availability:String(offer.availability||'').split('/').pop().replace('InStock','in').replace('OutOfStock','out'),link:offer.url||x.url,image:Array.isArray(x.image)?x.image[0]:typeof x.image==='object'?x.image.url:x.image,category:x.category,color:x.color,size:x.size,gender:x.gender,age_group:x.audience?.suggestedGender}})}
function fromWoo(data,context){
 return data.flatMap(p=>{
  const products=[];const attrs=p.attributes||[];const sizeAttr=attrs.find(a=>/size|rozmiar|gr.osse|größe/i.test(a.name||a.taxonomy||''));const colorAttr=attrs.find(a=>/colou?r|kolor|farbe/i.test(a.name||a.taxonomy||''));
  const sizes=(sizeAttr?.terms||[]).map(t=>t.name||t.slug||'');const colors=(colorAttr?.terms||[]).map(t=>t.name||'');
  const minor=Number(p.prices?.currency_minor_unit??2);
  const value=Number(p.prices?.price)/Math.pow(10,minor);
  const variants=Array.isArray(p.variations)&&p.variations.some(v=>typeof v==='object')?p.variations:[];
  // Woo variable products without size-specific variation data cannot claim a purchasable size.
  if(p.type==='variable'&&!variants.length)return [];
  const standard={name:p.name,description:p.short_description||p.description,price:value,currency:p.prices?.currency_code||'EUR',link:p.permalink,image:p.images?.[0]?.src,category:p.categories?.map(x=>x.name).join(' '),age_group:p.attributes?.map(a=>a.name).join(' '),availability:p.is_in_stock?'in':'out'};
  if(variants.length){for(const v of variants){const va=v.attributes||[];products.push({...standard,id:v.id||p.id,sku:v.sku||p.sku,size:va.find(a=>/size|rozmiar/i.test(a.name))?.value||'',color:va.find(a=>/color|colour|kolor/i.test(a.name))?.value||colors[0]||'',price:Number(v.prices?.price)/Math.pow(10,Number(v.prices?.currency_minor_unit??2))||value,link:(p.permalink||'')+(p.permalink?.includes('?')?'&':'?')+'variation_id='+v.id,availability:v.is_in_stock?'in':'out'})}return products}
  if(sizes.length===1)return [{...standard,id:p.id,sku:p.sku,size:sizes[0],color:colors[0]||''}];
  // Multiple size options without variant-level stock: show none as verified size.
  if(sizes.length>1)return sizes.map(sz=>({...standard,id:`${p.id}-${sz}`,sku:p.sku,size:sz,color:colors[0]||'',availability:'unknown'}));
  return [{...standard,id:p.id,sku:p.sku,size:'',color:colors[0]||''}];
 });
}
function fromShopify(data,context){
 return data.flatMap(p=>{
 const out=[];const options=p.options||[];const sizeIndex=options.findIndex(o=>/size|rozmiar|große/i.test(typeof o==='string'?o:o.name));const colorIndex=options.findIndex(o=>/colou?r|kolor|farbe/i.test(typeof o==='string'?o:o.name));
 const variants=Array.isArray(p.variants)?p.variants:[];
 for(const v of variants){const choices=[v.option1,v.option2,v.option3];const size=sizeIndex>=0?choices[sizeIndex]:v.size||'';const color=colorIndex>=0?choices[colorIndex]:v.color||'';out.push({id:`${p.id}-${v.id}`,sku:v.sku||v.id,name:p.title,description:p.body_html,price:v.price,currency:context.defaultCurrency||'EUR',link:`${context.baseUrl.replace(/\/$/,'')}/products/${p.handle}?variant=${v.id}`,image:v.featured_image?.src||p.image?.src||p.images?.[0]?.src,category:p.product_type||p.tags,gender:p.tags,size,color,availability:v.available?'in':'out'})}
 return out;
 })
}
export function parsePartnerFeed(text,{format='auto',source='Partner catalogue',baseUrl='',fx={},defaultCurrency='EUR',permission='user-confirmed'}={}){
 if(typeof text!=='string'||text.length>16*1024*1024)throw Error('Plik musi być tekstowy i mieć maksymalnie 16 MB');
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('XML DTD i encje zewnętrzne są niedozwolone');
 let mode=format;if(mode==='auto'){const start=text.trimStart();mode=/^<\?xml|^<rss|^<feed/i.test(start)?'xml':/^<(!doctype|html)/i.test(start)?'jsonld':/^[\[{]/.test(start)?'json':/^\{.*\}\s*\n\s*\{/s.test(start)?'jsonl':'csv'}
 let records=[];
 if(mode==='csv')records=csvRows(text);
 else if(mode==='xml')records=xmlRecords(text);
 else if(mode==='jsonld')records=ldRecords(text);
 else if(mode==='jsonl')records=text.split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x));
 else if(mode==='json'){
  let data;try{data=JSON.parse(text)}catch{ // JSONL starting with curly brace
   records=text.split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x));mode='jsonl';
  }
  if(data!==undefined){if(Array.isArray(data)){records=data.some(p=>p?.prices&&p?.images)?fromWoo(data,{baseUrl,defaultCurrency}):data;}else if(Array.isArray(data.products)&&data.products.some(p=>p.variants)) {mode='shopify';records=fromShopify(data.products,{baseUrl,defaultCurrency})}
  else if(Array.isArray(data.products)&&data.products.some(p=>p.prices)){mode='woocommerce';records=fromWoo(data.products,{baseUrl,defaultCurrency})}
  else if(Array.isArray(data.products))records=data.products;
  else if(Array.isArray(data.items))records=data.items;
  else if(data['@type']||data['@graph']){mode='jsonld';records=ldNodes(data).map(x=>({name:x.name,description:x.description,price:x.offers?.price,currency:x.offers?.priceCurrency,link:x.offers?.url||x.url,image:x.image,category:x.category,color:x.color,size:x.size,gender:x.gender}))}
  else throw Error('JSON nie zawiera listy produktów.')}}
 else if(mode==='shopify'){const data=JSON.parse(text);records=fromShopify(data.products||[],{baseUrl,defaultCurrency})}
 else if(mode==='woocommerce'){const data=JSON.parse(text);records=fromWoo(Array.isArray(data)?data:data.products||[],{baseUrl,defaultCurrency})}
 else throw Error('Nieobsługiwany format: '+mode);
 if(!Array.isArray(records))throw Error('Nie znaleziono listy produktów');
 if(records.length>MAX_RECORDS)throw Error(`Przekroczony limit ${MAX_RECORDS} produktów na plik`);
 const report={total:records.length,accepted:0,rejected:0,reasons:{},format:mode,source,importedAt:new Date().toISOString(),warning:'Dane pochodzą z importu, nie są weryfikowane w czasie rzeczywistym.'};
 const products=[];const seen=new Set();
 for(const row of records){const {product,error}=adaptRecord(row,{source,baseUrl,fx,format:mode,importedAt:report.importedAt,permission,defaultCurrency});if(error){report.rejected++;report.reasons[error]=(report.reasons[error]||0)+1;continue}const signature=[product.sourceUrl,product.size,product.color,product.sku].join('|');if(seen.has(signature)){report.rejected++;report.reasons['Duplikat wariantu']=(report.reasons['Duplikat wariantu']||0)+1;continue}seen.add(signature);products.push(product);report.accepted++}
 return {products,report};
}
export function mergeCatalog(old,additional,max=5000){
 const merged=new Map();for(const p of old||[])merged.set([p.sourceUrl,p.size,p.color,p.sku||''].join('|'),p);
 for(const p of additional||[])merged.set([p.sourceUrl,p.size,p.color,p.sku||''].join('|'),p);
 const arr=[...merged.values()];if(arr.length>max)throw Error(`Przekroczono pojemność lokalnej biblioteki ${max} produktów. Usuń starsze dane lub zastosuj krótszy feed.`);return arr;
}
export function freshness(product,now=Date.now()){
 if(product.status==='demo')return 'demo';const raw=Date.parse(product.importedAt||'');if(!Number.isFinite(raw))return 'unknown';const h=(now-raw)/3600000;return h<=24?'imported-today':h<=168?'older-than-day':'stale-week';
}
export function stats(products){const stores=new Set(products.map(p=>p.source).filter(Boolean));const current=products.filter(p=>freshness(p)==='imported-today').length;const links=products.filter(p=>p.sourceUrl).length;return {products:products.length,stores:stores.size,importedToday:current,links,roles:Object.fromEntries(['woman','man','child'].map(r=>[r,products.filter(p=>p.role===r).length]))}}
/** Browser-only remote access. Requires HTTPS and merchant CORS; no proxy, no credential bypass. */
export async function fetchPermittedFeed(url,{signal,timeout=12000}={}){
 const target=safeURL(url);if(!target||target!==url.trim())throw Error('Podaj pełny publiczny HTTPS URL feedu. Bez adresów lokalnych i danych logowania.');
 const controller=new AbortController();const tid=setTimeout(()=>controller.abort(),Math.min(timeout,20000));if(signal)signal.addEventListener('abort',()=>controller.abort(),{once:true});
 try{const r=await fetch(target,{mode:'cors',credentials:'omit',redirect:'error',signal:controller.signal,headers:{Accept:'application/json,text/csv,application/xml,text/xml,application/feed+json,text/plain'}});if(!r.ok)throw Error(`Źródło zwróciło HTTP ${r.status}`);const length=Number(r.headers.get('content-length')||'0');if(length>16*1024*1024)throw Error('Zbyt duży feed (>16MB)');const text=await r.text();if(text.length>16*1024*1024)throw Error('Zbyt duży feed');return text}
 catch(err){if(err.name==='TypeError')throw Error('Przeglądarka zablokowała dostęp (CORS lub sieć). Pobierz autoryzowany feed jako plik i zaimportuj go lokalnie.');throw err}
 finally{clearTimeout(tid)}
}