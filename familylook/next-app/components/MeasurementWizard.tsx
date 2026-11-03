'use client';
import type {Member} from '@/lib/types';
import {templateFor} from '@/lib/domain';
import {FamilyMeasureForm} from './FamilyMeasureForm';
export default function MeasurementWizard({member,onChange}:{member:Member;onChange:(member:Member)=>void}){return <FamilyMeasureForm member={member} kind={templateFor(member).kind} onChange={onChange}/>;}
