import catalog from '../catalog.json';
export type Group='adult'|'child'|'infant';
export type BodyType='woman'|'man'|'other'|'unspecified';
export type MeasurementId='height'|'chest'|'waist'|'hip'|'neck'|'shoulder'|'arm'|'torso'|'bicep'|'wrist'|'inseam'|'outseam'|'head';
export type Measurements=Partial<Record<MeasurementId,number>>;
export interface Artwork{text:string;color:string;position:'chest'|'back';scale:number}
export interface FamilyMember{id:string;label:string;group:Group;bodyType:BodyType;size:string;model:string;color:string;fit:'slim'|'regular'|'relaxed'|'oversize';easeOffset:number;measurements:Measurements;artwork:Artwork}
export interface FamilyProject{id?:string;name:string;palette:string;people:FamilyMember[];seamAllowanceMm:number;shrinkagePercent:number;notes:string}
export interface GarmentModel{id:string;name:string;type:string;groups:Group[];required:MeasurementId[];ease:Partial<Record<MeasurementId,number>>;material:string;complexity:string}
export interface MeasurementSpec{id:MeasurementId;name:string;instruction:string;location:string;all:boolean;range:[number,number]}
export const models=catalog.models as GarmentModel[];
export const measurements=catalog.measurements as MeasurementSpec[];
export const palettes=catalog.palettes as Record<string,{name:string;colors:string[]}>;
export const newMember=(group:Group='adult',number=1):FamilyMember=>({id:crypto.randomUUID(),label:`Osoba ${number}`,group,bodyType:'unspecified',size:group==='adult'?'M':group==='child'?'110':'68',model:group==='infant'?'baby-body':'crewneck',color:'#91A18B',fit:'regular',easeOffset:0,measurements:{},artwork:{text:'',color:'#fff',position:'chest',scale:1}});
export const initialProject=():FamilyProject=>({name:'Kolekcja rodzinna',palette:'sage',people:[newMember('adult',1),newMember('adult',2),newMember('child',3)],seamAllowanceMm:10,shrinkagePercent:0,notes:''});
export function verify(person:FamilyMember){const m=models.find(x=>x.id===person.model);if(!m||!m.groups.includes(person.group))return {missing:[],errors:['Niezgodny model i grupa']};return {missing:m.required.filter(id=>!person.measurements[id]),errors:Object.entries(person.measurements).filter(([key,v])=>{const field=measurements.find(x=>x.id===key);return !!(field&&v&&(v<field.range[0]||v>field.range[1]))}).map(([key])=>'Nietypowy pomiar: '+key)}}
export function finished(person:FamilyMember){const m=models.find(x=>x.id===person.model);if(!m)return [];return Object.entries(m.ease).map(([key,ease])=>{const v=person.measurements[key as MeasurementId]??null;const add=(ease??0)+person.easeOffset;return {id:key as MeasurementId,body:v,ease:add,garment:v===null?null:Number((v+add).toFixed(1))}})}