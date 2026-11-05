import { marketName } from './shopping-markets.mjs?v=7';

const polishStores=[
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

const europeanStores = [
  { id: 'nameit', name: 'NAME IT', market: 'DK', url: 'https://www.nameit.com/da-dk/ni-all/ni-all-sweats/sweatshirts-sweatpants/' },
  { id: 'jackjones', name: 'Jack & Jones', market: 'DK', url: 'https://www.jackjones.com/da-dk/' },
  { id: 'veromoda', name: 'Vero Moda', market: 'DK', url: 'https://www.veromoda.com/da-dk/toej/sweatshirts' },
  { id: 'lindex', name: 'Lindex', market: 'DK', url: 'https://www.lindex.com/dk' },
  { id: 'arket', name: 'ARKET', market: 'DK', url: 'https://www.arket.com/en-dk/' },
  { id: 'cos', name: 'COS', market: 'DK', url: 'https://www.cos.com/en-dk/' },
  { id: 'uniqlo', name: 'UNIQLO', market: 'DE', url: 'https://www.uniqlo.com/de/de/' },
  { id: 'next', name: 'Next', market: 'DE', url: 'https://www.next.de/de' },
  { id: 'vertbaudet', name: 'Vertbaudet', market: 'FR', url: 'https://www.vertbaudet.fr/' },
  { id: 'okaidi', name: 'Okaïdi', market: 'FR', url: 'https://www.okaidi.fr/' },
  { id: 'mango', name: 'Mango', market: 'ES', url: 'https://shop.mango.com/es/es' },
  { id: 'kappahl', name: 'Kappahl', market: 'SE', url: 'https://www.kappahl.com/sv-se/' },
  { id: 'zalando', name: 'Zalando', market: 'DK', url: 'https://www.zalando.dk/', search: 'https://www.zalando.dk/katalog/?q=' },
];

const localHM = {
  DK:'da_dk', DE:'de_de', FR:'fr_fr', ES:'es_es', AT:'de_at', BE:'nl_be',
  BG:'bg_bg', CH:'de_ch', CZ:'cs_cz', EE:'et_ee', FI:'fi_fi', GB:'en_gb',
  GR:'el_gr', HR:'hr_hr', HU:'hu_hu', IE:'en_ie', IT:'it_it', LT:'lt_lt',
  LV:'lv_lv', NL:'nl_nl', NO:'no_no', PT:'pt_pt', RO:'ro_ro', SE:'sv_se',
  SI:'sl_si', SK:'sk_sk',
};

// Official storefront addresses published in Zalando's market directory.
const zalandoMarkets = { AT:'at', BE:'be', BG:'bg', CZ:'cz', EE:'ee', FI:'fi', GB:'co.uk', GR:'gr',
  HR:'hr', HU:'hu', IE:'ie', IT:'it', LT:'lt', LU:'lu', LV:'lv', NO:'no', PT:'pt', RO:'ro', SI:'si', SK:'sk' };
const extraRoutes = [
  ...Object.entries(zalandoMarkets).map(([market,tld])=>({id:'zalando',market,url:'https://www.zalando.'+tld+'/'})),
  { id: 'ca', market: 'DE', url: 'https://www.c-and-a.com/de/de/shop', search: 'https://www.c-and-a.com/de/de/shop/search?q=' },
  { id: 'reserved', market: 'DE', url: 'https://www.reserved.com/de/de/', search: 'https://www.reserved.com/de/de/search?query=' },
  { id: 'decathlon', market: 'DE', url: 'https://www.decathlon.de/', search: 'https://www.decathlon.de/search?Ntt=' },
  { id: 'cos', market: 'LU', url: 'https://www.cos.com/en-eu/' },
  { id: 'zalando', market: 'PL', url: 'https://www.zalando.pl/', search: 'https://www.zalando.pl/katalog/?q=' },
  { id: 'zalando', market: 'DE', url: 'https://www.zalando.de/', search: 'https://www.zalando.de/katalog/?q=' },
  { id: 'zalando', market: 'FR', url: 'https://www.zalando.fr/', search: 'https://www.zalando.fr/catalogue/?q=' },
  { id: 'zalando', market: 'ES', url: 'https://www.zalando.es/', search: 'https://www.zalando.es/catalogo/?q=' },
  { id: 'zalando', market: 'SE', url: 'https://www.zalando.se/' },
  { id: 'zalando', market: 'NL', url: 'https://www.zalando.nl/' },
  { id: 'zalando', market: 'CH', url: 'https://www.zalando.ch/' },
  { id: 'mango', market: 'PL', url: 'https://shop.mango.com/pl/pl' },
  { id: 'next', market: 'DK', url: 'https://www.nextdirect.com/dk/en' },
];

export const STORES = [...polishStores.map(store => ({ ...store, market: 'PL' })), ...europeanStores];
export const storeName = id => STORES.find(store => store.id === id)?.name || id;
export const merchantLabel = ({ storeId, market }) =>
  storeName(storeId) + (market && market !== 'PL' && storeId !== 'wardrobe' ? ' · ' + marketName(market) : '');

export function storesForMarket(market) {
  const hmLocale = localHM[market];
  const hm = hmLocale ? [{
    id: 'hm', market, url: 'https://www2.hm.com/' + hmLocale + '/index.html',
    search: 'https://www2.hm.com/' + hmLocale + '/search-results.html?q=',
  }] : [];
  return [...STORES, ...extraRoutes, ...hm].filter(store => store.market === market)
    .map(store => ({ ...store, name: storeName(store.id) }));
}

export function shopSearchURL(id, query, market = 'PL') {
  const store = storesForMarket(market).find(store => store.id === id);
  if (!store?.search) return store?.url || '';
  return store.search + encodeURIComponent(String(query || (market === 'PL' ? 'ubrania basic' : 'basic')).trim().slice(0,140)) + (store.searchSuffix || '');
}
