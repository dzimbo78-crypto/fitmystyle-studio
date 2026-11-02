import {suggestedSources,approvalRequest,sourceConfiguration,catalogReadiness} from './source-discovery.mjs';
import {safeText} from './core.mjs';
const $=s=>document.querySelector(s);
function saveText(filename,content,type='text/plain;charset=utf-8'){
 const link=document.createElement('a');const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
}
function readInputs(){return {name:$('#radar-shop-name').value.trim(),website:$('#radar-site').value.trim(),licenseReference:$('#radar-license').value.trim(),contact:$('#radar-contact').value.trim()}}
function displayMessage(message,kind='info'){const el=$('#radar-message');el.textContent=message;el.dataset.kind=kind}
export function initCatalogRadar({getProducts}={}){
 let candidates=[];let chosen=null;
 const inspect=()=>{
  const info=readInputs();candidates=suggestedSources(info.website);chosen=null;
  $('#radar-candidates').innerHTML=candidates.map((c,i)=>`<article class="radar-candidate"><div><strong>${safeText(c.name)}</strong><small>${safeText(c.note)}</small>${c.url?`<code>${safeText(c.url)}</code>`:''}</div><button class="secondary-button" type="button" data-radar-candidate="${i}">${c.id==='partner'?'Użyj feedu partnera':'Wybierz źródło'}</button></article>`).join('');
  displayMessage('Znaleziono cztery metody integracji. Ich dostępności jeszcze nie potwierdzono. Wybierz metodę i przetestuj ją w istniejącym importerze.');
 };
 $('#radar-analyze').addEventListener('click',()=>{try{inspect()}catch(e){displayMessage(e.message,'error')}});
 $('#radar-candidates').addEventListener('click',e=>{
  const button=e.target.closest('[data-radar-candidate]');if(!button)return;
  chosen=candidates[Number(button.dataset.radarCandidate)];if(!chosen)return;
  $('#feed-source').value=readInputs().name||new URL(readInputs().website).hostname;
  $('#feed-kind').value=chosen.kind==='woo'?'woocommerce':chosen.kind==='shopify'?'shopify':'feed';
  $('#feed-url').value=chosen.url;
  $('#feed-kind').dispatchEvent(new Event('change'));
  displayMessage(chosen.id==='partner'?'Poproś dostawcę o feed CSV/XML/JSON i wpisz jego URL w sekcji Importuj katalog.':'Przeniesiono propozycję do importera. Potwierdź zgodę dostawcy przed pobraniem.');
 });
 $('#radar-test').addEventListener('click',()=>{
  if(!chosen||!$('#feed-url').value.trim()){displayMessage('Wybierz jedno z wykrytych źródeł i podaj poprawny adres feedu.','error');return}
  if(!$('#radar-permission').checked){displayMessage('Przed pobraniem i importem potwierdź prawo do wykorzystania oferty.','error');return}
  $('#feed-permission').checked=true;
  displayMessage('Przekazuję żądanie do istniejącego importera. Przy braku CORS użyj zatwierdzonego feedu jako pliku albo synchronizacji serwerowej z ZIP.');
  $('#feed-load').click();
 });
 $('#radar-request').addEventListener('click',()=>{try{const x=readInputs();saveText('fitmystyle-prosba-o-katalog.txt',approvalRequest(x));displayMessage('Przygotowano wiadomość do dostawcy — możesz ją wysłać z własnej poczty.')}catch(e){displayMessage(e.message,'error')}});
 $('#radar-manifest').addEventListener('click',()=>{
  try{const x=readInputs();if(!$('#radar-permission').checked)throw Error('Najpierw potwierdź rzeczywistą zgodę na publikację');
   const feed=$('#feed-url').value.trim();if(!feed)throw Error('Wybierz i wpisz adres źródła produktów w importerze');
   const kind=$('#feed-kind').value==='woocommerce'?'woo':$('#feed-kind').value==='shopify'?'shopify':'feed';
   const format=kind==='woo'?'woocommerce':kind==='shopify'?'shopify':'auto';
   const source=sourceConfiguration({name:x.name,feedUrl:feed,licenseReference:x.licenseReference,kind,format,currency:$('#feed-currency').value,maxPages:Number($('#feed-pages').value)});
   saveText('licensed-feeds.json',JSON.stringify({sources:[source]},null,2)+'\n','application/json');displayMessage('Manifest gotowy. Do synchronizacji dodaj tylko w nowym repozytorium FitMyStyle, nie do innych projektów.');
  }catch(e){displayMessage(e.message,'error')}
 });
 $('#radar-refresh').addEventListener('click',updateStatus);
 function updateStatus(){const r=catalogReadiness(getProducts?.()||[]);$('#radar-coverage').innerHTML=`<strong>${r.total}</strong> ofert zaimportowanych · <strong>${r.counts.woman}/${r.counts.man}/${r.counts.child}</strong> wariantów damskich/męskich/dziecięcych · <strong>${r.ready}</strong> kompletnych rekordów (SKU, zdjęcie, link i zgłoszony stan „in stock”) · ${r.stale} starych importów. <span>Nie oznacza to sprawdzenia ceny ani dostępności na żywo.</span>`;}
 updateStatus();return {updateStatus};
}