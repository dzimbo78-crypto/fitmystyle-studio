import type {AgeGroup,FamilyLookConfig,Member,MeasureKey,ProviderDraft,TechPackReview} from './types';
export const requiredByKind:Record<string,MeasureKey[]>={
 tee:['height','chest','waist','hip','shoulder','backLength'],
 crewneck:['height','chest','waist','hip','shoulder','sleeve','backLength','bicep'],
 hoodie:['height','chest','waist','hip','shoulder','sleeve','backLength','bicep'],
 sweater:['height','chest','waist','hip','shoulder','sleeve','backLength','bicep'],
 shirt:['height','chest','waist','hip','neck','shoulder','sleeve','backLength','bicep'],
 polo:['height','chest','waist','hip','shoulder','sleeve','backLength'],
 pants:['height','waist','hip','inseam','outseam','thigh'],
 dress:['height','chest','waist','hip','shoulder','backLength','frontLength'],
 bodysuit:['height','chest','waist','hip','backLength']
};
export function sanitizeGroup(value:string):AgeGroup {return value==='child'||value==='infant'?value:'adult'}
export function emptyMember(group:AgeGroup,number:number):Member {return {id:crypto.randomUUID(),name:`Osoba ${number}`,group,shape:'neutral',templateId:group==='infant'?'T19':'T01',fit:'regular',measurements:{}}}
export function validateMeasurements(member:Member,kind:string):TechPackReview {const missing=(requiredByKind[kind]||[]).filter(k=>!((member.measurements[k]??0)>0));const warnings:string[]=[];if(member.measurements.height&&member.measurements.backLength&&member.measurements.backLength>=member.measurements.height)warnings.push('Długość pleców przekracza wzrost — sprawdź.');if(member.group!=='adult'&&kind==='hoodie')warnings.push('Sprawdź EN 14682: projekt bez niebezpiecznych sznurków.');return {status:missing.length?'REQUIRES_MEASUREMENTS':'READY_FOR_PATTERNMAKER',missing,warnings}}
export function providerDraft(member:Member,kind:string):ProviderDraft {const width=kind==='bodysuit'?110:kind==='shirt'?100:260,height=kind==='bodysuit'?125:kind==='shirt'?120:300,scale=member.group==='infant'?0.5:member.group==='child'?0.72:1;return {status:'NOT_SUBMITTED',memberId:member.id,templateId:member.templateId,printAreaMm:{w:Math.round(width*scale),h:Math.round(height*scale)},providerProductId:null,providerVariantId:null,remarks:'Only draft dimensions. Verify per exact supplier product and size.'}}
export function safeConfig(value:FamilyLookConfig):FamilyLookConfig {if(value.members.length<1||value.members.length>12)throw new Error('Wymagana liczba osób od 1 do 12.');if(value.members.some(p=>!['adult','child','infant'].includes(p.group)))throw new Error('Nieznana grupa wieku.');if(value.members.some(p=>Object.values(p.measurements).some(v=>!Number.isFinite(v)||v<=0||v>300)))throw new Error('Sprawdź pomiary w cm.');return {...value,schemaVersion:'2.0.0',title:value.title.slice(0,100),updatedAt:new Date().toISOString()}}