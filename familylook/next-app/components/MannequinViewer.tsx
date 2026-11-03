'use client';
import {useEffect,useRef} from 'react';
import type {FamilyLookConfig,Member} from '@/lib/types';
type SceneProject={version:string;name:string;paletteId:string;members:Member[];artwork:FamilyLookConfig['artwork']};
type Controller={update:(p:SceneProject,overlay?:string,id?:string)=>void;destroy:()=>void};
type Edits=Pick<FamilyLookConfig,'members'|'artwork'>;
const toScene=(p:FamilyLookConfig):SceneProject=>({version:p.schemaVersion,name:p.title,paletteId:p.paletteId,members:structuredClone(p.members),artwork:structuredClone(p.artwork)});
export function MannequinViewer({project,onSelect,onEdit}:{project:FamilyLookConfig;onSelect:(id:string)=>void;onEdit:(edits:Edits)=>void}){
 const host=useRef<HTMLDivElement>(null),controller=useRef<Controller|null>(null),latest=useRef(project),select=useRef(onSelect),edit=useRef(onEdit);latest.current=project;select.current=onSelect;edit.current=onEdit;
 useEffect(()=>{let cancelled=false;const url='/studio/photo-studio.mjs';(async()=>{try{const api=await import(/* webpackIgnore: true */ url) as {createPhotoStudio:(host:HTMLElement,callbacks:{onSelect:(id:string)=>void;onEdit:(p:SceneProject)=>void})=>Controller};if(cancelled||!host.current)return;controller.current=api.createPhotoStudio(host.current,{onSelect:id=>select.current(id),onEdit:p=>edit.current({members:structuredClone(p.members),artwork:structuredClone(p.artwork)})});controller.current.update(toScene(latest.current));}catch{if(host.current)host.current.textContent='Nie udało się otworzyć studia. Konfiguracja i dokumentacja pozostają dostępne.';}})();return()=>{cancelled=true;controller.current?.destroy();controller.current=null;};},[]);
 useEffect(()=>{controller.current?.update(toScene(project));},[project]);
 return <div ref={host} aria-label="Podgląd skonfigurowanej rodziny"><p className="p-8">Przygotowujemy makiety…</p></div>;
}
