'use client';
import {useEffect,useState} from 'react';
import FamilyBuilder from '@/components/FamilyBuilder';
import MeasurementWizard from '@/components/MeasurementWizard';
import TechPackPreview from '@/components/TechPackPreview';
import AccountPanel from '@/components/AccountPanel';
import {FamilyProject,initialProject} from '@/lib/domain';
export default function Page(){const [project,setProject]=useState<FamilyProject|null>(null);const [selected,setSelected]=useState<string>('');
 useEffect(()=>{try{const stored=sessionStorage.getItem('fms-next-familylook');const p=stored?JSON.parse(stored) as FamilyProject:initialProject();setProject(p);setSelected(p.people[0].id)}catch{const p=initialProject();setProject(p);setSelected(p.people[0].id)}},[]);
 function update(p:FamilyProject){setProject(p);setSelected(s=>p.people.some(x=>x.id===s)?s:p.people[0].id);sessionStorage.setItem('fms-next-familylook',JSON.stringify(p))}
 if(!project)return <div className="p-8">Ładowanie studia…</div>;
 const person=project.people.find(p=>p.id===selected)||project.people[0];
 return <main><header className="bg-[#17251e] text-white p-6"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold">FitMyStyle. <span className="text-[#ccb184]">FamilyLook Studio</span></h1><p className="text-sm mt-2">Projekt rodziny · pomiary · szablony · dokumentacja techniczna</p></div></header><div className="max-w-7xl mx-auto p-4 md:p-7 grid lg:grid-cols-[330px_1fr] gap-5"><div><FamilyBuilder project={project} onChange={update} selected={selected} onSelect={setSelected}/><AccountPanel project={project} onLoad={update}/></div><div className="space-y-5"><MeasurementWizard person={person} onChange={p=>update({...project,people:project.people.map(q=>q.id===p.id?p:q)})}/><TechPackPreview project={project}/></div></div></main>
}