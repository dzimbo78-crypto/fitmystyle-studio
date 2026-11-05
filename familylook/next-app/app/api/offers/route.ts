import {NextRequest,NextResponse} from 'next/server';
import catalog from '@/lib/retail-catalog.generated.json';
import europe from '@/lib/retail-europe.generated.json';
import {catalogPage} from '@/lib/runtime/shopping-catalog.mjs';
export function GET(request:NextRequest){
 const query=Object.fromEntries(['q','market','audience','category','kind','store','color','maxPrice','size','sort','page','limit'].map(key=>[key,request.nextUrl.searchParams.get(key)||'']));
 return NextResponse.json(catalogPage({...catalog,offers:[...catalog.offers,...europe.offers]},query),{headers:{'Cache-Control':'public, max-age=300, s-maxage=900','X-Content-Type-Options':'nosniff'}});
}
