/** Independent FitMyStyle snapshot. Stops without changing published data on error. */
import {readFile,writeFile,rename,unlink} from 'node:fs/promises';import {resolve,dirname,basename} from 'node:path';import {fileURLToPath} from 'node:url';
import {syncAllSuppliers} from '../src/catalog-sync.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');if(!['source','fitmystyle-standalone'].includes(basename(root)))throw Error('Isolation guard: not FitMyStyle Studio');
let manifest;try{manifest=JSON.parse(await readFile(resolve(root,'data/licensed-feeds.json'),'utf8'))}catch(e){if(e.code==='ENOENT'){console.log('Brak zatwierdzonych źródeł. Pozostawiam dotychczasowy katalog bez zmian.');process.exit(0)}throw e}
if(!manifest.sources?.length){console.log('Brak zatwierdzonych źródeł. Pozostawiam dotychczasowy katalog bez zmian.');process.exit(0)}
const {products,suppliers}=await syncAllSuppliers(manifest);
const published=resolve(root,'data/catalog-public.json'),audit=resolve(root,'data/catalog-status.json');
const stamp=String(process.pid);const file=published+'.'+stamp+'.tmp',tmpAudit=audit+'.'+stamp+'.tmp';
try{
 await writeFile(file,JSON.stringify(products,null,2)+'\n',{flag:'wx'});
 await writeFile(tmpAudit,JSON.stringify({lastSuccessfulSync:new Date().toISOString(),total:products.length,suppliers},null,2)+'\n',{flag:'wx'});
 await rename(file,published);await rename(tmpAudit,audit);
}catch(e){await Promise.allSettled([unlink(file),unlink(tmpAudit)]);throw e}
console.log(JSON.stringify({published:products.length,suppliers:suppliers.map(x=>({name:x.name,accepted:x.accepted,requests:x.requests}))},null,2));