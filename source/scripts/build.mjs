import {mkdir,rm,cp,copyFile,writeFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'dist');
if(path.basename(root)!=='FitMyStyle_Studio_8')throw Error('Safety guard: only build from the dedicated FitMyStyle directory.');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});await mkdir(path.join(output,'src'));await mkdir(path.join(output,'data'));await mkdir(path.join(output,'media'));
const rootFiles=['index.html','icon.svg','brand-hanger.svg','manifest.webmanifest','service-worker.js','hero-family.webp','site-config.mjs'];
for(const file of rootFiles)await copyFile(path.join(root,file),path.join(output,file));
const sources=await readdir(path.join(root,'src'));
for(const file of sources){if(!/^[a-z\-]+\.(?:mjs|css)$/.test(file))throw Error('Unexpected source file: '+file);await copyFile(path.join(root,'src',file),path.join(output,'src',file))}
for(const file of await readdir(path.join(root,'media'))){if(!/^((feature|look)-[1-9]\.webp)$/.test(file))throw Error('Unexpected media '+file);await copyFile(path.join(root,'media',file),path.join(output,'media',file));}
await copyFile(path.join(root,'data','catalog-public.json'),path.join(output,'data','catalog-public.json'));
await copyFile(path.join(root,'data','catalog-status.json'),path.join(output,'data','catalog-status.json'));
await writeFile(path.join(output,'robots.txt'),'User-agent: *\nDisallow: /\n');
console.log(`Built isolated FitMyStyle static site: ${output}, ${rootFiles.length+sources.length+1} public assets. No environment variables, credentials or third-party projects.`);