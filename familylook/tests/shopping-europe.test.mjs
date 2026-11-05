import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeProject } from '../site/domain.mjs';
import { normalizeOffer, normalizeShopping, shoppingTotals, suggestShopping, searchOffers } from '../site/shopping-core.mjs';
import { catalogPage } from '../site/shopping-catalog.mjs';
import { marketCurrency, MARKETS } from '../site/shopping-markets.mjs';
import { storesForMarket } from '../site/shopping-stores.mjs';
import { mergeCatalogs } from '../site/shopping-refresh.mjs';
import { parseProductPage, robotPolicy, productLinks } from '../tools/public-retail-html.mjs';

const data = name => readFile(new URL('../site/data/'+name+'.json',import.meta.url),'utf8').then(JSON.parse);
const [polish,europe,fx]=await Promise.all(['retail-catalog','retail-europe','exchange-rates'].map(data));
const now=Date.parse('2026-11-05T10:00:00Z');
const date='2026-11-05T08:00:00Z';

test('country catalog extends real product coverage and never joins country budgets',()=>{
  const offers=[...polish.offers,...europe.offers].map(normalizeOffer);
  assert.ok(new Set(offers.map(o=>o.storeId)).size>=18);
  assert.ok(new Set(offers.map(o=>o.market)).size>=5);
  assert.equal(new Set(offers.map(o=>o.id)).size,offers.length);
  assert.ok(europe.offers.every(o=>o.image&&o.price>0&&o.currency===marketCurrency(o.market)));
  for(const market of MARKETS) assert.ok(storesForMarket(market).length);
  const page=catalogPage({...polish,offers},{market:'DK',limit:'100'});
  assert.equal(page.currency,'DKK');
  assert.ok(page.total>10);
  assert.ok(page.offers.every(o=>o.market==='DK'));
  assert.ok(searchOffers(offers,{market:'DK',query:'brązowa bluza'}).every(o=>o.market==='DK'));
  const project=makeProject(),plan=normalizeShopping({market:'DK'},project.members);
  project.members.forEach((p,i)=>plan.memberPreferences[p.id]={clothingSize:['S','M','110','68'][i]});
  const pick=suggestShopping(project,plan,offers,fx,{now});
  assert.equal(pick.totals.complete,true);
  const full=suggestShopping(project,{...plan,scope:'outfit',budget:1500},offers,fx,{now});
  assert.equal(full.totals.complete,true);
  assert.equal(full.plan.items.length,8);
  assert.ok(pick.plan.items.every(i=>i.offer.market==='DK'));
});

test('delivery and saved projects distinguish two storefront regions of the same shop',()=>{
  const project=makeProject(),memberId=project.members[0].id;
  const quote={id:'one',storeId:'ca',name:'T-shirt',url:'https://www.c-and-a.com/de/de/shop/t-shirt-1234567/1',audience:'woman',price:25,checkedAt:date};
  const row=(id,market,currency)=>({id,memberId,slot:'main',size:'S',quantity:1,offer:{...quote,id,market,currency}});
  const plan=normalizeShopping({market:'DE',shipping:{ca:{amount:0,currency:'PLN'},'ca@DE':{amount:10,currency:'PLN'}},
    items:[row('pl','PL','PLN'),row('de','DE','EUR')],savedLooks:[{name:'DE',market:'DE',items:[row('de','DE','EUR')]}]},project.members);
  assert.equal(plan.savedLooks[0].market,'DE');
  const totals=shoppingTotals(project,plan,fx);
  assert.equal(totals.groups.length,2);
  assert.equal(totals.shipping,1000);
  assert.deepEqual(totals.groups.map(g=>g.key),['ca','ca@DE']);
});

const source={id:'lindex',market:'DK',audience:'infant'};
const url='https://www.lindex.com/dk/p/10001-5-body';
const product = (amount=129, currency='DKK') => ({
  '@type':'ProductGroup',name:'Body',url,color:'Creme',image:'https://images.example/body.webp',
  hasVariant:[
    {'@type':'Product',name:'Body',size:'68 CM (4-6M)',offers:{'@type':'Offer',price:amount,priceCurrency:currency,availability:'https://schema.org/InStock'}},
    {'@type':'Product',name:'Body',size:'74',offers:{'@type':'Offer',price:amount,priceCurrency:currency,availability:'https://schema.org/OutOfStock'}},
  ],
});
const html = value => '<script type="application/ld+json">'+JSON.stringify(value)+'</script>';
test('a public price refresh only lists in-stock literal sizes and rejects ambiguous prices',()=>{
  const row=parseProductPage(html(product()),url,source,date);
  assert.deepEqual(row.sizes,['68 CM (4-6M)']);
  assert.equal(row.sizesKnown,true);
  assert.equal(row.price,129);
  assert.equal(parseProductPage(html(product(12,'EUR')),url,source,date),null);
  const mixed=product();mixed.hasVariant[1].offers.price=149;
  assert.equal(parseProductPage(html(mixed),url,source,date),null);
  const wrong=product();wrong.url='https://www.lindex.com/dk/p/another-product';
  assert.equal(parseProductPage(html(wrong),url,source,date),null);
});

test('remote refresh preserves stable ids and refuses stale, foreign-domain, and wrong-currency updates',()=>{
  const row=parseProductPage(html(product()),url,source,date);
  const before={...row,id:'existing-local',checkedAt:'2026-11-03T00:00:00Z',price:100};
  const patch={schema:'familylook-public-refresh-1',offers:[row,{...row,url:'https://not-the-store.example/body'},{...row,price:17,checkedAt:'2026-11-04T00:00:00Z'}]};
  const rows=mergeCatalogs([before],patch,now);
  assert.equal(rows.length,1);
  assert.equal(rows[0].id,'existing-local');
  assert.equal(rows[0].price,129);
  assert.equal(mergeCatalogs([before],{...patch,offers:[{...row,currency:'EUR'}]},now)[0].price,100);
});

test('public collection fetching respects robots path specificity and safe product paths',()=>{
  const robots=robotPolicy('User-agent: *\nDisallow: /dk/p/*\nAllow: /dk/p/10001-5-body$\nCrawl-delay: 4');
  assert.equal(robots.delay,4);
  assert.equal(robots.allows(url),true);
  assert.equal(robots.allows(url+'?size=68'),false);
  assert.equal(robots.allows('https://www.lindex.com/dk/p/2-body'),false);
  assert.deepEqual(productLinks('<a href="/dk/p/10001-5-body">Body</a><a href="https://bad.example/dk/p/x">bad</a>',url,value=>new URL(value).hostname==='www.lindex.com'&&robots.allows(value)),[url]);
});
