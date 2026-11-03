export const STORES=[
 {id:'hm',name:'H&M',domain:'www2.hm.com',url:'https://www2.hm.com/pl_pl/index.html',search:'https://www2.hm.com/pl_pl/search-results.html?q='},
 {id:'ca',name:'C&A',domain:'www.c-and-a.com',url:'https://www.c-and-a.com/pl/pl/shop',search:'https://www.c-and-a.com/pl/pl/shop/search?q='},
 {id:'decathlon',name:'Decathlon',domain:'www.decathlon.pl',url:'https://www.decathlon.pl/',search:'https://www.decathlon.pl/search?Ntt='},
 {id:'reserved',name:'Reserved',domain:'www.reserved.com',url:'https://www.reserved.com/pl/pl/',search:'https://www.reserved.com/pl/pl/search?query='},
 {id:'sinsay',name:'Sinsay',domain:'www.sinsay.com',url:'https://www.sinsay.com/pl/pl/',search:'https://www.sinsay.com/pl/pl/search?query='},
 {id:'cropp',name:'Cropp',domain:'www.cropp.com',url:'https://www.cropp.com/pl/pl/',search:'https://www.cropp.com/pl/pl/?query='},
 {id:'house',name:'House',domain:'www.housebrand.com',url:'https://www.housebrand.com/pl/pl/',search:'https://www.housebrand.com/pl/pl/?query='},
 {id:'mohito',name:'Mohito',domain:'www.mohito.com',url:'https://www.mohito.com/pl/pl/home',search:'https://www.mohito.com/pl/pl/?query='},
 {id:'bonprix',name:'bonprix',domain:'www.bonprix.pl',url:'https://www.bonprix.pl/',search:'https://www.bonprix.pl/search/',searchSuffix:'/'}
];
export const storeName=id=>STORES.find(s=>s.id===id)?.name||id;
export function shopSearchURL(id,query){const store=STORES.find(s=>s.id===id);return store?store.search?store.search+encodeURIComponent(String(query||'ubrania basic').slice(0,140))+(store.searchSuffix||''):store.url:'';}
