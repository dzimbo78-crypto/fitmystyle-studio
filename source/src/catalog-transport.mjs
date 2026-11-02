/** Node-only, bounded vendor transport for authorized external catalog sources.
 * Never used as a public HTTP proxy.  No redirects, cookies, auth, evasion or IP hosts.
 */
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {publicHttpsURL,robotsDecision} from './source-discovery.mjs';
const MAX_BYTES=16*1024*1024;
function blockedIPv4(addr){const a=addr.split('.').map(Number);return a[0]===0||a[0]===10||a[0]===127||a[0]===169&&a[1]===254||a[0]===192&&a[1]===168||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]>=224||a[0]===198&&(a[1]===18||a[1]===19)||a[0]===192&&a[1]===0&&a[2]===0;}
export function isPublicIP(ip){if(!isIP(ip))return false; if(isIP(ip)===4)return !blockedIPv4(ip);const s=ip.toLowerCase();return !(s==='::'||s==='::1'||s.startsWith('fe80:')||s.startsWith('fc')||s.startsWith('fd')||s.startsWith('ff')||s.startsWith('2001:db8:')||s.startsWith('::ffff:')||s.startsWith('2001:10:'));}
export async function validateDestination(raw,{resolver=lookup}={}){
 const url=publicHttpsURL(raw);const answers=await resolver(url.hostname,{all:true});if(!Array.isArray(answers)||!answers.length||answers.some(v=>!isPublicIP(v.address)))throw Error('Domena nie rozwiązuje się wyłącznie na publiczne adresy IP');return url;
}
async function boundedText(response){
 const len=Number(response.headers.get('content-length')||0);if(len>MAX_BYTES)throw Error('Katalog przekracza 16 MB');
 const reader=response.body?.getReader();if(!reader){const txt=await response.text();if(Buffer.byteLength(txt)>MAX_BYTES)throw Error('Katalog przekracza 16 MB');return txt}
 let total=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BYTES)throw Error('Katalog przekracza 16 MB');chunks.push(value)}}finally{reader.releaseLock()}
 return Buffer.concat(chunks.map(x=>Buffer.from(x))).toString('utf8');
}
export async function safeGet(url,{fetcher=fetch,resolver=lookup,timeoutMs=14000}={}){
 const target=await validateDestination(url,{resolver});const res=await fetcher(target,{method:'GET',redirect:'error',credentials:'omit',signal:AbortSignal.timeout(Math.min(20000,Math.max(1000,timeoutMs))),headers:{'User-Agent':'FitMyStyleCatalogRadar/5.0 (authorized source; contact merchant)',Accept:'application/json,application/xml,text/xml,text/csv,text/html,text/plain'}});
 if(res.status===401||res.status===403||res.status===429)throw Error(`Źródło odmawia dostępu (HTTP ${res.status}); nie ponawiamy ani nie obchodzimy blokady`);
 if(!res.ok)return {status:res.status,contentType:res.headers.get('content-type')||'',text:'',url:target.toString()};
 const type=res.headers.get('content-type')||'';if(!/json|xml|csv|html|plain|rss|text|octet-stream/i.test(type))throw Error('Nieobsługiwany format MIME');
 return {status:res.status,contentType:type,text:await boundedText(res),url:target.toString()};
}
export function sameVendorOrigin(source,link){const a=publicHttpsURL(source),b=publicHttpsURL(link);if(a.origin!==b.origin)throw Error('Zabroniony odczyt innej domeny niż domena zatwierdzonego źródła');return true}
export async function getRobots(site,{fetcher=fetch,resolver=lookup}={}){
 const origin=publicHttpsURL(site).origin;let response;
 try{response=await safeGet(origin+'/robots.txt',{fetcher,resolver,timeoutMs:8000})}catch(e){return {allowed:false,raw:'',status:'error',reason:'Nie można sprawdzić robots.txt: '+e.message}}
 if(response.status===404||response.status===410)return {allowed:true,raw:'',status:'missing',reason:'Brak robots.txt (404)'};
 if(response.status!==200)return {allowed:false,raw:'',status:response.status,reason:`robots.txt HTTP ${response.status}`};
 return {allowed:true,raw:response.text,status:200,reason:'robots.txt odczytany'};
}
export async function licensedFetch(source,target,{fetcher=fetch,resolver=lookup,robots}={}){
 if(source.permission!==true||!String(source.licenseReference||'').trim())throw Error('Brak udokumentowanej zgody na pobieranie i ponowną publikację produktów');
 sameVendorOrigin(source.url,target);
 const rules=robots||await getRobots(source.url,{fetcher,resolver});if(!rules.allowed)throw Error(rules.reason);
 const decision=robotsDecision(rules.raw,target);
 if(!decision.allowed)throw Error('robots.txt blokuje źródło: '+decision.reason);
 return {response:await safeGet(target,{fetcher,resolver}),delaySeconds:decision.crawlDelay};
}