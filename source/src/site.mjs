import {guestStorage} from './safe-session.mjs';
const sessionStorage = guestStorage;
/** FitMyStyle independent storefront + optional Supabase Auth. No tokens or service keys are bundled. */
import {initAtelier} from './atelier.mjs';
import {initProductionRequests} from './production-request.mjs';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from '../site-config.mjs';
const $=selector=>document.querySelector(selector);
const site=$('#public-site'),shell=$('#fms-app-shell'),modal=$('#fms-auth-modal');
let logged=null,accessToken=null,signup=false,saveTimer=0,loadingCloud=false;
const configured=Boolean(SUPABASE_URL?.startsWith('https://')&&SUPABASE_ANON_KEY?.length>25);
const api=path=>SUPABASE_URL.replace(/\/$/,'')+path;
const publicHeaders={'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json'};
function status(message){$('#auth-status').textContent=message}
/* One product surface: the landing and every studio module keep the SAME main navigation. */
const footer=site.querySelector('.public-footer');if(shell.parentElement!==site)site.insertBefore(shell,footer);
function highlightTab(name){document.querySelectorAll('.public-menu [data-open-page]').forEach(node=>{const active=node.dataset.openPage===name;node.classList.toggle('selected',active);if(active)node.setAttribute('aria-current','page');else node.removeAttribute('aria-current')})}
function showLanding(){site.hidden=false;shell.hidden=true;site.classList.remove('studio-mode');sessionStorage.setItem('fms-page','landing');highlightTab('landing');document.title='FitMyStyle — Twój styl. Idealne dopasowanie.';window.scrollTo(0,0)}
function openPage(name){if(name==='landing'){showLanding();return}site.hidden=false;shell.hidden=false;site.classList.add('studio-mode');sessionStorage.setItem('fms-page',name);window.FitMyStyleBridge?.navigate(name);highlightTab(name);document.title='FitMyStyle · '+name;window.scrollTo(0,0)}
function showModal(){modal.hidden=false;$('#auth-email').focus();status(configured?'':'Konta online nie są jeszcze aktywowane. Administrator musi skonfigurować niezależny projekt uwierzytelniania.');$('#auth-submit').disabled=!configured}
function hideModal(){modal.hidden=true}
function setAccount(user){logged=user||null;$('#account-label').textContent=logged?(logged.email?.split('@')[0]||'Moje konto'):'Zaloguj';$('#auth-description').textContent=logged?'Twoje projekty są synchronizowane z prywatnym kontem.':'Zaloguj się, aby zachować projekty online i korzystać z nich na innych urządzeniach.';$('#auth-form').hidden=Boolean(logged);$('#auth-mode').hidden=Boolean(logged);$('#auth-reset').hidden=Boolean(logged);$('#auth-logout').hidden=!logged}
async function authFetch(path,{method='GET',body=null,token=accessToken,prefer=null}={}){
 if(!configured)throw Error('Nie skonfigurowano kont online.');const r=await fetch(api(path),{method,headers:{...publicHeaders,...(token?{'Authorization':'Bearer '+token}:{}),...(prefer?{'Prefer':prefer}:{})},body:body===null?undefined:JSON.stringify(body)});
 const result=await r.json().catch(()=>({}));if(!r.ok)throw Error(result.msg||result.error_description||result.message||`Usługa kont: HTTP ${r.status}`);return result
}
async function cloudLoad(){if(!logged||!accessToken||!window.FitMyStyleBridge)return;loadingCloud=true;try{const res=await authFetch('/rest/v1/user_studio?select=payload&user_id=eq.'+encodeURIComponent(logged.id));if(Array.isArray(res)&&res.length&&res[0].payload)await window.FitMyStyleBridge.importData(res[0].payload);else await cloudSave();}finally{loadingCloud=false}}
async function cloudSave(){if(!logged||!accessToken||loadingCloud||!window.FitMyStyleBridge)return;const payload=window.FitMyStyleBridge.exportData();try{await authFetch('/rest/v1/user_studio?on_conflict=user_id',{method:'POST',body:{user_id:logged.id,payload,updated_at:new Date().toISOString()},prefer:'resolution=merge-duplicates,return=minimal'});status('Twoje projekty zapisano na koncie.')}catch(err){console.warn('FitMyStyle cloud sync:',err.message);status('Nie udało się zapisać online: '+err.message)}}
async function login(email,password){const result=await authFetch('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},token:null});if(!result.access_token||!result.user?.id)throw Error('Nie otrzymano sesji konta.');accessToken=result.access_token;sessionStorage.setItem('fms-auth',JSON.stringify({access_token:result.access_token,refresh_token:result.refresh_token,expires_at:Date.now()+Number(result.expires_in||3600)*1000}));setAccount(result.user);await cloudLoad();status('Zalogowano. Twoje projekty są dostępne na tym koncie.');}
async function register(email,password){await authFetch('/auth/v1/signup',{method:'POST',body:{email,password},token:null});status('Jeśli serwer wymaga potwierdzenia e-mail, sprawdź skrzynkę. Następnie się zaloguj.');signup=false;updateAuthMode()}
function updateAuthMode(){$('#auth-submit').textContent=signup?'Zarejestruj':'Zaloguj';$('#auth-mode').textContent=signup?'Masz już konto? Zaloguj się':'Nie masz konta? Zarejestruj się'}
async function logout(){if(accessToken)try{await authFetch('/auth/v1/logout',{method:'POST'})}catch{}accessToken=null;sessionStorage.removeItem('fms-auth');setAccount(null);await window.FitMyStyleBridge?.clearData();status('Wylogowano. Włączono prywatny tryb gościa.');showLanding()}
async function restoreLogin(){if(!configured)return;try{const item=JSON.parse(sessionStorage.getItem('fms-auth')||'null');if(!item?.access_token)return;accessToken=item.access_token;let u=await authFetch('/auth/v1/user');setAccount(u);await cloudLoad()}catch{accessToken=null;sessionStorage.removeItem('fms-auth');setAccount(null)}}
$('#public-auth-button').addEventListener('click',showModal);$('#footer-auth').addEventListener('click',showModal);$('#auth-close').addEventListener('click',hideModal);modal.addEventListener('click',e=>{if(e.target===modal)hideModal()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)hideModal()});
$('#auth-mode').addEventListener('click',()=>{signup=!signup;updateAuthMode();status('')});$('#auth-reset').addEventListener('click',async()=>{const email=$('#auth-email').value.trim();if(!email){status('Podaj adres e-mail do odzyskania hasła.');return}try{await authFetch('/auth/v1/recover',{method:'POST',body:{email},token:null});status('Jeżeli konto istnieje, wysłano instrukcję resetowania hasła.')}catch(err){status(err.message)}});$('#auth-logout').addEventListener('click',logout);
$('#auth-form').addEventListener('submit',async e=>{e.preventDefault();const email=$('#auth-email').value.trim(),password=$('#auth-password').value;const btn=$('#auth-submit');btn.disabled=true;status('Łączenie z serwerem kont…');try{if(signup)await register(email,password);else{await login(email,password);hideModal()}}catch(err){status(err.message)}finally{btn.disabled=!configured}});
document.querySelectorAll('[data-open-page]').forEach(btn=>btn.addEventListener('click',()=>openPage(btn.dataset.openPage)));document.querySelectorAll('[data-home]').forEach(btn=>btn.addEventListener('click',showLanding));
document.addEventListener('fms:navigation',ev=>{if(!shell.hidden){sessionStorage.setItem('fms-page',ev.detail.page);highlightTab(ev.detail.page)}});
document.addEventListener('fms:changed',()=>{if(logged&&!loadingCloud){clearTimeout(saveTimer);saveTimer=setTimeout(cloudSave,1200)}});
window.addEventListener('beforeunload',()=>{clearTimeout(saveTimer)});
const previous=sessionStorage.getItem('fms-page')||'landing';if(previous==='landing')showLanding();else openPage(previous);
initAtelier();initProductionRequests();restoreLogin();

/** Privacy center: only FitMyStyle-owned keys in this origin are removed. */
function downloadGuestBackup(){
 const data=window.FitMyStyleBridge?.exportData?.();if(!data){status('Studio nie jest jeszcze załadowane.');return}
 const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fitmystyle-kopia-sesji.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1800);
}
async function endGuestSession(){
 if(logged){showModal();status('Najpierw wyloguj się z konta, aby zakończyć sesję użytkownika.');return}
 if(!window.confirm('Wyczyścić wszystkie projekty, ubrania, wymiary i katalogi zapisane w tej sesji? Tej operacji nie można cofnąć.'))return;
 await window.FitMyStyleBridge?.clearData?.();
 const keys=[];for(let i=0;i<sessionStorage.length;i++){const key=sessionStorage.key(i);if(key && (key.startsWith('fitmystyle-')||key.startsWith('fms-')))keys.push(key)}
 keys.forEach(key=>sessionStorage.removeItem(key));showLanding();
 const toast=document.getElementById('toast');if(toast){toast.textContent='Dane sesji zostały wyczyszczone.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500)}
}
$('#footer-session-export')?.addEventListener('click',downloadGuestBackup);
$('#footer-session-reset')?.addEventListener('click',endGuestSession);
$('#studio-session-reset')?.addEventListener('click',endGuestSession);

/* In-place home styling demo: entirely local, no bogus pricing or stock. */
let homeColor='#d8c3a4';
function homePreview(){const n=Number($('#home-family')?.value||4),occasion=$('#home-occasion')?.value||'casual';const container=$('#home-mix-people');if(!container)return;
 const label={casual:'casual',elegant:'elegancka',vacation:'wakacje',winter:'jesień/zima'}[occasion];$('#home-live-description').textContent=n+' os. · '+label;
 const people=Array.from({length:n},(_,i)=>{const child=i>=2,scale=child?'.76':'1',pant=occasion==='elegant'?'#35312d':occasion==='vacation'?'#c5ad85':'#676a64';return `<div class="home-look" style="--person-scale:${scale}"><svg viewBox="0 0 100 170" role="img" aria-label="Poglądowy ubiór osoby ${i+1}"><ellipse cx="50" cy="18" rx="13" ry="16" fill="#c9a98f"/><path d="M32 35 Q23 38 18 47 L9 91 Q12 97 20 94 L32 66 L32 108 Q50 114 68 108 L68 66 L80 94 Q88 97 91 91 L82 47 Q77 38 68 35 L58 31 Q50 40 42 31 Z" fill="${homeColor}" stroke="#85715a" stroke-width=".8"/><path d="M32 108 L31 160 L47 160 L50 116 L53 160 L69 160 L68 108Z" fill="${pant}"/><path d="M32 68 Q50 74 68 68" fill="none" stroke="#ffffff77" stroke-width="1.4"/></svg><span>${child?'Dziecko '+(i-1):i?'Partner':'Ja'}</span></div>`});
 container.innerHTML=people.join('');
}
$('#home-family')?.addEventListener('change',homePreview);$('#home-occasion')?.addEventListener('change',homePreview);
document.querySelectorAll('.home-color-palette [data-palette]').forEach(btn=>btn.addEventListener('click',()=>{homeColor=btn.dataset.palette;document.querySelectorAll('.home-color-palette button').forEach(b=>b.classList.toggle('selected',b===btn));homePreview()}));
$('#home-send-to-studio')?.addEventListener('click',()=>openPage('studio'));homePreview();