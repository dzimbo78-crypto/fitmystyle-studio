// Guests use per-tab session storage; no long-lived localStorage.
import {guestStorage} from './safe-session.mjs';
const localStorage = guestStorage;
import {reportHTML,compareLooks} from './shopping-report.mjs';
import {makeWardrobeItem,validateWardrobe,wardrobeStats,sizeGuide,WARDROBE_LIMIT} from './wardrobe.mjs';
import {initCatalogRadar} from './catalog-radar-ui.mjs';
import {initializePatternStudio} from './pattern-ui.mjs';
import {parsePartnerFeed,mergeCatalog,freshness,stats,fetchPermittedFeed} from './catalog-connectors.mjs';
import {readCatalog,storeCatalog} from './catalog-storage.mjs';
import {parseStyleBrief,recommendPro,prepareShoppingPlan,findAlternatives,customizeLook} from './stylist-pro.mjs';
import {printArtwork,printTechnicalPack,PRINT_THEMES} from './print-pro.mjs';
import {getBrowserAIStatus,explainWithBrowserAI,interpretBriefWithBrowserAI} from './browser-ai.mjs';
import {PALETTES,COLORS,STYLES,generateDemoProducts,validateProduct,parseCSV,buildFamily,recommend,safeText,customDesignSvg} from './core.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const demo=generateDemoProducts();
let catalogRadar=null;
const state={adults:2,children:2,style:'everyday',palette:'sage',budget:300,seed:1,imported:[],published:[],lastReport:null,lookResults:[],customLooks:{},activeAlt:null,expanded:null,matching:'coordinated',priority:'balanced',realOnly:false,sizes:{},labels:{},saved:[],catalogLimit:24,wardrobe:[],shoppingIndex:0};
const LOOK_KEY='fitmystyle-independent-lookbook-v3';
const PREFS_KEY='fitmystyle-independent-family-v3';
const KEY='fitmystyle-standalone-import-v1';
const WARDROBE_KEY='fitmystyle-studio-v6-private-wardrobe';
// Import only previously saved FitMyStyle/FamilyLook data on the SAME origin.
// Never reads other projects' storage keys. Previous files can also be restored manually.
function previousValue(current,legacy){
  try {const value=localStorage.getItem(current);if(value!==null)return value;
    const previous=localStorage.getItem(legacy);if(previous!==null){localStorage.setItem(current,previous);return previous;}
  }catch{}return null;
}
const hasStorage=(()=>{try{localStorage.setItem('__fl_test','1');localStorage.removeItem('__fl_test');return true}catch{return false}})();
try{if(hasStorage){const stored=JSON.parse(previousValue(KEY,'familylook-standalone-import-v1')||'[]');if(Array.isArray(stored))state.imported=stored.slice(0,5000).map(validateProduct)}}catch{state.imported=[]}
try{const stored=JSON.parse(previousValue(LOOK_KEY,'familylook-independent-lookbook-v3')||'[]');if(Array.isArray(stored))state.saved=stored.slice(0,100)}catch{}
try{const prefs=JSON.parse(previousValue(PREFS_KEY,'familylook-independent-family-v3')||'{}');if(prefs&&typeof prefs==='object'){if(prefs.sizes&&typeof prefs.sizes==='object')state.sizes=prefs.sizes;if(prefs.labels&&typeof prefs.labels==='object')state.labels=prefs.labels}}catch{}
try{const stored=JSON.parse(localStorage.getItem(WARDROBE_KEY)||'[]');state.wardrobe=validateWardrobe(stored)}catch{state.wardrobe=[]}
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500)}
const fmt=value=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
function personSVG(role,color='#8ea595',unique='') {
  const safeColor=/^#[0-9a-f]{6}$/i.test(color)?color:'#91a695';
  const isChild=role==='child',isWoman=role==='woman';
  return `<svg viewBox="0 0 120 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrative outfit mannequin"><defs><linearGradient id="skin${unique}" x1="0" x2="0.7" y1="0" y2="1"><stop stop-color="#ebc9a8"/><stop offset="1" stop-color="#d6ab89"/></linearGradient></defs><ellipse cx="60" cy="264" rx="37" ry="5" fill="#000" opacity=".1"/>
  <path d="M43 55Q32 29 47 17 Q62 7 77 22 Q91 40 79 58Z" fill="${isWoman?'#40362f':'#514237'}"/>
  <ellipse cx="60" cy="45" rx="18" ry="24" fill="url(#skin${unique})"/><path d="M43 34q5-23 26-19q15 3 10 27q-6-16-15-16q-8 11-21 8" fill="#514237"/>
  <rect x="54" y="65" width="12" height="17" rx="5" fill="#dab191"/>
  <path d="M37 80Q25 81 21 98L13 161Q12 168 18 170Q26 172 27 163L40 113L37 150L83 150L80 113L92 164Q95 171 102 168Q106 163 102 157L98 96Q94 81 81 80L67 75Q60 84 53 75Z" fill="${safeColor}" stroke="#46594d" stroke-opacity=".16" stroke-width="1.4"/>
  ${isWoman?`<path d="M39 124L81 124L91 181Q60 192 29 181Z" fill="${safeColor}" stroke="#46594d" stroke-opacity=".17"/>`:`<path d="M39 147L81 147L79 202L63 202L60 159L56 202L39 202Z" fill="${isChild?'#c2aa90':'#b6a592'}"/>`}
  <path d="M39 ${isWoman?180:201}L55 ${isWoman?182:201}L54 254L41 254Z" fill="#dab191"/><path d="M64 ${isWoman?182:201}L79 ${isWoman?180:201}L80 254L67 254Z" fill="#dab191"/>
  <path d="M41 248L54 248L57 261Q48 265 33 263Z" fill="#f5f0e8" stroke="#bbb6b0" stroke-width="1"/><path d="M67 248L80 248L88 263Q73 265 64 261Z" fill="#f5f0e8" stroke="#bbb6b0" stroke-width="1"/></svg>`;
}
function members(){return buildFamily(state.adults,state.children).map(m=>({...m,size:state.sizes[m.id]||m.size,label:state.labels[m.id]||m.label}))}
function savePrefs(){document.dispatchEvent(new Event('fms:changed'));try{localStorage.setItem(PREFS_KEY,JSON.stringify({sizes:state.sizes,labels:state.labels}))}catch{}}
function saveLookbook(){document.dispatchEvent(new Event('fms:changed'));try{localStorage.setItem(LOOK_KEY,JSON.stringify(state.saved))}catch{toast('Brak miejsca na zapis. Pobierz kopię swoich projektów.')}}
function allProducts(){return [...state.wardrobe,...state.imported,...state.published,...demo]}
function allRealProducts(){return [...state.imported,...state.published]}
function renderHero(){const shades=['#d6b89b','#6c8c76','#eee4cf','#a9b8a1'];$('#hero-people').innerHTML=['woman','man','child','child'].map((r,i)=>personSVG(r,shades[i],`h${i}`)).join('')}
function renderMembers(){const m=members();$('#adults-value').textContent=state.adults;$('#children-value').textContent=state.children;
const sizes=p=>p.role==='child'?['0M','3M','6M','9M','12M','18M','2Y','3Y','4Y','5Y','6Y','7Y','8Y','9Y','10Y','12Y','14Y']:['XS','S','M','L','XL','XXL','3XL'];
$('#member-chips').innerHTML=`<div class="member-grid-edit">${m.map(p=>`<div class="member-editor"><span>${p.role==='child'?'✿':'♙'}</span><input data-name-id="${p.id}" value="${safeText(p.label)}" maxlength="24" aria-label="Member name"><select data-size-id="${p.id}" aria-label="Size for ${safeText(p.label)}">${sizes(p).map(t=>`<option value="${t}" ${t===p.size?'selected':''}>${t}</option>`).join('')}</select></div>`).join('')}</div>`;
}
function renderChoices(){const icons={everyday:'☼',elegant:'♧',holiday:'✳',active:'↝'};
$('#style-options').innerHTML=Object.entries(STYLES).map(([key,o])=>`<button class="choice ${state.style===key?'selected':''}" data-style="${key}" aria-pressed="${state.style===key}"><span class="choice-icon">${icons[key]}</span>${o.name}</button>`).join('');
$('#palette-options').innerHTML=Object.entries(PALETTES).map(([key,p])=>`<button class="palette-option ${state.palette===key?'selected':''}" data-palette="${key}" aria-pressed="${state.palette===key}"><span class="swatch-group">${p.hex.map(h=>`<i style="background:${h}"></i>`).join('')}</span>${safeText(p.name)}</button>`).join('')}
function renderLooks(){
 const opts={members:members(),style:state.style,palette:state.palette,budget:state.budget,count:9,seed:state.seed,matching:state.matching,priority:state.priority,realOnly:state.realOnly};
 state.lookResults=recommendPro(opts,allProducts()).map((look,i)=>state.customLooks[`${state.seed}-${i}`]||look);
 const looks=state.lookResults.slice(0,6);
 $('#results-subtitle').textContent=`${members().length} osób · ${STYLES[state.style].name} · ${PALETTES[state.palette].name} · budżet ${fmt(state.budget)} · ${state.realOnly?'tylko importowane':'w tym DEMO'}`;
 $('#outfits').innerHTML=looks.length?looks.map((look,i)=>{
  const bg=['#edf0e9','#eee9e1','#e6e9e4','#eeede8','#e9e8e5','#edf0ea'];
  const drawn=look.items.map((it,j)=>personSVG(it.member.role,it.product?.colorHex||'#dedbd3',`l${i}${j}`)).join('');
  const real=look.items.filter(x=>x.product?.status==='external').length;
  const missing=look.missing?.length||0;
  const price=look.total||0;
  return `<article class="outfit-card"><div class="look-art" style="background:${bg[i%bg.length]}"><span class="demo-ribbon">${look.allDemo?'KONCEPCJA DEMO':'PLAN ZAKUPOWY · CENY NIEPOTWIERDZONE'} · ${i+1}</span>${drawn}</div><div class="card-inner"><div class="card-topline"><h3>${['Naturalna harmonia','Razem w jednym stylu','Delikatny kontrast','Nowoczesna rodzina','Weekendowy zestaw','Nowa kolekcja'][i]}</h3><span class="match-score">✦ ${look.match}%</span></div>
  <p class="card-sub">${look.items.length} osoby · ${real} ofert · ${look.items.filter(x=>x.product?.status==='owned').length} z własnej szafy ${missing?'· niekompletne':''}</p>
  <div class="status-row"><span class="status-pill">${look.complete?'Komplet':'Brakuje rozmiarów/produktów'}</span><span class="status-pill">${look.sourceCount||0} dostawców</span><span class="status-pill">${look.withinBudget?(look.shippingUnknown?'Cena wstępna':'W budżecie'):'Ponad budżetem'}</span></div>
  <div class="look-rows">${look.items.map(x=>`<div class="look-row"><span>${safeText(x.member.label)} · ${safeText(x.member.size)}${x.product?' · '+safeText(x.product.color):''}</span><strong>${x.product?fmt(x.product.price):'Brak'}</strong></div>`).join('')}</div>
  <div class="card-actions"><span class="card-price">${fmt(price)}<small>${look.shippingUnknown?'Dostawa: część kosztów nieznana':`Zawiera szac. dostawę: ${fmt(look.shipping||0)}`}</small></span><button class="preview-button" data-preview-look="${i}">◇ Manekin 3D</button><button class="detail-button" data-expand="${i}">${state.expanded===i?'Zamknij':'Szczegóły'} ↗</button></div>
  ${state.expanded===i?`<div class="product-details">${look.items.map(x=>`<div class="detail-line"><strong>${safeText(x.member.label)}:</strong> ${x.product?safeText(x.product.name):'Brak dostępnego wariantu'}<small>${x.product?`${safeText(x.product.source)} · ${x.product.status==='demo'?'DEMO — niedostępne do zakupu':x.product.status==='owned'?'W TWOJEJ SZAFIE — 0 €':'Cena i dostępność NIEPOTWIERDZONE'} · ${safeText(x.product.size)}`:''}</small>${x.product?.sourceUrl?`<a href="${safeText(x.product.sourceUrl)}" target="_blank" rel="noopener noreferrer nofollow">Otwórz ofertę sklepu ↗</a>`:''}<button type="button" class="preview-button small" data-preview-look="${i}" data-preview-person="${safeText(x.member.id)}">◇ Zobacz na manekinie</button><button type="button" class="alt-toggle" data-alt-look="${i}" data-alt-person="${safeText(x.member.id)}">↺ Zamień ubranie</button>${state.activeAlt===`${i}-${x.member.id}`?`<div class="alternative-list">${findAlternatives({member:x.member,chosen:x.product,style:state.style,palette:state.palette,onlyImported:state.realOnly},allProducts(),5).map(a=>`<button type="button" class="alt-option" data-swap-look="${i}" data-swap-person="${safeText(x.member.id)}" data-swap-product="${safeText(a.product.id)}"><span>${safeText(a.product.name)} · ${safeText(a.product.source)}<small>${safeText(a.product.size)} · ceny niepotwierdzone</small></span><b>${fmt(a.product.price)}</b></button>`).join('')||'<small>Brak alternatyw z właściwym rozmiarem</small>'}</div>`:''}</div>`).join('')}<div class="saved-actions"><button class="save-outfit" data-save="${i}">♡ Zapisz w lookbooku</button><button class="secondary-button" data-export="${i}">Eksport JSON ↓</button><button class="secondary-button" data-plan="${i}">Plan zakupowy ↓</button></div></div>`:''}
  </div></article>`;
 }).join(''):'<div class="empty-state">Nie udało się stworzyć zestawu. Wybierz inną paletę lub dodaj produkty do biblioteki.</div>';

 queueMicrotask(renderCompare);
}
function renderSaved(){
 $('#saved-count').textContent=`${state.saved.length} zapisanych zestawów`;
 $('#saved-outfits').innerHTML=state.saved.length?state.saved.map((entry,i)=>`<article class="saved-card"><span class="eyebrow dark">ZAPISANO ${safeText(new Date(entry.savedAt).toLocaleDateString('pl-PL'))}</span><h3>${safeText(entry.title||'Family look')}</h3><div class="status-row"><span class="status-pill">${entry.look.match}% zgodności</span><span class="status-pill">${fmt(entry.look.total)}</span><span class="status-pill">${entry.look.allDemo?'DEMO':'Oferty do weryfikacji'}</span></div><ul>${entry.look.items.map(x=>`<li>${safeText(x.member.label)} (${safeText(x.member.size)}): ${safeText(x.product?.name||'brak')} ${x.product?`· ${fmt(x.product.price)}`:''}</li>`).join('')}</ul><div class="saved-actions"><button class="secondary-button" data-saved-plan="${i}">Plan zakupów ↓</button><button class="secondary-button" data-saved-export="${i}">Eksport zestawu ↓</button><button class="secondary-button danger" data-saved-remove="${i}">Usuń</button></div></article>`).join(''):'<div class="empty-state">Nie masz jeszcze zapisanych zestawów. Przejdź do Outfit Studio, wybierz zestaw i kliknij „Zapisz w lookbooku”.</div>';
}

async function save(){document.dispatchEvent(new Event('fms:changed'));
 try{await storeCatalog(state.imported);if(hasStorage)localStorage.removeItem(KEY);return true}
 catch{if(hasStorage)try{localStorage.setItem(KEY,JSON.stringify(state.imported));return true}catch{}toast('Brak miejsca na trwały zapis: pobierz kopię danych biblioteki.');return false}
}
async function loadSitePublishedCatalog(){
 if(!['http:','https:'].includes(location.protocol))return;
 try{const response=await fetch('./data/catalog-public.json',{cache:'no-store'});if(!response.ok)return;const data=await response.json();
 if(!Array.isArray(data)||data.length>5000)return;
 state.published=data.map(validateProduct).filter(p=>p.sourceUrl&&p.permission==='supplier-approved');renderCatalog();renderLooks();
 }catch{/* An empty or unavailable published feed must not break the offline app. */}
}
async function hydrateCatalog(){
 try{const stored=await readCatalog();if(Array.isArray(stored)&&stored.length>state.imported.length){state.imported=stored.slice(0,5000).map(validateProduct);renderCatalog();renderLooks();toast(`Załadowano ${state.imported.length} produktów z pamięci urządzenia`)}else if(state.imported.length){await save()}}
 catch{/* localStorage fallback remains available */}
}
function renderCatalog(){const all=allProducts(),summary=stats(allRealProducts());$('#catalog-total').textContent=demo.length;$('#catalog-real').textContent=allRealProducts().length;$('#catalog-suppliers-count').textContent=new Set(state.published.map(p=>p.source)).size;
 $('#catalog-health').innerHTML=`<strong>${summary.stores} źródeł</strong> · <strong>${summary.importedToday} niedawno zaimportowanych</strong> · ${summary.roles.woman} damskich · ${summary.roles.man} męskich · ${summary.roles.child} dziecięcych <small>Żaden import nie oznacza sprawdzenia ceny ani stanu na żywo.</small>`;
 const filter=$('#catalog-filter').value,role=$('#catalog-role').value,q=$('#catalog-search').value.trim().toLowerCase();let filtered=filter==='demo'?demo:filter==='imported'?allRealProducts():all;
 filtered=filtered.filter(p=>(role==='all'||p.role===role)&&(!q||[p.name,p.source,p.color,p.sku,p.description,p.size].some(x=>String(x||'').toLowerCase().includes(q))));
 $('#catalog-items').innerHTML=filtered.slice(0,state.catalogLimit).map(p=>`<div class="catalog-line">${p.imageUrl?`<img class="product-thumb" src="${safeText(p.imageUrl)}" loading="lazy" referrerpolicy="no-referrer" alt="${safeText(p.name)}">`:`<span class="small-color" style="background:${p.colorHex}"></span>`}<div class="catalog-desc"><strong>${safeText(p.name)}</strong><small>${safeText(p.role)} · ${safeText(p.style)} · ${safeText(p.color)} · ${safeText(p.source)} · ${p.status==='demo'?'DEMO': 'oferta z importu, niepotwierdzona'} · rozmiar ${safeText(p.size||'?')}</small><small class="catalog-freshness">${p.status==='demo'?'Nie do zakupu':freshness(p)==='imported-today'?'Import: do 24 h (bez live-check)':freshness(p)==='older-than-day'?'Import: ponad 24 h (sprawdź cenę)':'Import: nieaktualny lub data nieznana'} · ${p.stock==='in'?'sprzedawca oznaczył jako dostępny':p.stock==='out'?'niedostępny wg feedu':'stan niepotwierdzony'}</small></div><span>${fmt(p.price)}</span>${p.sourceUrl?`<a href="${safeText(p.sourceUrl)}" rel="noopener noreferrer nofollow" target="_blank">Sklep ↗</a>`:''}</div>`).join('')+(filtered.length>state.catalogLimit?`<p style="font-size:11px;color:#909e91">Wyświetlono ${state.catalogLimit} z ${filtered.length} produktów</p>`:'')||'<p style="font-size:12px;color:#88958a">Brak produktów. Zaimportuj katalog od dostawcy.</p>';
 $('#catalog-more').hidden=filtered.length<=state.catalogLimit;renderDashboard();
 catalogRadar?.updateStatus();
}
function renderCompare(){
 const looks=state.lookResults.slice(0,6);const first=$('#compare-first'),second=$('#compare-second');
 const previousA=Number(first.value)||0,previousB=second.value===''?1:Number(second.value);
 const options=looks.map((l,i)=>`<option value="${i}">Zestaw ${i+1} — ${fmt(l.total)}</option>`).join('');
 first.innerHTML=options;second.innerHTML=options;
 if(looks.length<2){$('#compare-result').innerHTML='Wybierz kolejne propozycje, aby porównać dwa różne zestawy.';return}
 first.value=String(Math.min(previousA,looks.length-1));second.value=String(Math.min(previousB,looks.length-1));
 if(first.value===second.value)second.value=String((Number(first.value)+1)%looks.length);
 const data=compareLooks(looks[Number(first.value)],looks[Number(second.value)]);
 const attrs=[['Koszt',fmt(data.first.price),fmt(data.second.price)],['Dopasowanie',`${data.first.match}%`,`${data.second.match}%`],['Ubrania z szafy',data.first.owned,data.second.owned],['Sprzedawcy',data.first.merchants,data.second.merchants],['Komplet',data.first.complete?'Tak':'Nie',data.second.complete?'Tak':'Nie']];
 $('#compare-result').innerHTML=`<div class="compare-grid"><span>KRYTERIUM</span><strong>ZESTAW ${Number(first.value)+1}</strong><strong>ZESTAW ${Number(second.value)+1}</strong>${attrs.map(x=>`<span>${x[0]}</span><b>${x[1]}</b><b>${x[2]}</b>`).join('')}</div><p>${data.priceDifference>=0?'Drugi zestaw jest droższy o':'Drugi zestaw jest tańszy o'} ${fmt(Math.abs(data.priceDifference))}. Ceny z importu nie są weryfikowane na żywo.</p>`;
}
function renderFeedReport(report){state.lastReport=report;const entries=Object.entries(report.reasons||{}).sort((a,b)=>b[1]-a[1]);$('#feed-report').innerHTML=`<div class="feed-report-bar"><strong>Zaakceptowano: ${report.accepted}</strong><span>Odrzucono: ${report.rejected}</span><span>Format: ${safeText(report.format)}</span></div>${entries.length?`<details><summary>Dlaczego odrzucono rekordy (${entries.length} przyczyn)?</summary><ul>${entries.slice(0,12).map(([reason,n])=>`<li>${safeText(reason)} — ${n}</li>`).join('')}</ul></details>`:''}<small>Brak potwierdzenia ceny, stanów oraz prawa do zdjęć przez sam importer.</small>`}
async function acceptFeed(text,{format='auto',source='Partner feed',baseUrl='',currency='EUR',rate=1,persist=true}={}){
 const fx=currency==='EUR'?{}:{[currency]:rate};const {products,report}=parsePartnerFeed(text,{format,source,baseUrl,defaultCurrency:currency,fx});renderFeedReport(report);
 if(!products.length){$('#feed-status').textContent='Nie znaleziono kompletnych wariantów produktów — zobacz raport odrzuceń.';return report}
 if(!persist){$('#feed-status').textContent='Testowy feed został tylko przeanalizowany — nie dodano przykładowych ofert do biblioteki.';return report}
 const merged=mergeCatalog(state.imported,products,5000);state.imported=merged;await save();renderCatalog();renderLooks();$('#feed-status').textContent=`Dodano/odświeżono ${products.length} wariantów. Łącznie ${merged.length}. Oferty nie są sprawdzone w czasie rzeczywistym.`;toast(`Zapisano ${products.length} ofert z feedu`);return report
}
function feedCurrency(){const currency=$('#feed-currency').value,rate=Number($('#feed-rate').value);if(currency!=='EUR'&&(!Number.isFinite(rate)||rate<=0||rate===1))throw Error('Dla walut innych niż EUR wpisz ręcznie zweryfikowany kurs do EUR (inny niż 1).');return {currency,rate}}
async function loadRemoteFeed(){if(!$('#feed-permission').checked)throw Error('Najpierw potwierdź swoje uprawnienia do wykorzystania feedu.');const url=$('#feed-url').value.trim(),kind=$('#feed-kind').value,source=$('#feed-source').value.trim()||'Wybrany partner';const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Wymagany poprawny adres HTTPS');if(/(?:^|[?&])(api_?key|access_?token|secret|password)=/i.test(u.search))throw Error('Nie wstawiaj kluczy ani haseł w adres URL');
 let target=url,format='auto';if(kind==='woocommerce'){format='woocommerce'}else if(kind==='shopify'){target=new URL('/products.json?limit=100',u.origin).toString();format='shopify'}
 const btn=$('#feed-load');btn.disabled=true;$('#feed-status').textContent='Pobieram publiczne dane sklepu bez cookies, kont i prywatnego proxy…';try{let text;
 if(kind==='woocommerce'){const maxPages=Number($('#feed-pages').value)||1;const pages=[];for(let p=1;p<=maxPages;p++){target=new URL(`/wp-json/wc/store/v1/products?per_page=100&page=${p}`,u.origin).toString();const body=await fetchPermittedFeed(target);const items=JSON.parse(body);if(!Array.isArray(items))throw Error('WooCommerce zwróciło niepoprawną listę produktów');pages.push(...items);$('#feed-status').textContent=`Pobrano ${pages.length} rekordów z ${p} stron/y WooCommerce`;if(items.length<100)break}text=JSON.stringify(pages)}else{text=await fetchPermittedFeed(target)}
 const {currency,rate}=feedCurrency();await acceptFeed(text,{format,source,baseUrl:u.origin,currency,rate})}finally{btn.disabled=false}
}


function saveWardrobe(){document.dispatchEvent(new Event('fms:changed'));try{localStorage.setItem(WARDROBE_KEY,JSON.stringify(state.wardrobe))}catch{toast('Brak miejsca w pamięci. Wyeksportuj swoją szafę.')}}
function renderDashboard(){
 $('#dash-demo-count').textContent=demo.length;
 $('#dash-wardrobe-count').textContent=state.wardrobe.length;
 $('#dash-partner-count').textContent=allRealProducts().length;
 $('#dash-look-count').textContent=state.saved.length;
}
function renderWardrobe(){
 const m=members();const owner=$('#wardrobe-owner'),previous=owner.value;
 owner.innerHTML=m.map(x=>`<option value="${x.id}">${safeText(x.label)}</option>`).join('');
 if(m.some(x=>x.id===previous))owner.value=previous;
 $('#wardrobe-style').innerHTML=Object.entries(STYLES).map(([id,v])=>`<option value="${id}">${safeText(v.name)}</option>`).join('');
 $('#wardrobe-color').innerHTML=Object.entries(COLORS).map(([id,v])=>`<option value="${id}">${safeText(id)}</option>`).join('');
 updateWardrobeSizes();
 const summary=wardrobeStats(state.wardrobe);
 $('#wardrobe-summary').textContent=`${summary.total} własnych ubrań · dane tylko w tej przeglądarce`;
 $('#wardrobe-list').innerHTML=state.wardrobe.length?state.wardrobe.map(p=>{
  const person=m.find(x=>x.id===p.ownerId)?.label||'Osoba spoza obecnej konfiguracji';
  return `<div class="wardrobe-item"><span class="wardrobe-item-swatch" style="background:${p.colorHex}"></span><span class="wardrobe-item-name"><strong>${safeText(p.name)}</strong><small>${safeText(person)} · ${safeText(p.size)} · ${safeText(STYLES[p.style]?.name||p.style)} · 0 € do dokupienia</small></span><button type="button" data-wardrobe-delete="${safeText(p.id)}" aria-label="Usuń ${safeText(p.name)}">✕</button></div>`
 }).join(''):'<div class="wardrobe-note">Twoja szafa jest jeszcze pusta. Dodaj pierwsze ubranie, aby wykorzystać je w stylizacjach.</div>';
 const previously=$('#size-guide-member').value;
 $('#size-guide-member').innerHTML=m.map(x=>`<option value="${x.id}">${safeText(x.label)}</option>`).join('');
 if(m.some(x=>x.id===previously))$('#size-guide-member').value=previously;
 renderDashboard();
}
function updateWardrobeSizes(){
 const person=members().find(x=>x.id===$('#wardrobe-owner').value),sizes=person?.role==='child'?['0M','3M','6M','9M','12M','18M','2Y','3Y','4Y','5Y','6Y','7Y','8Y','9Y','10Y','12Y','14Y']:['XS','S','M','L','XL','XXL','3XL'];
 const el=$('#wardrobe-size'),was=el.value;
 el.innerHTML=sizes.map(x=>`<option value="${x}">${x}</option>`).join('');
 el.value=sizes.includes(was)?was:person?.size||sizes[0];
}
function renderShopping(){
 const select=$('#shopping-look-select'),selected=state.shoppingIndex;
 const looks=state.lookResults.slice(0,6);
 select.innerHTML=looks.map((l,i)=>`<option value="${i}">Zestaw ${i+1} · ${fmt(l.total)} · ${l.match}% dopasowania</option>`).join('');
 state.shoppingIndex=Math.max(0,Math.min(selected,looks.length-1));select.value=String(state.shoppingIndex);
 const look=looks[state.shoppingIndex],host=$('#shopping-overview');
 if(!look){host.innerHTML='<div class="shopping-summary-card">Brak wygenerowanego zestawu. Otwórz Studio stylizacji.</div>';return}
 const plan=prepareShoppingPlan(look),merchantCount=plan.groups.length;
 const boxes=[`<div class="shopping-summary-card"><div><span class="eyebrow dark">KOSZT ORIENTACYJNY</span><p>${look.items.length} osób · ${merchantCount} sprzedawców · ${plan.owned.length} własnych ubrań<br>Kwota bez nieznanych kosztów dostawy; nic nie zostało zamówione.</p></div><strong>${fmt(look.total)}</strong></div>`];
 if(plan.owned.length)boxes.push(`<div class="shopping-merchant"><h3>♧ Już masz w szafie (${plan.owned.length})</h3><ul>${plan.owned.map(x=>`<li>${safeText(x.person)} · ${safeText(x.name)} · ${safeText(x.size)} — bez zakupów</li>`).join('')}</ul></div>`);
 for(const g of plan.groups)boxes.push(`<div class="shopping-merchant"><h3>▤ ${safeText(g.merchant)}</h3><p>${g.items.length} produktów · ${g.shippingKnown?`Szacowana dostawa ${fmt(g.shippingEstimate)}`:'Koszt dostawy nieznany'}</p><ul>${g.items.map(x=>`<li><strong>${safeText(x.person)}</strong> · ${safeText(x.name)} (${safeText(x.size)}) · ${fmt(x.price)} · ${safeText(x.stock)} <a href="${safeText(x.url)}" target="_blank" rel="noopener noreferrer nofollow">Sprawdź u sprzedawcy ↗</a></li>`).join('')}</ul></div>`);
 if(plan.unavailable.length)boxes.push(`<div class="shopping-merchant"><h3>◇ Brak potwierdzonej oferty (${plan.unavailable.length})</h3><p>Stylizacja demonstracyjna nie ma linku do sklepu. Nie można jej kupić przez FitMyStyle.</p><ul>${plan.unavailable.map(x=>`<li>${safeText(x)}</li>`).join('')}</ul></div>`);
 host.innerHTML=boxes.join('');
}
function navigate(page){if(!['dashboard','studio','designer','catalog','patterns','lookbook','suppliers','wardrobe','shopping','mannequin'].includes(page))return;$$('.page').forEach(x=>x.classList.toggle('active-page',x.id===page));$$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));$('#breadcrumb').textContent={dashboard:'Studio Overview',wardrobe:'My Wardrobe',shopping:'Shopping Board',studio:'Outfit Studio',designer:'Print Designer',catalog:'Product Library',patterns:'Pattern Studio',lookbook:'Saved Lookbook',suppliers:'Supplier Hub'}[page];if(page==='catalog')renderCatalog();if(page==='lookbook')renderSaved();if(page==='wardrobe')renderWardrobe();if(page==='shopping')renderShopping();if(page==='dashboard')renderDashboard();window.scrollTo(0,0);document.dispatchEvent(new CustomEvent('fms:navigation',{detail:{page}}))}
function download(filename,data,mime='application/json'){const b=new Blob([data],{type:mime});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function printSettings(){return {theme:$('#design-theme').value,headline:$('#design-message').value,subline:$('#design-subline').value,ink:$('#design-ink').value}}
function updateDesigner(){const svg=printArtwork(printSettings());$('#design-art').innerHTML=svg;$('#design-art').style.backgroundColor=$('#design-bg').value}

async function processImport(file){if(!file)return;if(file.size>16*1024*1024){toast('Maksymalny rozmiar pliku 16 MB');return}
 try{if(!$('#feed-permission').checked)throw Error('Potwierdź, że możesz używać danych z tego feedu (checkbox w panelu poniżej).');const raw=await file.text();const {currency,rate}=feedCurrency();const source=$('#feed-source').value.trim()||file.name.replace(/\.(csv|json|jsonl|xml|rss|html|txt)$/i,'');const result=await acceptFeed(raw,{source,currency,rate});$('#import-status').textContent=`Import: zaakceptowano ${result.accepted}, odrzucono ${result.rejected}. Szczegóły w raporcie.`;
 }catch(e){$('#import-status').textContent=`Błąd importu: ${e.message}`;toast('Nie udało się zaimportować: '+e.message)}finally{$('#product-import').value=''}}

function bind(){
 $$('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
 $('#wardrobe-owner').addEventListener('change',updateWardrobeSizes);
 $('#wardrobe-form').addEventListener('submit',e=>{e.preventDefault();try{if(state.wardrobe.length>=WARDROBE_LIMIT)throw Error('Limit 250 własnych ubrań.');const person=members().find(x=>x.id===$('#wardrobe-owner').value);if(!person)throw Error('Nie znaleziono osoby');const garment=makeWardrobeItem({ownerId:person.id,role:person.role,name:$('#wardrobe-name').value,style:$('#wardrobe-style').value,color:$('#wardrobe-color').value,size:$('#wardrobe-size').value});state.wardrobe.unshift(garment);saveWardrobe();renderWardrobe();renderLooks();$('#wardrobe-name').value='';toast('Dodano ubranie do prywatnej szafy')}catch(err){toast(err.message)}});
 $('#wardrobe-list').addEventListener('click',e=>{const btn=e.target.closest('[data-wardrobe-delete]');if(!btn)return;state.wardrobe=state.wardrobe.filter(p=>p.id!==btn.dataset.wardrobeDelete);saveWardrobe();renderWardrobe();renderLooks();toast('Usunięto ubranie')});
 $('#wardrobe-clear').onclick=()=>{if(!state.wardrobe.length)return;if(!confirm('Wyczyścić całą prywatną szafę? Najpierw możesz ją wyeksportować.'))return;state.wardrobe=[];saveWardrobe();renderWardrobe();renderLooks();toast('Wyczyszczono szafę')};
 $('#wardrobe-export').onclick=()=>download('fitmystyle-wardrobe.json',JSON.stringify({app:'FitMyStyle',type:'wardrobe-v1',items:state.wardrobe},null,2));
 $('#wardrobe-import').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1024*1024)throw Error('Limit importu 1 MB');const raw=JSON.parse(await f.text());if(raw.app!=='FitMyStyle'||raw.type!=='wardrobe-v1')throw Error('Niepoprawny format kopii szafy');const restored=validateWardrobe(raw.items);if(!confirm(`Zaimportować ${restored.length} elementów? Zastąpi to obecną szafę.`))return;state.wardrobe=restored;saveWardrobe();renderWardrobe();renderLooks();toast('Zaimportowano szafę')}catch(err){toast(err.message)}finally{e.target.value=''}});
 $('#size-guide-form').addEventListener('submit',e=>{e.preventDefault();try{const person=members().find(x=>x.id===$('#size-guide-member').value);const result=sizeGuide({role:person.role,chest:$('#size-guide-chest').value,waist:$('#size-guide-waist').value,hips:$('#size-guide-hips').value,height:$('#size-guide-height').value});$('#size-guide-result').textContent=`Orientacyjnie: ${result.size}. ${result.message}`}catch(err){$('#size-guide-result').textContent=err.message}});
 $('#shopping-look-select').addEventListener('change',e=>{state.shoppingIndex=Number(e.target.value);renderShopping()});
 $('#shopping-refresh').onclick=renderShopping;
 $('#shopping-report').onclick=()=>{const look=state.lookResults[state.shoppingIndex];if(look)download('fitmystyle-plan-do-wydruku.html',reportHTML(look),'text/html;charset=utf-8')};
 $('#compare-first').addEventListener('change',renderCompare);$('#compare-second').addEventListener('change',renderCompare);
 $('#shopping-download').onclick=()=>{const look=state.lookResults[state.shoppingIndex];if(look)download('fitmystyle-shopping-board.json',JSON.stringify(prepareShoppingPlan(look),null,2))};
 $('#adults-minus').onclick=()=>{state.adults=Math.max(1,state.adults-1);renderMembers();renderLooks()};$('#adults-plus').onclick=()=>{state.adults=Math.min(2,state.adults+1);renderMembers();renderLooks()};
 $('#children-minus').onclick=()=>{state.children=Math.max(0,state.children-1);renderMembers();renderLooks()};$('#children-plus').onclick=()=>{state.children=Math.min(5,state.children+1);renderMembers();renderLooks()};
 $('#style-options').addEventListener('click',e=>{const b=e.target.closest('[data-style]');if(!b)return;state.style=b.dataset.style;renderChoices();renderLooks()});
 $('#palette-options').addEventListener('click',e=>{const b=e.target.closest('[data-palette]');if(!b)return;state.palette=b.dataset.palette;renderChoices();renderLooks()});
 $('#budget').addEventListener('input',e=>{state.budget=Number(e.target.value);$('#budget-display').textContent=fmt(state.budget);renderLooks()});
 $('#generate').onclick=()=>{state.customLooks={};state.activeAlt=null;const brief=parseStyleBrief($('#stylist-brief').value);if(brief.style)state.style=brief.style;if(brief.palette)state.palette=brief.palette;if(brief.budget){state.budget=brief.budget;$('#budget').value=Math.min(900,Math.max(80,state.budget));$('#budget-display').textContent=fmt(state.budget)}if(brief.matching==='identical'){state.matching='identical';$('#matching-mode').value='identical'}if(brief.priority!=='balanced'){state.priority=brief.priority;$('#stylist-priority').value=brief.priority}renderChoices();state.seed++;state.expanded=null;renderLooks();$('#results').scrollIntoView({behavior:'smooth',block:'start'});toast('Wygenerowano kolejne propozycje za darmo')};
 $('#shuffle').onclick=()=>{state.seed++;state.expanded=null;state.customLooks={};state.activeAlt=null;renderLooks()};
 $('#outfits').addEventListener('click',e=>{const preview=e.target.closest('[data-preview-look]');if(preview){const look=state.lookResults[Number(preview.dataset.previewLook)];const it=look?.items.find(x=>x.member.id===preview.dataset.previewPerson&&x.product)||look?.items.find(x=>x.product);if(it){window.dispatchEvent(new CustomEvent('fms:preview',{detail:{member:it.member,product:it.product}}));navigate('mannequin');toast('Wybrano ubranie do technicznego podglądu 3D.')}return}const alt=e.target.closest('[data-alt-look]');if(alt){state.activeAlt=state.activeAlt===`${alt.dataset.altLook}-${alt.dataset.altPerson}`?null:`${alt.dataset.altLook}-${alt.dataset.altPerson}`;renderLooks();return}
 const swap=e.target.closest('[data-swap-product]');if(swap){const idx=Number(swap.dataset.swapLook),look=state.lookResults[idx],replacement=allProducts().find(p=>p.id===swap.dataset.swapProduct);if(!replacement||!look)return;try{const modified=customizeLook(look,swap.dataset.swapPerson,replacement,{style:state.style,palette:state.palette,budget:state.budget,matching:state.matching,priority:state.priority});state.customLooks[`${state.seed}-${idx}`]=modified;state.activeAlt=null;renderLooks();toast('Zmieniono ubranie i przeliczono zestaw')}catch(e){toast(e.message)}return}
 const exp=e.target.closest('[data-expand]');if(exp){const i=Number(exp.dataset.expand);state.expanded=state.expanded===i?null:i;renderLooks();return}
 const b=e.target.closest('[data-export],[data-save],[data-plan]');if(!b)return;
 const i=Number(b.dataset.export??b.dataset.save??b.dataset.plan);const look=state.lookResults[i];if(!look)return;
 if(b.hasAttribute('data-export'))download('fitmystyle-outfit.json',JSON.stringify({app:'FitMyStyle Studio',version:3,notice:'Concepts and imported unverified offers. No purchases made.',look},null,2));
 if(b.hasAttribute('data-plan'))download('fitmystyle-shopping-plan.json',JSON.stringify(prepareShoppingPlan(look),null,2));
 if(b.hasAttribute('data-save')){if(state.saved.length>=100){toast('Limit pamięci 100 zestawów. Zapisz kopię.');return}state.saved.unshift({id:`look-${Date.now()}-${i}`,savedAt:new Date().toISOString(),title:`${PALETTES[state.palette].name} · ${STYLES[state.style].name}`,look:JSON.parse(JSON.stringify(look))});saveLookbook();toast('Zapisano zestaw do lookbooka');}
 });
 ['#design-message','#design-bg','#design-ink'].forEach(s=>$(s).addEventListener('input',updateDesigner));
 $('#download-svg').onclick=()=>{download('fitmystyle-custom-print-transparent.svg',printArtwork(printSettings()),'image/svg+xml;charset=utf-8');toast('Pobrano wektorowy nadruk SVG (bez tła)')};
 $('#product-import').addEventListener('change',e=>processImport(e.target.files?.[0]));
 $('#feed-load').onclick=async()=>{try{await loadRemoteFeed()}catch(e){$('#feed-status').textContent='Nie udało się: '+e.message;toast(e.message)}};
 $('#feed-example').onclick=()=>{const example='id,name,gender,product_type,color,size,price,currency,link,availability\nS1,Women sage blouse,women,clothing,sage,M,29,EUR,https://example.com/women-blouse,in stock\nS2,Men navy shirt,men,clothing,navy,L,35,EUR,https://example.com/men-shirt,in stock\nS3,Kids rose hoodie,kids,clothing,pink,4Y,22,EUR,https://example.com/kid-hoodie,in stock';acceptFeed(example,{source:'PRÓBKA — NIE SPRZEDAWANE',persist:false}).catch(e=>toast(e.message))};
 $('#catalog-filter').addEventListener('change',()=>{state.catalogLimit=24;renderCatalog()});
 $('#clear-imports').onclick=async()=>{if(!confirm('Usunąć całą bibliotekę importowaną z tej przeglądarki?'))return;state.imported=[];await save();renderCatalog();renderLooks();$('#import-status').textContent='Usunięto importowane dane.';toast('Biblioteka wyczyszczona')};
 $('#download-template').onclick=()=>download('fitmystyle-products-template.csv','id,name,role,style,color,price,palette,size,source,sourceUrl,sku,description,shipping,stock,currency,imageUrl\nSKU1001,"Linen family set",woman,holiday,cream,49,sand,M,Partner store,https://shop.example/product,SKU1001,"Authorized catalog listing",6,unknown,EUR,https://shop.example/photo.jpg\n','text/csv;charset=utf-8');
 $('#stylist-brief').addEventListener('input',()=>{const result=parseStyleBrief($('#stylist-brief').value);$('#brief-feedback').textContent=result.notes.length?'Rozpoznano: '+result.notes.join(' · '):'Wpisz okazję, kolory lub budżet — podpowiemy ustawienia.'});
 $$('.brief-chips [data-brief]').forEach(b=>b.addEventListener('click',()=>{$('#stylist-brief').value=b.dataset.brief;$('#stylist-brief').dispatchEvent(new Event('input'))}));
 $('#matching-mode').addEventListener('change',e=>{state.matching=e.target.value;renderLooks()});
 $('#stylist-priority').addEventListener('change',e=>{state.priority=e.target.value;renderLooks()});
 $('#real-only').addEventListener('change',e=>{state.realOnly=e.target.checked;renderLooks()});
 $('#member-chips').addEventListener('change',e=>{const el=e.target;if(el.dataset.sizeId)state.sizes[el.dataset.sizeId]=el.value;if(el.dataset.nameId)state.labels[el.dataset.nameId]=el.value.trim().slice(0,24)||'Family member';savePrefs();renderLooks()});
 $('#design-theme').addEventListener('change',updateDesigner);
 $('#design-subline').addEventListener('input',updateDesigner);
 $('#download-print-tech').onclick=()=>download('fitmystyle-print-techpack.json',JSON.stringify(printTechnicalPack(printSettings()),null,2));
 $('#catalog-search').addEventListener('input',()=>{state.catalogLimit=24;renderCatalog()});$('#catalog-role').addEventListener('change',()=>{state.catalogLimit=24;renderCatalog()});$('#catalog-more').onclick=()=>{state.catalogLimit+=24;renderCatalog()};
 $('#saved-outfits').addEventListener('click',e=>{const b=e.target.closest('[data-saved-plan],[data-saved-remove],[data-saved-export]');if(!b)return;
 const i=Number(b.dataset.savedPlan??b.dataset.savedRemove??b.dataset.savedExport);const entry=state.saved[i];if(!entry)return;
 if(b.hasAttribute('data-saved-remove')){state.saved.splice(i,1);saveLookbook();renderSaved();toast('Usunięto zapisany zestaw');return}
 if(b.hasAttribute('data-saved-plan'))download('fitmystyle-shopping-plan.json',JSON.stringify(prepareShoppingPlan(entry.look),null,2));
 if(b.hasAttribute('data-saved-export'))download('fitmystyle-saved-look.json',JSON.stringify(entry,null,2));
 });
 $('#backup-data').onclick=()=>download('fitmystyle-private-backup.json',JSON.stringify({app:'FitMyStyle Studio',version:3,exportedAt:new Date().toISOString(),saved:state.saved,imported:state.imported,wardrobe:state.wardrobe,sizes:state.sizes,labels:state.labels},null,2));
 $('#restore-data').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>3*1024*1024)throw Error('Max 3 MB');const data=JSON.parse(await f.text());if(!['FitMyStyle Studio','FamilyLook Studio'].includes(data.app)||data.version!==3||!Array.isArray(data.saved)||!Array.isArray(data.imported))throw Error('Niepoprawna kopia FitMyStyle lub FamilyLook v3');if(data.saved.length>100||data.imported.length>5000)throw Error('Backup too large');const imported=data.imported.map(validateProduct);if(!confirm(`Przywrócić ${data.saved.length} zestawów i ${imported.length} produktów? Zastąpi to obecne lokalne dane.`))return;state.saved=data.saved.filter(x=>x&&x.look&&Array.isArray(x.look.items)).slice(0,100);state.imported=imported;state.wardrobe=Array.isArray(data.wardrobe)?validateWardrobe(data.wardrobe):state.wardrobe;saveWardrobe();state.sizes=data.sizes||{};state.labels=data.labels||{};saveLookbook();savePrefs();await save();renderMembers();renderWardrobe();renderLooks();renderSaved();toast('Przywrócono kopię danych.');}catch(err){toast('Niepoprawna kopia: '+err.message)}finally{e.target.value=''}});
 $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));
 $('#ai-interpret').onclick=async()=>{const brief=$('#stylist-brief').value.trim();if(!brief){toast('Najpierw napisz opis stylizacji');return}const button=$('#ai-interpret');button.disabled=true;$('#brief-feedback').textContent='Lokalny model AI interpretuje opis…';try{const intent=await interpretBriefWithBrowserAI(brief);if(intent.style)state.style=intent.style;if(intent.palette)state.palette=intent.palette;if(intent.budget){state.budget=intent.budget;$('#budget').value=Math.max(80,Math.min(900,state.budget));$('#budget-display').textContent=fmt(state.budget)}if(intent.matching){state.matching=intent.matching;$('#matching-mode').value=intent.matching}if(intent.priority){state.priority=intent.priority;$('#stylist-priority').value=intent.priority}renderChoices();renderLooks();$('#brief-feedback').textContent='Interpretacja AI: '+(intent.rationale||'Ustawienia dopasowane. Sprawdź wyniki.')}catch(e){$('#brief-feedback').textContent='AI niedostępne: '+e.message+'. Nadal możesz używać darmowego optymalizatora.'}finally{const status=await getBrowserAIStatus();button.disabled=!status.available}};
 $('#ai-explain').onclick=async()=>{const button=$('#ai-explain');const look=state.lookResults[0];if(!look){toast('Najpierw wygeneruj stylizacje');return}button.disabled=true;$('#ai-explanation').textContent='AI analizuje wybrany zestaw lokalnie…';try{$('#ai-explanation').textContent=await explainWithBrowserAI({brief:$('#stylist-brief').value,look,style:state.style,palette:state.palette})}catch(e){$('#ai-explanation').textContent=`Model AI niedostępny: ${e.message}. Lokalny optymalizator nadal działa.`}finally{const status=await getBrowserAIStatus();button.disabled=!status.available}};

}
$('#design-theme').innerHTML=PRINT_THEMES.map(x=>`<option value="${x.id}">${safeText(x.name)} — ${safeText(x.hint)}</option>`).join('');
renderHero();renderMembers();renderChoices();renderLooks();renderCatalog();renderSaved();renderWardrobe();renderDashboard();updateDesigner();bind();initializePatternStudio();hydrateCatalog();loadSitePublishedCatalog();
catalogRadar=initCatalogRadar({getProducts:allRealProducts});
getBrowserAIStatus().then(status=>{$('#ai-status').textContent=status.message;$('#ai-explain').disabled=!status.available;$('#ai-interpret').disabled=!status.available}).catch(()=>{$('#ai-status').textContent='Model na urządzeniu niedostępny; optymalizator działa.'});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});

// Auth bridge exposes only validated user-owned application data (no arbitrary backend access).
window.FitMyStyleBridge = {
  navigate,
  exportData:()=>({app:'FitMyStyle Studio',version:3,saved:state.saved,imported:state.imported,wardrobe:state.wardrobe,sizes:state.sizes,labels:state.labels,patternProfiles:JSON.parse(guestStorage.getItem('fitmystyle-independent-pattern-profiles-v2')||'{}')}),
  importData:async data=>{if(!data||!Array.isArray(data.saved)||!Array.isArray(data.imported)||!Array.isArray(data.wardrobe))throw Error('Niepoprawna kopia konta');state.saved=data.saved.filter(x=>x?.look&&Array.isArray(x.look.items)).slice(0,100);state.imported=data.imported.slice(0,5000).map(validateProduct);state.wardrobe=validateWardrobe(data.wardrobe);state.sizes=data.sizes&&typeof data.sizes==='object'?data.sizes:{};state.labels=data.labels&&typeof data.labels==='object'?data.labels:{};if(data.patternProfiles&&typeof data.patternProfiles==='object'&&!Array.isArray(data.patternProfiles))guestStorage.setItem('fitmystyle-independent-pattern-profiles-v2',JSON.stringify(data.patternProfiles));saveLookbook();saveWardrobe();savePrefs();await save();renderMembers();renderWardrobe();renderLooks();renderSaved();renderCatalog();},
  clearData:async()=>{state.saved=[];state.imported=[];state.wardrobe=[];state.sizes={};state.labels={};guestStorage.removeItem('fitmystyle-independent-pattern-profiles-v2');saveLookbook();saveWardrobe();savePrefs();await save();renderMembers();renderWardrobe();renderLooks();renderSaved();renderCatalog();}
};