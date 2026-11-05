import { normalizeOffer } from './shopping-core.mjs?v=7';
import { marketCurrency } from './shopping-markets.mjs?v=7';
import { storesForMarket } from './shopping-stores.mjs?v=7';

export const REFRESH_URL = 'https://raw.githubusercontent.com/dzimbo78-crypto/fitmystyle-studio/familylook-catalog/retail-refresh.json';
const MAX_OFFERS = 12000;
const keyOf = offer => {
  const url=new URL(offer.url);
  for(const key of [...url.searchParams.keys()]){
    if(/^utm_/i.test(key)||['hl','gclid','fbclid','msockid'].includes(key))url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return offer.market+' '+url.href;
};

export function mergeCatalogs(baseOffers, refresh, now = Date.now()) {
  const rows = new Map();
  for (const raw of baseOffers) {
    const offer = normalizeOffer(raw);
    if (offer?.url) rows.set(keyOf(offer), offer);
  }
  if (refresh?.schema !== 'familylook-public-refresh-1' ||
      !Array.isArray(refresh.offers) || refresh.offers.length > MAX_OFFERS) return [...rows.values()];

  const routes = new Map();
  for (const raw of refresh.offers) {
    const offer = normalizeOffer(raw);
    const time = Date.parse(offer?.checkedAt);
    if (!offer?.image || offer.price <= 0 || offer.source !== 'verified-page' ||
        !Number.isFinite(time) || time > now + 60000 || offer.currency !== marketCurrency(offer.market)) continue;

    const key = keyOf(offer);
    const before = rows.get(key);
    if (before && (before.storeId !== offer.storeId || Date.parse(before.checkedAt) >= time)) continue;
    if (!routes.has(offer.market)) {
      routes.set(offer.market, new Map(storesForMarket(offer.market).map(s => [s.id, new URL(s.url).hostname])));
    }
    if (routes.get(offer.market).get(offer.storeId) !== new URL(offer.url).hostname) continue;
    rows.set(key, before ? { ...offer, id: before.id, url: before.url } : offer);
  }
  return [...rows.values()];
}

export async function getRefresh({ signal } = {}) {
  // The static site keeps working with the bundled snapshot during outages.
  const response = await fetch(REFRESH_URL, { cache: 'no-store', signal });
  if (!response.ok) return null;
  return response.json();
}
