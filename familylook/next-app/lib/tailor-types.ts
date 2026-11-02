/** FamilyLook Tailor Studio: typed contract for a future authenticated Next.js client.
 * Production and cloud saves are disabled in the current static guest version.
 * Server endpoints must validate payloads; TypeScript is not a security boundary.
 */
export type PersonType = 'adultF' | 'adultM' | 'child' | 'baby';
export type Fit = 'slim' | 'regular' | 'relaxed' | 'oversize';
export type GarmentType = 'tshirt' | 'hoodie' | 'crewneck' | 'sweater' | 'shirt' | 'trousers' | 'dress' | 'bodysuit';
export type MaterialType = 'cotton_jersey' | 'french_terry' | 'fleece' | 'merino' | 'poplin' | 'linen';
export type BodyMeasurementCode = 'height' | 'neck' | 'chest' | 'underbust' | 'waist' | 'hip' | 'shoulder' | 'backLength' | 'sleeve' | 'bicep' | 'wrist' | 'inseam' | 'outseam' | 'thigh' | 'crotch' | 'head' | 'torso';
export type BodyMeasurementsCm = Partial<Record<BodyMeasurementCode, number>>;
export interface TailorPerson {
 id: string;
 name: string;
 type: PersonType;
 garment: GarmentType;
 material: MaterialType;
 fit: Fit;
 sourceSize: string; // label only, not anthropometric fact
 measurements: BodyMeasurementsCm;
 additionalEaseCm: number;
 seamAllowanceCm: number;
 hemAllowanceCm: number;
 preferredGarmentLengthCm: number | null;
 notes: string;
 consentForTransfer: boolean;
}
export interface FamilyTailorDraft {
 schema: 'fitmystyle-tailor-pack-v1';
 ownerId?: string; // only populated by server after verifying auth; never trust a client-supplied owner
 persons: TailorPerson[]; // 1–8
 createdAt: string;
 approval: 'draft' | 'awaiting-pattern-review' | 'reviewed';
 neverAutoDispatch: true;
}
export interface TechPackDraft {
 schema: 'fitmystyle-tailor-pack-v1';
 documentType: 'TECHNICAL_DRAFT_NOT_PRODUCTION_APPROVAL';
 person: Pick<TailorPerson,'id'|'name'|'type'|'sourceSize'>;
 bodyMeasurementsCm: BodyMeasurementsCm;
 review: { status: 'requires-human-review'; missing: string[]; warnings: string[]; fitTrialRequired: true; patternValidated: false };
 manufacturing: { patternStatus: 'not-generated'; gradingStatus: 'not-verified' };
}