import {cp,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {TEMPLATES,PALETTES,MEASURES,PRINT_ZONES,FABRICS} from '../../site/domain.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'public/studio'),{recursive:true});
for(const file of ['domain.mjs','scene-model.mjs','scene-materials.mjs','scene-mannequin.mjs','scene-webgl.mjs','scene-canvas.mjs','family-scene.mjs','family-scene.css','vendor'])await cp(resolve(root,'../site',file),resolve(root,'public/studio',file),{recursive:true});
await writeFile(resolve(root,'lib/catalog.generated.json'),JSON.stringify({templates:TEMPLATES,palettes:PALETTES,measures:MEASURES,printZones:PRINT_ZONES,fabrics:FABRICS},null,2)+'\n');
