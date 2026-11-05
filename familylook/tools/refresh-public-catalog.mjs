import { readFile, writeFile, rename } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';
import { parseExchangeTable, exchangeURL } from './refresh-exchange-rates.mjs';
import { CRAWLER, robotPolicy, parseProductPage, productLinks } from './public-retail-html.mjs';
import { mergeCatalogs } from '../site/shopping-refresh.mjs';

const siteData = new URL('../site/data/', import.meta.url);
const data = async file => JSON.parse(await readFile(file, 'utf8'));
const schema = 'familylook-public-refresh-1';
const userAgent = CRAWLER + '/1.0 (+https://github.com/dzimbo78-crypto/fitmystyle-studio)';
const checkedAt = new Date().toISOString();

// Only reviewed public storefront paths. Products entered by visitors never reach this job.
const paths = {
  hm:/^\/[a-z]{2}_[a-z]{2}\/productpage\.\d+\.html$/,
  ca:/^\/[a-z]{2}\/[a-z]{2}\/shop\/[\w%-]+-\d+\/\d+\/?$/,
  decathlon:/^\/p\/[^/]+\/\d+\/[\w-]+\/?$/,
  reserved:/^\/[a-z]{2}\/[a-z]{2}\/[^/]+-\w+-\w+\/?$/,
  sinsay:/^\/[a-z]{2}\/[a-z]{2}\/[^/]+-\w+-\w+\/?$/,
  cropp:/^\/[a-z]{2}\/[a-z]{2}\/[^/]+-\w+-\w+\/?$/,
  house:/^\/[a-z]{2}\/[a-z]{2}\/[^/]+-\w+-\w+\/?$/,
  mohito:/^\/[a-z]{2}\/[a-z]{2}\/[^/]+-\w+-\w+\/?$/,
  bonprix:/^\/p\/[\w%-]+-\d+\/?$/,
  lindex:/^\/dk\/p\/\d+-\d+-[^/]+\/?$/,
  nameit:/^\/da-dk\/(?:[^/]+\/)*[^/]+-\d+[_\w]*\.html$/,
  jackjones:/^\/da-dk\/product\/\d+[_\d]+\/[^/]+\/?$/,
  veromoda:/^\/da-dk\/product\/\d+[_\d]+\/[^/]+\/?$/,
  arket:/^\/en-dk\/product\/[^/]+-\d+\/?$/,
  cos:/^\/en-dk\/(?:[^/]+\/)*product\/[^/]+-\d+\/?$/,
  zalando:/^\/[^/]+-[a-z0-9]{10,}\.html$/i,
  uniqlo:/^\/de\/de\/products\/E\d+-\d+\/\d+\/?$/,
  next:/^\/(?:en|de)\/style\/[\w-]+\/[\w-]+\/?$/,
  vertbaudet:/^\/[^/]+\.htm$/,
  okaidi:/^\/[^/]+-\d{5,}\/?$/,
  mango:/^\/es\/es\/p\/.+$/,
  kappahl:/^\/sv-se\/(?:[^/]+\/)+\d+\/?$/,
};

const collections = [
  ['DK','lindex','infant','https://www.lindex.com/dk/baby/nyfodt?hl=en'],
  ['DK','lindex','child','https://www.lindex.com/dk/barn'],
  ['DK','nameit','infant','https://www.nameit.com/da-dk/ni-baby-bottoms/ni-baby-bottoms-sweatpants/sweatpants/'],
  ['DK','nameit','child','https://www.nameit.com/da-dk/ni-all-tops/ni-all-tops-sweats/sweatshirts-og-hoodies/'],
  ['DK','jackjones','man','https://www.jackjones.com/da-dk/bukser/sweatpants'],
  ['DK','veromoda','woman','https://www.veromoda.com/da-dk/toej/sweatshirts'],
  ['DK','arket','child','https://www.arket.com/en-dk/children/clothing/sweatshirts/'],
  ['DK','arket','woman','https://www.arket.com/en-dk/women/clothing/sweatshirts-and-hoodies/'],
  ['DK','cos','man','https://www.cos.com/en-dk/men/sweatshirts'],
  ['DK','cos','woman','https://www.cos.com/en-dk/women/tops/sweatshirt'],
  ['DE','ca','man','https://www.c-and-a.com/de/de/shop/herren-bekleidung-sweatshirts-sweatjacken-sweatshirts'],
  ['DE','ca','infant','https://www.c-and-a.com/de/de/shop/baby-oberteile-hosen-outfits'],
  ['DE','reserved','child','https://www.reserved.com/de/de/madchen/kind/sweatshirts/hoodies','female'],
  ['DE','decathlon','child','https://www.decathlon.de/kinder/jogginghosen'],
  ['DE','uniqlo','child','https://www.uniqlo.com/de/de/kids/tops/sweatshirts-and-hoodies'],
  ['FR','okaidi','infant','https://www.okaidi.fr/bebe-garcon-3/pulls-gilets-sweats-10/pulls-sweats-11','male'],
  ['ES','mango','child','https://shop.mango.com/es/es/c/ninos/nino/sudaderas/e2afe0ee','male'],
  ['ES','mango','man','https://shop.mango.com/es/es/c/hombre/sudaderas/basicas/11a41604'],
  ['SE','kappahl','child','https://www.kappahl.com/sv-se/barn/basplagg/sweatshirts'],
  ['SE','kappahl','infant','https://www.kappahl.com/sv-se/baby/basplagg/bodys'],
].map(([market,id,audience,url,gender])=>({market,id,audience,url,gender}));

async function fetchText(url, accepts, policy, redirects=0) {
  if (!accepts(url) || policy && !policy.allows(url)) return { status:0, text:'' };
  if (policy) await wait(Math.max(1600,policy.delay*1000));
  const response = await fetch(url,{redirect:'manual',headers:{'User-Agent':userAgent,Accept:'text/html, text/plain, application/xhtml+xml'},signal:AbortSignal.timeout(10000)});
  const status = response.status;
  if ([301,302,303,307,308].includes(status) && redirects<2) {
    const location = response.headers.get('location');
    await response.body?.cancel();
    return location ? fetchText(new URL(location,url).href,accepts,policy,redirects+1) : {status,text:''};
  }
  if (!response.ok) {
    await response.body?.cancel();
    return {status,text:''};
  }
  const isRobots = new URL(url).pathname==='/robots.txt';
  const type = response.headers.get('content-type') || '';
  if (isRobots ? !type.includes('text/plain') : !/html|xhtml/.test(type)) {
    await response.body?.cancel();
    return {status,text:''};
  }
  const maxBytes = isRobots ? 500*1024 : 5*1024*1024;
  const chunks = [];
  let size=0;
  for await (const chunk of response.body) {
    size+=chunk.length;
    if (size>maxBytes) return {status,text:''};
    chunks.push(chunk);
  }
  return {status,text:Buffer.concat(chunks).toString('utf8'),url};
}

const base = (await Promise.all(['retail-catalog.json','retail-europe.json'].map(name=>data(new URL(name,siteData))))).flatMap(file=>file.offers);
const output = process.argv[2];
if (!output) throw Error('Pass the output path and optionally the previous snapshot.');
const previous = process.argv[3] ? await data(process.argv[3]).catch(()=>null) : null;
const before = mergeCatalogs(base,previous);
const baseByURL = new Map(before.map(offer=>[offer.url,offer]));
const groups = new Map();
const groupFor = url => {
  const host=new URL(url).hostname;
  if(!groups.has(host))groups.set(host,{host,offers:[],collections:[]});
  return groups.get(host);
};
for (const offer of before) {
  if (offer.source==='verified-page' && paths[offer.storeId]?.test(new URL(offer.url).pathname)) groupFor(offer.url).offers.push(offer);
}
for (const collection of collections) groupFor(collection.url).collections.push(collection);

async function readSource({host,offers,collections}) {
  const hostAllows = value => {
    const u = new URL(value);
    return u.protocol==='https:' && u.hostname===host && !u.port && !u.username && !u.password;
  };
  const robotsURL = 'https://' + host + '/robots.txt';
  let robots;
  try { robots = await fetchText(robotsURL,u=>hostAllows(u)&&new URL(u).pathname==='/robots.txt'); }
  catch { console.log(host + ' | robots unavailable'); return []; }
  if (robots.status!==404 && (!robots.text || robots.status!==200)) {
    console.log(host + ' | robots ' + robots.status);
    return [];
  }
  const policy = robotPolicy(robots.text || '');
  if (policy.delay>20) { console.log(host + ' | crawl delay exceeds budget'); return []; }
  const fresh = new Map();
  const perSegment = new Map();
  const old = offers.filter(o=>policy.allows(o.url)).sort((a,b)=>Date.parse(a.checkedAt)-Date.parse(b.checkedAt));
  for (const o of old) {
    const key = o.market + ' ' + o.audience + ' ' + o.category;
    if (!perSegment.has(key)) perSegment.set(key,[]);
    perSegment.get(key).push(o);
  }
  const day = Math.floor(Date.parse(checkedAt)/86400000);
  const targets = [];
  for (const rows of perSegment.values()) {
    const row=rows[day%Math.min(rows.length,7)];
    targets.push({url:row.url,source:{...row,id:row.storeId},previous:row});
  }
  const limit = collections.length ? 12 : 10;
  const start = day % Math.max(1, targets.length);
  const candidates = [...targets.slice(start),...targets.slice(0,start)].slice(0,limit-collections.length*2);
  for (const source of collections) {
    try {
      const page = await fetchText(source.url,value=>hostAllows(value)&&new URL(value).pathname===new URL(source.url).pathname,policy);
      if ([401,403,429].includes(page.status)) return [...fresh.values()];
      const links = productLinks(page.text,source.url,value=>hostAllows(value)&&paths[source.id]?.test(new URL(value).pathname));
      if (!links.length) continue;
      const candidatesHere = links.filter(url=>policy.allows(url)&&!candidates.some(c=>c.url===url));
      const offset = day % Math.max(1,candidatesHere.length);
      for (const url of [...candidatesHere.slice(offset),...candidatesHere.slice(0,offset)].slice(0,2)) {
        candidates.push({url,source,previous:baseByURL.get(url)});
      }
    } catch { /* One collection can fail while its other sources remain usable. */ }
  }
  let blocked=0, empty=0;
  for (const {url,source,previous} of candidates.slice(0,limit)) {
    try {
      const page = await fetchText(url,value=>hostAllows(value)&&paths[source.id]?.test(new URL(value).pathname),policy);
      if ([401,403,429].includes(page.status)) { blocked=page.status;break; }
      // Redirects to departments, country selectors and other products are not confirmations.
      if (page.url && new URL(page.url).pathname!==new URL(url).pathname) continue;
      const row = parseProductPage(page.text,url,source,checkedAt,previous);
      if (row && (row.availability!=='out'||previous)) fresh.set(url,row);
      else empty++;
    } catch { empty++; }
  }
  console.log(host + ' | ' + fresh.size + ' confirmed, ' + empty + ' skipped' + (blocked?' | HTTP '+blocked:''));
  return [...fresh.values()];
}

const refreshed = [];
const batch = [...groups.values()];
for (let i=0;i<batch.length;i+=5) {
  const rows = await Promise.all(batch.slice(i,i+5).map(readSource));
  refreshed.push(...rows.flat());
}
if (!refreshed.length) {
  console.log('No public product price could be verified. Existing snapshot retained.');
} else {
  let fx=previous?.fx || null;
  try {
    const response=await fetch(exchangeURL,{signal:AbortSignal.timeout(10000)});
    if (response.ok) fx=parseExchangeTable(await response.json());
  } catch { /* The preceding official exchange rates remain valid as a dated snapshot. */ }
  const merged=mergeCatalogs(previous?.offers||[],{schema,offers:refreshed});
  const offers=merged.sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt)).slice(0,10000);
  const update={schema,checkedAt,verifiedThisRun:refreshed.length,fx,offers};
  await writeFile(output+'.tmp',JSON.stringify(update)+'\n');
  await rename(output+'.tmp',output);
  console.log('Published payload prepared: '+refreshed.length+' verified, '+offers.length+' retained');
}
