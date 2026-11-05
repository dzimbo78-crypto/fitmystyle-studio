import { createHash } from 'node:crypto';
import { marketCurrency } from '../site/shopping-markets.mjs';

export const CRAWLER = 'FamilyLookCatalog';
const decode = value => String(value).replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, entity => {
  const key = entity.slice(1, -1);
  if (key.startsWith('#')) {
    const code = /^#x/i.test(key) ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  }
  return { amp:'&', quot:'"', apos:"'", lt:'<', gt:'>' }[key] || entity;
});
const array = value => Array.isArray(value) ? value : value == null ? [] : [value];
const typed = (node, type) => array(node?.['@type']).some(value => String(value).split(/[\/#]/).pop() === type);
const fold = value => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();

export const offerId = (store, market, url) =>
  'eu-' + market.toLowerCase() + '-' + store + '-' + createHash('sha256').update(url).digest('hex').slice(0,16);

export function robotPolicy(text) {
  const groups = [];
  let names = [], rules = [], delay = 0;
  function finish() {
    if (names.length) groups.push({ names, rules, delay });
    names = []; rules = []; delay = 0;
  }
  for (const line of text.split(/\r?\n/)) {
    const [field, value] = line.replace(/#.*/, '').split(/:(.*)/s).slice(0,2).map(x=>x.trim());
    if (field?.toLowerCase() === 'user-agent' && value) {
      if (rules.length || delay) finish();
      names.push(value.toLowerCase());
    } else if (names.length && ['allow','disallow'].includes(field?.toLowerCase()) && value) {
      rules.push({ allow:field.toLowerCase()==='allow', path:value });
    } else if (names.length && field?.toLowerCase() === 'crawl-delay') {
      delay = Math.max(0, Number(value) || 0);
    }
  }
  finish();
  const named = groups.filter(g=>g.names.includes(CRAWLER.toLowerCase()));
  const applicable = named.length ? named : groups.filter(g=>g.names.includes('*'));
  const matching = applicable.flatMap(g=>g.rules).map(rule=>{
    const path = rule.path.replace(/\$$/,'');
    const escaped = path.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    return { ...rule, weight:path.replaceAll('*','').length, pattern:new RegExp('^'+escaped+(rule.path.endsWith('$')?'$':'')) };
  }).sort((a,b)=>b.weight-a.weight||Number(b.allow)-Number(a.allow));
  return {
    delay:Math.max(0,...applicable.map(g=>g.delay)),
    allows: url => {
      const u = new URL(url);
      const path = u.pathname + u.search;
      return matching.find(r=>r.pattern.test(path))?.allow ?? true;
    },
  };
}

function structuredProducts(html) {
  const products = [];
  const visit = node => {
    for (const item of array(node)) {
      if (!item || typeof item !== 'object') continue;
      if (typed(item,'Product') || typed(item,'ProductGroup')) products.push(item);
      visit(item['@graph']);
      visit(item.mainEntity);
    }
  };
  for (const match of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    try { visit(JSON.parse(match[1])); }
    catch { try { visit(JSON.parse(decode(match[1]))); } catch { /* Invalid markup is ignored. */ } }
  }
  return products;
}

function urlAt(value, page) {
  if (typeof value !== 'string' || !value) return '';
  try {
    const url = new URL(decode(value), page);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    url.hash = '';
    return url.href;
  } catch { return ''; }
}

const parsePrice = value => /^\d+(?:[.,]\d{1,2})?$/.test(String(value ?? '').trim())
  ? Math.round(Number(String(value).replace(',','.')) * 100) : NaN;
const availability = status => /(?:^|\/)(?:InStock|LimitedAvailability)$/i.test(status) ? 'in'
  : /(?:^|\/)(?:OutOfStock|SoldOut|Discontinued)$/i.test(status) ? 'out' : 'unknown';
const literalSize = value => {
  const size = typeof value === 'object' ? value?.name : value;
  return /^(?:[2-6]?X[SL]|XS|S|M|L|XL|XXL|XXXL|\d{2,3}(?:\s*[-/]\s*\d{2,3})?(?:\s*cm)?)(?:\s*\([^)]{1,22}\))?$/i.test(String(size || ''))
    ? String(size).trim() : '';
};

export function internationalGarment(name) {
  const n = fold(name);
  if (/pajama|pyjama|schlafanzug|badetoj|swimwear|badeanzug|sous-vetement/.test(n)) return null;
  const top = /sweatshirt|sweat\b|sudadera|hoodie|t-shirt|pull\b|troja/.test(n);
  const bottom = /jogg|sweatpant|sweatbuks|leggings|legging|trousers|pantalon|hose|byxor|bukser/.test(n);
  if (top && bottom && /\b(set|satz|ensemble|conjunto|sat|outfit)\b/.test(n)) return {category:'onepiece',garmentKind:'set'};
  if (/\b(body|bodysuit|bodystocking|bodies)\b/.test(n)) return {category:'top',garmentKind:'bodysuit'};
  if (/\b(jacket|jacke|veste|manteau|jakke|jacka|abrigo|parka)\b/.test(n)) return {category:'outer',garmentKind:'outer'};
  if (/\b(dress|kleid|kjole|robe|vestido)\b/.test(n)) return {category:'onepiece',garmentKind:'dress'};
  if (bottom) return {category:'bottom',garmentKind:'pants'};
  if (/hoodie|kapuze|haett|capuche|capucha|huva|haettetroje/.test(n)) return {category:'top',garmentKind:'hoodie'};
  if (/sweatshirt|sweat\b|sudadera|collegetroja/.test(n)) return {category:'top',garmentKind:'crewneck'};
  if (/\b(pullover|pull|sweater|cardigan|strik|strick|stickad|jumper|jersey|tricot)\b/.test(n)) return {category:'top',garmentKind:'sweater'};
  if (/\b(polo)\b/.test(n)) return {category:'top',garmentKind:'polo'};
  if (/\b(t-shirt|tshirt|tee|camiseta)\b/.test(n)) return {category:'top',garmentKind:'tee'};
  if (/\b(shirt|skjorte|camisa|chemise|hemd)\b/.test(n)) return {category:'top',garmentKind:'shirt'};
  if (/\b(sneakers|trainers|baskets|sneaker|schoenen)\b/.test(n)) return {category:'shoes',garmentKind:'shoes'};
  return null;
}

export function internationalColor(color) {
  const n = fold(color);
  const choices = [
    ['navy',/navy|marine|marino|morkebla|dunkelblau/],
    ['black',/black|schwarz|sort|noir|negro|svart/],
    ['beige',/beige|cream|creme|ecru|off.white|sand/],
    ['white',/white|weiss|hvid|vit\b|blanc|blanco/],
    ['brown',/brown|braun|brun|marron|coffee|chocolate|chocolat/],
    ['grey',/grey|gray|grau|gra\b|gris/],
    ['green',/green|gron|grun|vert|verde|sage|olive|forest|swamp/],
    ['blue',/blue|blau|bla\b|bleu|azul/],
    ['purple',/purple|lilac|lila|violet|morado/],
    ['pink',/pink|rosa|rose|lyserod/],
    ['red',/red\b|rot\b|rod\b|rouge|rojo|burdeos/],
    ['yellow',/yellow|gelb|gul\b|jaune|amarillo/],
    ['orange',/orange|naranja/],
  ];
  return choices.find(([,pattern])=>pattern.test(n))?.[0] || 'multi';
}

export function parseProductPage(html, page, source, checkedAt, previous) {
  const candidates = structuredProducts(html);
  const pageURL = new URL(page);
  const samePath = value => {
    const address = urlAt(value,page);
    if (!address) return false;
    const target = new URL(address);
    return target.hostname===pageURL.hostname && target.pathname.replace(/\/$/,'')===pageURL.pathname.replace(/\/$/,'');
  };
  const root = candidates.find(node=>samePath(node.url) || samePath(node['@id'])) ??
    (candidates.length===1 ? candidates[0] : null);
  if (!root || !root.name || (root.url && !samePath(root.url))) return null;

  const variants = array(root.hasVariant).filter(v=>typed(v,'Product'));
  const scoped = variants.filter(v=>samePath(v.url));
  const quoteVariants = scoped.length ? scoped : variants;
  if (!scoped.length && new Set(quoteVariants.map(v=>v.color).filter(Boolean)).size > 1) return null;
  const quoteRows = (quoteVariants.length ? quoteVariants : [root]).flatMap(node=>array(node.offers).map(offer=>{
    if (!offer || offer.priceCurrency !== marketCurrency(source.market)) return null;
    if (typed(offer,'AggregateOffer') && (offer.highPrice == null || parsePrice(offer.lowPrice)!==parsePrice(offer.highPrice))) return null;
    const price = parsePrice(offer.price ?? offer.lowPrice);
    if (!Number.isSafeInteger(price) || price<=0 || price>100000000) return null;
    return { price, size:literalSize(node.size), stock:availability(offer.availability), node };
  }).filter(Boolean));
  if (!quoteRows.length || new Set(quoteRows.map(q=>q.price)).size !== 1) return null;

  const selected = quoteRows[0].node;
  const images = [...new Set([...array(selected.image),...array(root.image)].map(image=>urlAt(typeof image==='object'?image?.url||image?.contentUrl:image,page)).filter(Boolean))].slice(0,5);
  const name = decode(selected.name || root.name).trim();
  const kind = previous ? { category:previous.category, garmentKind:previous.garmentKind } : internationalGarment(name);
  if (!kind || !images.length) return null;
  const sizes = [...new Set(quoteRows.filter(q=>q.stock==='in'&&q.size).map(q=>q.size))];
  const allVariantsKnown = (!quoteVariants.length || quoteRows.length===quoteVariants.length) && quoteRows.every(q=>q.stock!=='unknown'&&q.size);
  const stock = quoteRows.some(q=>q.stock==='in')?'in':quoteRows.every(q=>q.stock==='out')?'out':'unknown';
  const color = String(selected.color || root.color || previous?.color || '');
  return {
    ...previous,
    id:previous?.id || offerId(source.id,source.market,page), storeId:source.id, market:source.market,
    name:previous?.name || name, url:page, price:quoteRows[0].price/100, currency:marketCurrency(source.market),
    ...kind, audience:previous?.audience || source.audience, gender:previous?.gender || source.gender || 'neutral',
    color, colorFamily:color ? internationalColor(color)==='multi' ? previous?.colorFamily || 'multi' : internationalColor(color) : 'multi',
    sizes, sizesKnown:allVariantsKnown, availability:stock, checkedAt, image:images[0], images,
    source:'verified-page', sourcePage:page,
  };
}

export function productLinks(html, collection, accepts) {
  const result = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)) {
    const url = urlAt(match[1],collection);
    if (url && accepts(url)) result.add(url);
    if (result.size >= 100) break;
  }
  return [...result];
}
