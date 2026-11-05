import {normalizeOffer,searchOffers,moneyMinor} from './shopping-core.mjs';
import {marketCurrency,normalizeMarket} from './shopping-markets.mjs';

/** Bounded public catalog response. Each record retains its actual price date. */
export function catalogPage(catalog,query={}){
 const market=normalizeMarket(query.market),currency=marketCurrency(market);
 const audience=['woman','man','adult','child','infant'].includes(query.audience)?query.audience:null;
 const normalized=catalog.offers.map(normalizeOffer).filter(Boolean).filter(o=>!audience||(o.audiences||[o.audience]).includes(audience));
 const list=searchOffers(normalized,{market,query:String(query.q||'').slice(0,100),category:query.category||'all',kind:query.kind||'all',storeId:query.store||'all',color:query.color||'all',maxPrice:moneyMinor(query.maxPrice),currency,confirmedSize:!!query.size,size:String(query.size||'').slice(0,20)});
 if(query.sort==='price')list.sort((a,b)=>a.price-b.price);else if(query.sort==='price-desc')list.sort((a,b)=>b.price-a.price);else if(query.sort==='fresh')list.sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt));
 const integer=(v,fallback,max)=>/^\d+$/.test(String(v))?Math.max(1,Math.min(max,Number(v))):fallback;
 const page=integer(query.page,1,10000),limit=integer(query.limit,24,100),count=key=>Object.fromEntries([...new Set(list.map(o=>o[key]))].map(k=>[k,list.filter(o=>o[key]===k).length]));
 return {schema:catalog.schema,checkedAt:catalog.checkedAt,priceMode:'dated-page-snapshot',liveStock:false,market,currency,total:list.length,page,limit,pages:Math.ceil(list.length/limit),facets:{stores:count('storeId'),categories:count('category')},offers:list.slice((page-1)*limit,page*limit)};
}
