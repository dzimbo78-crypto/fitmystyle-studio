import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {safeConfig} from '@/lib/domain';
import type {FamilyLookConfig} from '@/lib/types';
export async function POST(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!anon)return NextResponse.json({error:'Baza kont jest wyłączona.'},{status:503});
 const auth=req.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer '))return NextResponse.json({error:'Wymagane logowanie.'},{status:401});
 const token=auth.slice(7);
 const db=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const user=await db.auth.getUser(token);
 if(user.error||!user.data.user)return NextResponse.json({error:'Sesja wygasła.'},{status:401});
 try {
   const raw=await req.text();
   if(raw.length>450_000)return NextResponse.json({error:'Projekt jest zbyt duży.'},{status:413});
   const config=safeConfig(JSON.parse(raw) as FamilyLookConfig);
   const {data,error}=await db.from('familylook_projects').insert({owner_id:user.data.user.id,title:config.title,payload:config,schema_version:config.schemaVersion}).select('id,updated_at').single();
   if(error)return NextResponse.json({error:'Nie udało się zapisać projektu.'},{status:400});
   return NextResponse.json({ok:true,...data});
 }catch{return NextResponse.json({error:'Nieprawidłowy format projektu.'},{status:400})}
}