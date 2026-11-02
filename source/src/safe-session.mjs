/** Guests: sessionStorage per browser tab; in-memory fallback where storage is blocked. */
const volatile=new Map();
const memory={getItem:k=>volatile.has(k)?volatile.get(k):null,setItem:(k,v)=>volatile.set(k,String(v)),removeItem:k=>volatile.delete(k),clear:()=>volatile.clear(),key:i=>[...volatile.keys()][i]||null,get length(){return volatile.size}};
export const guestStorage=(()=>{try{const s=globalThis.sessionStorage;const probe='__fms_session_test';s.setItem(probe,'1');s.removeItem(probe);return s}catch{return memory}})();