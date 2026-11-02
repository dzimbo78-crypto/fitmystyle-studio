import fs from 'node:fs';import {garmentSVG} from '../site/graphics.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../site/catalog.json',import.meta.url)));
const out=new URL('../site/assets/',import.meta.url);
for(const t of catalog.templates){const type=t.sizes.adultF?'adultF':t.sizes.adultM?'adultM':t.sizes.child?'child':'baby';const file=new URL(`fms-${t.id}.svg`,out);fs.writeFileSync(file,garmentSVG(t,{color:t.colors[0],skin:'#d8ae8b',type,pattern:t.material==='cable-knit'?'cable':t.material==='rib-knit'?'rib':'solid'}));}
console.log('Exported',catalog.templates.length,'editable garment SVG mockups');