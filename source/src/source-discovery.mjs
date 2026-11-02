/** FitMyStyle Catalog Radar — conservative public-source discovery.
 * This module never bypasses authentication, robots rules, paywalls, CAPTCHAs,
 * rate limits, or merchant terms. Publication requires an explicit license.
 */
const BLOCKED_HOST=/(^|\.)(localhost|local|internal|test|invalid)$/i;
const PRIVATE_IPV4=/^(?:0|10|127|169\.254|192\.168|172\.(?:1[6-9]|2\d|3[01])|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])|198\.(?:1[89])|224|240)\./;
export function publicHttpsURL(value){
 let u;try{u=new URL(String(value||'').trim())}catch{throw Error('Podaj poprawny adres HTTPS sklepu')}
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||!u.hostname.includes('.')||BLOCKED_HOST.test(u.hostname)||u.hostname==='169.254.169.254'||/^[\d.]+$/.test(u.hostname)||u.hostname.includes(':')||PRIVATE_IPV4.test(u.hostname))throw Error('Dozwolone są wyłącznie publiczne domeny HTTPS, bez loginu i haseł');
 if([...u.searchParams.keys()].some(x=>/(?:token|secret|api[_-]?key|auth|password|access[_-]?key|signature)/i.test(x)))throw Error('Nie umieszczaj tokenów i kluczy w publicznym adresie URL');
 u.hash='';return u;
}
export function suggestedSources(url){
 const site=publicHttpsURL(url);const root=site.origin;return [
  {id:'woo',name:'WooCommerce Store API',url:root+'/wp-json/wc/store/v1/products?per_page=50&page=1',format:'woocommerce',kind:'woo',availability:'Do sprawdzenia',note:'Publiczne produkty. Odczyt i ponowne wykorzystanie wyłącznie z poszanowaniem zasad sklepu.'},
  {id:'shopify',name:'Shopify JSON',url:root+'/products.json?limit=50&page=1',format:'shopify',kind:'shopify',availability:'Do sprawdzenia',note:'Nie wszystkie sklepy udostępniają endpoint. Weryfikuj zgodę na wykorzystanie.'},
  {id:'structured',name:'Schema.org Product na stronie',url:site.toString(),format:'jsonld',kind:'page',availability:'Do sprawdzenia',note:'Dotyczy wskazanej publicznej strony produktu; nie jest pełnym katalogiem.'},
  {id:'partner',name:'Feed od dostawcy',url:'',format:'auto',kind:'supplier',availability:'Wymagana współpraca',note:'CSV, XML, JSON lub RSS udostępnione przez partnera — najlepsza jakość i prawa do danych.'}
 ];
}
function globRule(rule){const end=rule.endsWith('$');const body=end?rule.slice(0,-1):rule;return new RegExp('^'+body.split('*').map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+(end?'$':''));}
export function parseRobots(text){
 const groups=[];const sitemaps=[];let group=null;let previousDirective='';
 for(const original of String(text||'').split(/\r?\n/)){
  const line=original.replace(/#.*$/,'').trim();if(!line)continue;
  const sep=line.indexOf(':');if(sep<0)continue;const key=line.slice(0,sep).trim().toLowerCase(),value=line.slice(sep+1).trim();
  if(key==='sitemap'){if(value.startsWith('https://'))sitemaps.push(value);continue}
  if(key==='user-agent'){
   if(!group||previousDirective!=='user-agent'){group={agents:[],rules:[],crawlDelay:0};groups.push(group)}
   group.agents.push(value.toLowerCase());previousDirective='user-agent';continue;
  }
  if(!group)continue;previousDirective=key;
  if((key==='allow'||key==='disallow')&&value)group.rules.push({allow:key==='allow',path:value});
  if(key==='crawl-delay'){const n=Number(value);if(Number.isFinite(n)&&n>0)group.crawlDelay=Math.min(120,n)}
 }
 return {groups,sitemaps};
}
export function robotsDecision(robots,url,userAgent='FitMyStyleCatalogBot'){
 const parsed=typeof robots==='string'?parseRobots(robots):robots;
 const pathname=(typeof url==='string'?new URL(url):url).pathname+(typeof url==='string'?new URL(url):url).search;
 const agent=userAgent.toLowerCase();const matching=(parsed.groups||[]).map(g=>({g,score:Math.max(...g.agents.filter(a=>a==='*'||agent.includes(a)).map(a=>a==='*'?0:a.length),-1)})).filter(x=>x.score>=0);
 if(!matching.length)return {allowed:true,reason:'No matching robots group',crawlDelay:0};
 const max=Math.max(...matching.map(x=>x.score));const groups=matching.filter(x=>x.score===max).map(x=>x.g);
 const rules=groups.flatMap(g=>g.rules).filter(r=>globRule(r.path).test(pathname));
 rules.sort((a,b)=>b.path.replace(/[*$]/g,'').length-a.path.replace(/[*$]/g,'').length||(a.allow?-1:1));
 return {allowed:!rules.length||rules[0].allow,reason:rules.length?(rules[0].allow?'Explicit allow: ':'Disallow: ')+rules[0].path:'Not restricted by robots',crawlDelay:Math.max(0,...groups.map(g=>g.crawlDelay||0))};
}
export function catalogReadiness(products){
 const list=Array.isArray(products)?products:[];
 const counts={woman:0,man:0,child:0};let inStock=0,images=0,links=0,sku=0,stale=0,unknownStock=0;
 for(const p of list){if(p.role in counts)counts[p.role]++;if(p.stock==='in')inStock++;if(p.stock==='unknown')unknownStock++;if(p.imageUrl)images++;if(p.sourceUrl)links++;if(p.sku)sku++;if(!Number.isFinite(Date.parse(p.importedAt||''))||Date.now()-Date.parse(p.importedAt)>7*86400000)stale++}
 const ready=list.filter(p=>p.stock==='in'&&p.imageUrl&&p.sku&&p.sourceUrl).length;
 return {total:list.length,counts,inStock,images,links,sku,stale,unknownStock,ready,coverage:Math.round(ready/(list.length||1)*100),familyReady:counts.woman>0&&counts.man>0&&counts.child>0};
}
export function approvalRequest({name,website,contact=''}={}){
 const label=String(name||'Partner').replace(/[\r\n]/g,' ').slice(0,80);const site=publicHttpsURL(website).origin;
 return `Dzień dobry,\n\nTworzymy FitMyStyle — platformę do dobierania dopasowanych stylizacji dla rodzin i kierowania kupujących do sklepów partnerskich. Chcielibyśmy nawiązać współpracę z ${label} (${site}).\n\nCzy mogą Państwo udostępnić feed produktowy (CSV/XML/JSON), Store API lub katalog afiliacyjny i potwierdzić prawo do wykorzystania: nazw, wariantów rozmiarów, kolorów, zdjęć, cen, informacji o dostępności oraz linków do produktów?\n\nZależy nam też na informacji o częstotliwości aktualizacji, kraju dostawy, kosztach wysyłki, zasadach prowizji/dropshippingu i sposobie kierowania zamówień. Nie będziemy publikować produktów przed uzyskaniem zgody.\n\nDziękujemy i pozdrawiamy.${contact?'\n'+contact:''}`;
}
export function sourceConfiguration({name,feedUrl,format='auto',licenseReference,currency='EUR',maxPages=1,kind='feed'}={}){
 if(!String(licenseReference||'').trim())throw Error('Potrzebny numer zgody lub umowy dostawcy');
 const url=publicHttpsURL(feedUrl).toString();if(!['feed','woo','shopify','page'].includes(kind))throw Error('Nieobsługiwany typ źródła');
 if(!['auto','csv','xml','json','jsonl','jsonld','woocommerce','shopify'].includes(format))throw Error('Nieobsługiwany format');
 return {name:String(name||new URL(url).hostname).slice(0,80),url,kind,format,currency:String(currency).toUpperCase(),permission:true,licenseReference:String(licenseReference).trim().slice(0,100),maxPages:Math.max(1,Math.min(10,Math.floor(Number(maxPages)||1)))};
}