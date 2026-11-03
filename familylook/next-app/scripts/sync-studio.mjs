import {cp,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {TEMPLATES,PALETTES,MEASURES,PRINT_ZONES,FABRICS} from '../../site/domain.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'public/studio'),{recursive:true});
for(const file of ['domain.mjs','scene-model.mjs','scene-materials.mjs','scene-mannequin.mjs','scene-webgl.mjs','scene-canvas.mjs','family-scene.mjs','family-scene.css','photo-studio.mjs','photo-studio.css','photo-engine.mjs','photo-catalog.mjs','photo-core.mjs','photo-patterns.mjs','design-layer.mjs','assets/photo-v4','shopping-studio.mjs','shopping-studio.css','shopping-core.mjs','shopping-stores.mjs','data/retail-catalog.json','data/exchange-rates.json','vendor'])await cp(resolve(root,'../site',file),resolve(root,'public/studio',file),{recursive:true});
await writeFile(resolve(root,'lib/catalog.generated.json'),JSON.stringify({templates:TEMPLATES,palettes:PALETTES,measures:MEASURES,printZones:PRINT_ZONES,fabrics:FABRICS},null,2)+'\n');

await mkdir(resolve(root,'lib/runtime'),{recursive:true});
for(const file of ['shopping-core.mjs','domain.mjs'])await cp(resolve(root,'../site',file),resolve(root,'lib/runtime',file));
await cp(resolve(root,'../site/data/retail-catalog.json'),resolve(root,'lib/retail-catalog.generated.json'));
