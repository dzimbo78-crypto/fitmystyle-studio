export type AgeGroup='adult'|'child'|'infant';
export type BodyShape='female'|'male'|'neutral';
export type Fit='slim'|'regular'|'relaxed'|'oversized';
export type MeasureKey='height'|'chest'|'underbust'|'waist'|'hip'|'neck'|'shoulder'|'backLength'|'frontLength'|'sleeve'|'bicep'|'wrist'|'inseam'|'outseam'|'thigh'|'head';
export type MeasureValues=Partial<Record<MeasureKey,number>>;
export interface PreviewStyle {skin?:string;color?:string;pattern?:string;patternScale?:number;patternEnabled?:boolean}
export interface Member {id:string;name:string;group:AgeGroup;shape:BodyShape;templateId:string;size?:string;fit:Fit;measurements:MeasureValues;preview?:PreviewStyle;notes?:string}
export interface ArtworkLayer {text:string;color:string;position:'front'|'back';scale:number;offsetX?:number;offsetY?:number;font?:'sans'|'serif'|'mono';layout?:'wordmark'|'monogram'|'badge';technique?:'print'|'embroidery';enabled?:boolean}
export interface FamilyLookConfig {schemaVersion:'2.0.0';title:string;paletteId:string;members:Member[];artwork:ArtworkLayer;updatedAt:string}
export interface TechPackReview {status:'REQUIRES_MEASUREMENTS'|'READY_FOR_PATTERNMAKER';missing:MeasureKey[];warnings:string[]}
export interface Template {id:string;name:string;kind:'tee'|'crewneck'|'hoodie'|'sweater'|'shirt'|'polo'|'pants'|'dress'|'bodysuit';groups:AgeGroup[];fabric:string;fit:Fit}
export interface PrintSpec {widthMm:number;heightMm:number;widthPx:number;heightPx:number;placement:'front'|'back'}
