/** Internal preparation only. This module contains no order or payment API call. */
import type {FamilyLookConfig,PrintSpec} from './types';
import {printSpec} from './domain.ts';
import {palettes} from './catalog.ts';
export type PrintAsset={assetUrl:string;mimeType:'image/png'|'image/jpeg'|'image/svg+xml'|'application/pdf';widthPx:number;heightPx:number;verified:boolean};
export type Provider='gelato'|'printify';
export type VariantMapping={provider:Provider;templateId:string;size:string;color:string;placement:'front'|'back';productId:string;variantId:string;printAreaMm:{width:number;height:number};verified:boolean};
export type FulfillmentDraft={id:string;provider:Provider;status:'review-needed';noDispatch:true;items:{memberId:string;templateId:string;size:string;color:string;productId:string|null;variantId:string|null;print:PrintSpec;asset:PrintAsset|null;warnings:string[]}[]};
export function buildFulfillmentDraft(config:FamilyLookConfig,assets:Record<string,PrintAsset>,provider:Provider,mappings:VariantMapping[]=[]):FulfillmentDraft{
 const items=config.members.map((member,index)=>{const color=member.preview?.color||(palettes.find(p=>p.id===config.paletteId)||palettes[0]).colors[index%3],size=member.size||'',print=printSpec(member,config.artwork);const mapping=mappings.find(m=>m.verified&&m.provider===provider&&m.templateId===member.templateId&&m.size===size&&m.color.toLowerCase()===color.toLowerCase()&&m.placement===print.placement),asset=assets[member.id]||null,warnings:string[]=[];
 if(!mapping)warnings.push('Brak zatwierdzonego wariantu dostawcy dla fasonu, rozmiaru, koloru i strony nadruku.');
 if(!size)warnings.push('Brak wybranego rozmiaru produktu.');
 if(!asset?.verified)warnings.push('Nadruk niezatwierdzony przez administratora.');
 if(asset&&!/^https:\/\//.test(asset.assetUrl))warnings.push('Dostawca wymaga dostępnego pliku HTTPS.');
 if(asset&&asset.mimeType!=='image/png'&&asset.mimeType!=='image/jpeg')warnings.push('Przygotuj zatwierdzony plik rastrowy zgodny z wymaganiami dostawcy.');
 const width=mapping?.printAreaMm.width||print.widthMm,height=mapping?.printAreaMm.height||print.heightMm;
 if(asset&&(asset.widthPx<Math.ceil(width/25.4*300)||asset.heightPx<Math.ceil(height/25.4*300)))warnings.push('Rozdzielczość poniżej 300 DPI dla wskazanego pola druku.');
 if(member.group!=='adult')warnings.push('Wymagana kontrola bezpieczeństwa odzieży dziecięcej.');
 return {memberId:member.id,templateId:member.templateId,size,color,productId:mapping?.productId||null,variantId:mapping?.variantId||null,print,asset,warnings};});
 return {id:crypto.randomUUID(),provider,status:'review-needed',noDispatch:true,items};
}
export function previewGelatoPayload(draft:FulfillmentDraft){if(draft.provider!=='gelato'||draft.items.some(i=>i.warnings.length||!i.variantId||!i.asset?.verified))throw Error('Weryfikacja administratora nie jest kompletna.');return {orderType:'draft',items:draft.items.map((i,index)=>({itemReferenceId:String(index+1),productUid:i.variantId,quantity:1,files:[{type:'default',url:i.asset!.assetUrl}]}))};}
export function previewPrintifyMapping(draft:FulfillmentDraft){if(draft.provider!=='printify')throw Error('Nieprawidłowy dostawca.');return {status:'review-needed',noDispatch:true,items:draft.items};}
