/** Catalog Radar CLI: conservative diagnostics and, only with a license, preview.
 * Usage: node scripts/catalog-radar.mjs --site https://shop.example --name Shop
 *        node scripts/catalog-radar.mjs --site ... --name ... --license-reference CONTRACT-2026 --check
 */
import {writeFile} from 'node:fs/promises';
import {suggestedSources,publicHttpsURL} from '../src/source-discovery.mjs';
import {getRobots,licensedFetch} from '../src/catalog-transport.mjs';
import {parsePartnerFeed} from '../src/catalog-connectors.mjs';
const arg=process.argv.slice(2),get=k=>{const i=arg.indexOf(k);return i<0?'':arg[i+1]||''};
const site=get('--site');if(!site){console.log('Użycie: node scripts/catalog-radar.mjs --site https://sklep.example [--name Sklep] [--license-reference UMOWA] [--check] [--output ścieżka.json]');process.exit(0)}
let candidates;try{candidates=suggestedSources(site)}catch(e){console.error(e.message);process.exit(2)}
const report={timestamp:new Date().toISOString(),site:publicHttpsURL(site).origin,permissionReference:get('--license-reference')||null,checks:[],candidates:candidates.map(c=>({name:c.name,url:c.url,format:c.format,automatic:false}))};
if(arg.includes('--check')){
 if(!get('--license-reference')){console.error('Odczyt wymaga zgody dostawcy: --license-reference. Bez niej generuję tylko propozycje źródeł.');process.exitCode=2}
 else {
  const robots=await getRobots(site);report.robots={status:robots.status,allowed:robots.allowed,reason:robots.reason};
  if(robots.allowed){for(const candidate of candidates.filter(c=>c.id==='woo'||c.id==='shopify'||c.id==='structured')){
   // At most three small read requests, no crawling, no auto-following blocked links.
   const source={url:report.site,permission:true,licenseReference:get('--license-reference')};
   const item={kind:candidate.id,endpoint:candidate.url};
   try{const {response}=await licensedFetch(source,candidate.url,{robots});item.http=response.status;item.contentType=response.contentType;if(response.status===200){const parsed=parsePartnerFeed(response.text,{source:get('--name')||new URL(site).hostname,baseUrl:report.site,format:candidate.format});item.recordsAccepted=parsed.report.accepted;item.recordsRejected=parsed.report.rejected;item.sampleNames=parsed.products.slice(0,2).map(p=>p.name)}}catch(e){item.error=e.message}
   report.checks.push(item);await new Promise(resolve=>setTimeout(resolve,1000));
  }}
 }
}
const output=get('--output');if(output){if(!/\.json$/i.test(output))throw Error('Raport musi mieć rozszerzenie .json');await writeFile(output,JSON.stringify(report,null,2))}
console.log(JSON.stringify(report,null,2));