export type AgeGroup='adult'|'child'|'infant';
export type BodyShape='female'|'male'|'neutral';
export type Fit='slim'|'regular'|'relaxed'|'oversized';
export type MeasureKey='height'|'chest'|'underbust'|'waist'|'hip'|'neck'|'shoulder'|'backLength'|'frontLength'|'sleeve'|'bicep'|'wrist'|'inseam'|'outseam'|'thigh'|'head';
export type MeasureValues=Partial<Record<MeasureKey,number>>;
export interface Member { id:string; name:string; group:AgeGroup; shape:BodyShape; templateId:string; size?:string; fit:Fit; measurements:MeasureValues; notes?:string }
export interface ArtworkLayer{ text:string; color:string; position:'front'|'back'; scale:number; assetUrl?:string }
export interface FamilyLookConfig {schemaVersion:'2.0.0';title:string;paletteId:string;members:Member[];artwork:ArtworkLayer;updatedAt:string}
export interface TechPackReview{status:'DRAFT'|'REQUIRES_MEASUREMENTS'|'READY_FOR_PATTERNMAKER'|'APPROVED_BY_HUMAN';missing:MeasureKey[];warnings:string[]}
export interface Template {id:string;name:string;kind:'tee'|'crewneck'|'hoodie'|'sweater'|'shirt'|'polo'|'pants'|'dress'|'bodysuit';groups:AgeGroup[];fabric:string;fit:Fit}
export type ProviderDraft={status:'NOT_SUBMITTED';memberId:string;templateId:string;printAreaMm:{w:number;h:number};providerProductId:null;providerVariantId:null;remarks:string};