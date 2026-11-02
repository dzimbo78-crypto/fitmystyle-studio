import {guestStorage} from './safe-session.mjs';
// Guest catalogs are per-tab and expire when the browser session closes.
const KEY='fms-v8-guest-catalog';
export async function readCatalog(){try{const raw=JSON.parse(guestStorage.getItem(KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return []}}
export async function storeCatalog(items){if(!Array.isArray(items)||items.length>5000)throw Error('Invalid catalog');try{guestStorage.setItem(KEY,JSON.stringify(items))}catch{throw Error('Limit pamięci sesji. Wyeksportuj katalog przed zamknięciem karty.')}}
export async function clearCatalog(){guestStorage.removeItem(KEY)}