/** No supplier API request ever made in this module. Admin-only preview and review queue. */
import type {Configuration,Template} from './domain';
import {CATALOG,lines} from './domain';
export type PrintAsset={assetUrl:string;mimeType:'image/png'|'image/jpeg'|'image/svg+xml'|'application/pdf';widthPx:number;heightPx:number;verified:boolean};
export type FulfillmentDraft={id:string;provider:'gelato'|'printify';status:'review-needed';items:{templateId:string;size:string;color:string;variantId:string|null;asset:PrintAsset|null;warnings:string[]}[];noDispatch:true};
export function buildFulfillmentDraft(config:Configuration,assets:Record<string,PrintAsset>,provider:'gelato'|'printify'):FulfillmentDraft{
 const rows=lines(config);const items=rows.map(row=>{const tpl=row.template;
  const mapped=tpl?.providerMapping?.provider===provider?tpl.providerMapping:null;
  const asset=tpl?assets[tpl.id]??null:null;
  const minW=tpl?Math.ceil(tpl.printAreaMm.width/25.4*300):0;
  const minH=tpl?Math.ceil(tpl.printAreaMm.height/25.4*300):0;
  const warnings:string[]=[];
  if(!mapped)warnings.push('Brak zweryfikowanego SKU/UID dla rozmiaru i koloru u dostawcy');
  if(!asset||!asset.verified)warnings.push('Nadruk niezatwierdzony przez administratora');
  else if(asset.widthPx<minW||asset.heightPx<minH)warnings.push(`Rozdzielczość poniżej 300 DPI dla ${minW}×${minH} px`);
  if(row.member.type==='baby'||row.member.type==='child')warnings.push('Wymagana kontrola norm bezpieczeństwa dla odzieży dziecięcej');
  return {templateId:tpl?.id??'unavailable',size:row.member.size,color:row.color,variantId:mapped?.variantId??null,asset,warnings};});
 return {id:crypto.randomUUID(),provider,status:'review-needed',items,noDispatch:true};
}
/** Gelato's current v4 schema uses productUid, each print file with URL & type. Never synthesize a product UID. */
export function previewGelatoPayload(draft:FulfillmentDraft){if(draft.provider!=='gelato')throw new Error('Wrong provider');
 if(draft.items.some(i=>i.warnings.length||!i.variantId||!i.asset?.assetUrl))throw new Error('Admin verification incomplete');
 return {orderType:'draft' as const,items:draft.items.map((x,index)=>({itemReferenceId:String(index+1),productUid:x.variantId,quantity:1,files:[{type:'default',url:x.asset!.assetUrl}]}))};
}
/** Printify orders need shop, blueprint/variant IDs and uploaded artwork IDs, not a generic SVG print URL. */
export function previewPrintifyMapping(draft:FulfillmentDraft){if(draft.provider!=='printify')throw new Error('Wrong provider');
 return {status:'review-needed',items:draft.items.map(i=>({localTemplateId:i.templateId,verifiedVariantId:i.variantId,approvedPrintAsset:i.asset?.verified?i.asset:null,warnings:i.warnings}))};
}