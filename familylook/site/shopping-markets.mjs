// Storefront region, not a statement about delivery destinations.
export const MARKETS = [
  'PL', 'DK', 'DE', 'FR', 'ES', 'AT', 'BE', 'BG', 'CH', 'CZ', 'EE', 'FI',
  'GB', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'NL', 'NO', 'PT',
  'RO', 'SE', 'SI', 'SK',
];

const labels = new Intl.DisplayNames(['pl'], { type: 'region' });
export const marketName = market => labels.of(normalizeMarket(market));
export const normalizeMarket = market => MARKETS.includes(market) ? market : 'PL';

const currencyByMarket = {
  PL: 'PLN', DK: 'DKK', SE: 'SEK', NO: 'NOK', GB: 'GBP', CH: 'CHF',
  CZ: 'CZK', HU: 'HUF', RO: 'RON',
};

export const marketCurrency = market => currencyByMarket[normalizeMarket(market)] || 'EUR';
export const CURRENCIES = [...new Set(MARKETS.map(marketCurrency))];
export const merchantKey = ({ storeId, market }) =>
  !market || market === 'PL' ? storeId : storeId + '@' + market;

const searchWords = {
  DK: { tee:'t-shirt', crewneck:'sweatshirt', hoodie:'hættetrøje', sweater:'striktrøje', shirt:'skjorte', pants:'joggingbukser', dress:'kjole', bodysuit:'body', set:'sæt', woman:'dame', man:'herre', child:'børn', infant:'baby' },
  DE: { tee:'T-Shirt', crewneck:'Sweatshirt', hoodie:'Kapuzenpullover', sweater:'Pullover', shirt:'Hemd', pants:'Jogginghose', dress:'Kleid', bodysuit:'Body', set:'Set', woman:'Damen', man:'Herren', child:'Kinder', infant:'Baby' },
  FR: { tee:'t-shirt', crewneck:'sweat', hoodie:'sweat à capuche', sweater:'pull', shirt:'chemise', pants:'jogging', dress:'robe', bodysuit:'body', set:'ensemble', woman:'femme', man:'homme', child:'enfant', infant:'bébé' },
  ES: { tee:'camiseta', crewneck:'sudadera', hoodie:'sudadera con capucha', sweater:'jersey', shirt:'camisa', pants:'joggers', dress:'vestido', bodysuit:'body', set:'conjunto', woman:'mujer', man:'hombre', child:'niño', infant:'bebé' },
  SE: { tee:'t-shirt', crewneck:'sweatshirt', hoodie:'huvtröja', sweater:'stickad tröja', shirt:'skjorta', pants:'mjukisbyxor', dress:'klänning', bodysuit:'body', set:'set', woman:'dam', man:'herr', child:'barn', infant:'baby' },
};

export function marketSearchTerms(market, kind, person, size) {
  const words=searchWords[market];
  const role=person.group==='adult'?(person.shape==='male'?'man':person.shape==='female'?'woman':'adult'):person.group;
  return [words?.[kind]||({tee:'T-shirt',crewneck:'sweatshirt',hoodie:'hoodie',sweater:'sweater',shirt:'shirt',pants:'joggers',dress:'dress',bodysuit:'body',set:'set'})[kind]||'clothing',
    words?.[role]||({man:'men',woman:'women',child:'kids',infant:'baby'})[role],size].filter(Boolean).join(' ');
}
