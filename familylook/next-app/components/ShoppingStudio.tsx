'use client';
import {useEffect,useRef} from 'react';
import type {FamilyLookConfig} from '@/lib/types';
import type {ShoppingPlan} from '@/lib/shopping-types';
type StudioProject={version:string;name:string;members:FamilyLookConfig['members'];paletteId:string;artwork:FamilyLookConfig['artwork'];shopping?:ShoppingPlan};
type Controller={update:(p:StudioProject,id?:string)=>void;destroy:()=>void};
const toStudio=(p:FamilyLookConfig):StudioProject=>({version:p.schemaVersion,name:p.title,members:structuredClone(p.members),paletteId:p.paletteId,artwork:structuredClone(p.artwork),shopping:p.shopping?structuredClone(p.shopping):undefined});
export function ShoppingStudio({project,selectedId,onSelect,onChange}:{project:FamilyLookConfig;selectedId:string;onSelect:(id:string)=>void;onChange:(plan:ShoppingPlan)=>void}){
 const host=useRef<HTMLDivElement>(null),controller=useRef<Controller|null>(null),latest=useRef(project),active=useRef(selectedId),select=useRef(onSelect),change=useRef(onChange);latest.current=project;active.current=selectedId;select.current=onSelect;change.current=onChange;
 useEffect(()=>{let cancelled=false;(async()=>{try{const url='/studio/shopping-studio.mjs?v=7',api=await import(/* webpackIgnore: true */ url) as {createShoppingStudio:(host:HTMLElement,callbacks:{onSelect:(id:string)=>void;onChange:(p:StudioProject)=>void})=>Controller};if(cancelled||!host.current)return;controller.current=api.createShoppingStudio(host.current,{onSelect:id=>select.current(id),onChange:p=>{if(p.shopping)change.current(structuredClone(p.shopping));}});controller.current.update(toStudio(latest.current),active.current);}catch{if(host.current)host.current.textContent='Nie udało się wczytać modułu zakupów.';}})();return()=>{cancelled=true;controller.current?.destroy();controller.current=null;};},[]);
 useEffect(()=>{controller.current?.update(toStudio(project),selectedId);},[project,selectedId]);return <div ref={host} className="shopping-section mt-10 rounded" id="shopping" aria-label="Zakupy i budżet rodziny"/>;
}
