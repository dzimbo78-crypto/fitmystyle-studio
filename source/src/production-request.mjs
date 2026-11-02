/** Independent admin-only manual enquiry routing: no payment and no automatic supplier order. */
import {calculateGarment,getTechnicalPack} from './garment-engine.mjs';
export const ADMIN_CONTACT='przemyslaw.bugajski78@gmail.com';
export const SUBMISSION_CHANNEL='formsubmit';
export function buildProductionEnquiry(form,config){
 const get=k=>String(form?.[k]??'').trim();
 const name=get('name').slice(0,120),email=get('email').slice(0,254),note=get('note').slice(0,2000);
 if(name.length<2)throw Error('Podaj imię lub nazwę kontaktową.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Podaj prawidłowy adres e-mail.');
 if(note.length<10)throw Error('Opisz zamówienie lub pytanie (co najmniej 10 znaków).');
 if(form?.consent!==true)throw Error('Potwierdź zgodę na przesłanie zapytania i danych kontaktowych do obsługi przez administratora.');
 const tech=getTechnicalPack(config);const compact={type:tech.type,bodyType:tech.bodyType,fit:tech.fit,fabric:tech.fabric,garment:tech.garment,ease:tech.ease,sleeveCm:tech.sleeveCm,seamAllowanceCm:tech.seamAllowanceCm,pattern:String(config?.pattern||'solid').slice(0,50),colour:String(config?.color||'').slice(0,9),productionStatus:tech.productionStatus};
 // The body measurements are excluded from third-party delivery unless separately opted in.
 if(form?.includeMeasures===true)compact.body=tech.body;
 const reference=`FMS-${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}`;
 return {reference,name,email,note,compact,subject:`FitMyStyle — zapytanie do administratora ${reference}`,message:`FitMyStyle / ZAPYTANIE DO RĘCZNEJ WERYFIKACJI\nID: ${reference}\nKontakt: ${name} <${email}>\nOpis: ${note}\n\nProjekt (koncepcja, nie zatwierdzony wykrój):\n${JSON.stringify(compact,null,2)}\n\nBrak płatności. Nie jest to zamówienie ani zlecenie do szwalni.`};
}
export function initProductionRequests({readConfig}={}){
 const panel=document.getElementById('production-enquiry');if(!panel)return;
 const open=()=>{panel.hidden=false;document.getElementById('production-name')?.focus();};
 const close=()=>{panel.hidden=true};
 document.querySelectorAll('[data-production-request]').forEach(el=>el.addEventListener('click',open));
 document.getElementById('production-close')?.addEventListener('click',close);
 panel.addEventListener('click',e=>{if(e.target===panel)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
 const form=document.getElementById('production-form');const status=document.getElementById('production-status');
 let last=null;
 const config=()=>readConfig?.()??Object.fromEntries(['cut','body','fit','fabric','sleeve','color','pattern','height','chest','waist','hip'].map(k=>[k,document.getElementById('atelier-'+k)?.value]));
 function info(message,bad=false){status.textContent=message;status.dataset.error=bad?'true':'false'}
 form?.addEventListener('submit',async e=>{
   e.preventDefault();const btn=document.getElementById('production-send');
   try{
     const data=buildProductionEnquiry({name:form.elements.namedItem('name').value,email:form.elements.namedItem('email').value,note:form.elements.namedItem('note').value,consent:form.elements.namedItem('consent').checked,includeMeasures:form.elements.namedItem('includeMeasures').checked},config());last=data;
     const payload={name:data.name,email:data.email,_subject:data.subject,_template:'table',_captcha:'true',reference:data.reference,description:data.note,concept_specification:JSON.stringify(data.compact),message:data.message};
     info('Przesyłanie zapytania do bramki e-mail…');btn.disabled=true;
     const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
     let response;try{response=await fetch('https://formsubmit.co/ajax/'+ADMIN_CONTACT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});}finally{clearTimeout(timeout)}
     const result=await response.json().catch(()=>({}));
     if(!response.ok||result.success===false||result.success==='false')throw Error('Bramka e-mail nie przyjęła zapytania.');
     info(`Bramka przyjęła formularz (${data.reference}). Pierwsze użycie wymaga potwierdzenia adresu przez administratora — do czasu potwierdzenia doręczenie NIE jest gwarantowane. Zachowaj kopię zapytania.`);
   }catch(err){info('Nie udało się potwierdzić przekazania zapytania: '+String(err.message||err)+'. Użyj przycisku „Otwórz e-mail” lub pobierz plik projektu.',true)}
   finally{btn.disabled=false}
 });
 document.getElementById('production-mailto')?.addEventListener('click',()=>{
   try{const d=last||buildProductionEnquiry({name:form.elements.namedItem('name').value,email:form.elements.namedItem('email').value,note:form.elements.namedItem('note').value,consent:form.elements.namedItem('consent').checked,includeMeasures:form.elements.namedItem('includeMeasures').checked},config());
    location.href='mailto:'+ADMIN_CONTACT+'?subject='+encodeURIComponent(d.subject)+'&body='+encodeURIComponent(d.message.slice(0,16000));info('Otworzono klienta pocztowego. Sprawdź wiadomość i wyślij ją samodzielnie.');
   }catch(err){info(String(err.message||err),true)}
 });
 document.getElementById('production-download')?.addEventListener('click',()=>{
   try{const d=last||buildProductionEnquiry({name:form.elements.namedItem('name').value,email:form.elements.namedItem('email').value,note:form.elements.namedItem('note').value,consent:form.elements.namedItem('consent').checked,includeMeasures:form.elements.namedItem('includeMeasures').checked},config());
     const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=d.reference+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);info('Pobrano zapytanie JSON do dalszej korespondencji.');
   }catch(err){info(String(err.message||err),true)}
 });
}