'use client';
import {useEffect,useRef} from 'react';
import type {FamilyLookConfig,Member} from '@/lib/types';
type SceneProject={version:string;name:string;paletteId:string;members:Member[];artwork:FamilyLookConfig['artwork']};
type Controller={update:(p:SceneProject,overlay?:string,view?:string)=>void;destroy:()=>void};
const toScene=(p:FamilyLookConfig):SceneProject=>({version:p.schemaVersion,name:p.title,paletteId:p.paletteId,members:structuredClone(p.members),artwork:structuredClone(p.artwork)});
export function MannequinViewer({project,onSelect,onEdit}:{project:FamilyLookConfig;onSelect:(id:string)=>void;onEdit:(members:Member[])=>void}){
 const host=useRef<HTMLDivElement>(null),controller=useRef<Controller|null>(null),latest=useRef(project),select=useRef(onSelect),edit=useRef(onEdit);latest.current=project;select.current=onSelect;edit.current=onEdit;
 useEffect(()=>{let cancelled=false;const url='/studio/family-scene.mjs';(async()=>{try{const api=await import(/* webpackIgnore: true */ url) as {createFamilyScene:(host:HTMLElement,onSelect:(id:string)=>void,onEdit:(p:SceneProject)=>void)=>Controller};if(cancelled||!host.current)return;controller.current=api.createFamilyScene(host.current,id=>select.current(id),p=>edit.current(structuredClone(p.members)));controller.current.update(toScene(latest.current));}catch{if(host.current)host.current.textContent='Nie udało się otworzyć manekinów. Konfiguracja i dokumentacja pozostają dostępne.';}})();return()=>{cancelled=true;controller.current?.destroy();controller.current=null;};},[]);
 useEffect(()=>{controller.current?.update(toScene(project));},[project]);
 return <div ref={host} className="family-scene" aria-label="Podgląd skonfigurowanej rodziny"><p className="p-8">Przygotowujemy manekiny…</p></div>;
}
