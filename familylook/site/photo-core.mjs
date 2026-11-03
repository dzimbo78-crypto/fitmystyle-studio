import {clamp} from './scene-model.mjs';
export const shadeFactor=l=>clamp(Math.pow(l/239,1.42),.16,1.07);
export function shadeChannel(c,l){return Math.round(clamp(c*shadeFactor(l)+Math.max(0,(l-246)/9)*6*(1-c/255),0,255));}
export function inkChannel(under,ink,lum,alpha){const a=clamp(alpha,0,1)*.96;return Math.round(clamp(under*(1-a)+shadeChannel(ink,lum)*a,0,255));}
export function designText(a){const t=String(a.text||'').slice(0,38);if(a.layout!=='monogram')return t;const w=t.trim().split(/\s+/);return (w.length>1?w.slice(0,3).map(x=>x[0]).join(''):t.slice(0,3)).toLocaleUpperCase();}
export const artworkVisible=(a,side)=>a.enabled!==false&&(a.position||'front')===side;
