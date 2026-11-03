import raw from './catalog.generated.json' with {type:'json'};
import type {Template,MeasureKey} from './types';
export const templates=raw.templates as Template[];
export const palettes=raw.palettes;
export const measures=raw.measures as Array<{key:MeasureKey;label:string;tip:string;limits:number[]}>;
export const printZones=raw.printZones;
export const fabrics:Record<string,string>=raw.fabrics;
