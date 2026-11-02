/** Twenty original FitMyStyle textile concepts. Pure canvas vectors; no third-party patterns or licensed logos. */
export const TEXTILE_PATTERNS=Object.freeze([
 {id:'solid',name:'Gładki premium',group:'Minimalistyczne',description:'Jednolita powierzchnia z subtelną strukturą'},
 {id:'micro-herringbone',name:'Mikrojodełka',group:'Klasyczne',description:'Drobny splot inspirowany tkaniną garniturową'},
 {id:'fine-pinstripe',name:'Cienki prążek',group:'Klasyczne',description:'Wąski pionowy rytm koszulowy'},
 {id:'shadow-windowpane',name:'Krata okienna',group:'Klasyczne',description:'Dyskretne ramy na delikatnej tkaninie'},
 {id:'micro-gingham',name:'Mini vichy',group:'Klasyczne',description:'Drobna koszulowa kratka'},
 {id:'soft-houndstooth',name:'Pepitka soft',group:'Klasyczne',description:'Minimalistyczna, łagodna pepitka'},
 {id:'cable-knit',name:'Warkocz dzianinowy',group:'Dzianiny',description:'Pionowy motyw warkoczowy swetra'},
 {id:'fisherman-rib',name:'Prążek rybacki',group:'Dzianiny',description:'Gruby rytm pionowych oczek'},
 {id:'waffle-knit',name:'Dzianina waflowa',group:'Dzianiny',description:'Delikatna struktura wypukłej kratki'},
 {id:'seed-stitch',name:'Ryżowy ścieg',group:'Dzianiny',description:'Powtarzalne drobne oczka'},
 {id:'fair-isle',name:'Nordic Fair Isle',group:'Dzianiny',description:'Autorski pas geometrycznych rombów'},
 {id:'argyle',name:'Argyle modern',group:'Dzianiny',description:'Eleganckie ukośne romby'},
 {id:'tonal-chevron',name:'Chevron tonal',group:'Minimalistyczne',description:'Bardzo subtelny wzór szewronowy'},
 {id:'micro-dot',name:'Mikropunkty',group:'Minimalistyczne',description:'Drobny uporządkowany deseń'},
 {id:'birdseye',name:'Ptasie oczko',group:'Minimalistyczne',description:'Techniczny, drobny wzór optyczny'},
 {id:'heather-melange',name:'Melanż atelier',group:'Minimalistyczne',description:'Dwutonowy efekt przędzy'},
 {id:'linen-slub',name:'Len slub',group:'Naturalne',description:'Nieregularna faktura lnianej nitki'},
 {id:'twill-diagonal',name:'Diagonal twill',group:'Naturalne',description:'Ukośne prążki tkaniny'},
 {id:'breton-stripe',name:'Bretońskie pasy',group:'Naturalne',description:'Równe poziome paski casual'},
 {id:'botanical-line',name:'Botaniczny kontur',group:'Autorskie',description:'Abstrakcyjne cienkie listki bez kopiowania printów'},
 {id:'architect-grid',name:'Architect grid',group:'Autorskie',description:'Dyskretny techniczny raster'},
]);
export const getPattern=id=>TEXTILE_PATTERNS.find(x=>x.id===id)||TEXTILE_PATTERNS[0];
export function drawTextileTile(canvas,id,baseColor='#d8c3a4'){
 const ctx=canvas.getContext('2d');if(!ctx)return canvas;const W=canvas.width=96,H=canvas.height=96;ctx.clearRect(0,0,W,H);const ink=(a=.23)=>`rgba(35,30,26,${a})`,chalk=(a=.18)=>`rgba(255,248,237,${a})`;
 ctx.lineCap='round';const L=(x,y,a,b,c=ink(),w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke()};const D=(x,y,r=1,c=ink())=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
 switch(id){
 case 'solid': for(let i=0;i<90;i++)D((i*37)%96,(i*61)%96,.38,ink(.08));break;
 case 'micro-herringbone':for(let y=-12;y<110;y+=12)for(let x=-12;x<110;x+=14){L(x,y,x+6,y+7,ink(.24));L(x+6,y+7,x+12,y,ink(.24))}break;
 case 'fine-pinstripe':for(let x=4;x<110;x+=18){L(x,0,x,96,ink(.31),1.1);L(x+2,0,x+2,96,chalk(.15))}break;
 case 'shadow-windowpane':for(let x=0;x<=96;x+=32)L(x,0,x,96,ink(.28),1);for(let y=0;y<=96;y+=32)L(0,y,96,y,ink(.28),1);break;
 case 'micro-gingham':for(let x=0;x<96;x+=12){ctx.fillStyle=ink(.065);ctx.fillRect(x,0,6,96)}for(let y=0;y<96;y+=12){ctx.fillStyle=ink(.065);ctx.fillRect(0,y,96,6)}break;
 case 'soft-houndstooth':for(let y=0;y<108;y+=18)for(let x=0;x<108;x+=18){ctx.fillStyle=ink(.23);ctx.beginPath();ctx.moveTo(x,y+3);ctx.lineTo(x+8,y);ctx.lineTo(x+14,y+8);ctx.lineTo(x+7,y+15);ctx.closePath();ctx.fill();L(x+9,y+8,x+17,y+16,ink(.23),2)}break;
 case 'cable-knit':for(let x=4;x<108;x+=21){for(let y=-6;y<108;y+=18){ctx.strokeStyle=ink(.28);ctx.lineWidth=2.1;ctx.beginPath();ctx.bezierCurveTo(x,y,x+16,y+4,x+15,y+14);ctx.stroke();ctx.strokeStyle=chalk(.34);ctx.beginPath();ctx.bezierCurveTo(x+13,y,x-3,y+5,x,y+15);ctx.stroke()}L(x+19,0,x+19,96,ink(.14),1)}break;
 case 'fisherman-rib':for(let x=3;x<104;x+=9){L(x,0,x,96,ink(.22),2.3);L(x+3,0,x+3,96,chalk(.23),1.5)}break;
 case 'waffle-knit':for(let y=0;y<96;y+=12)for(let x=0;x<96;x+=12){ctx.fillStyle=ink(.12);ctx.fillRect(x+2,y+2,8,8);L(x,y,x+12,y,chalk(.19));L(x,y,x,y+12,chalk(.14))}break;
 case 'seed-stitch':for(let y=5;y<96;y+=9)for(let x=5;x<96;x+=9){D(x+((y/9|0)%2)*4,y,1.7,ink(.24));D(x+2,y+2,.7,chalk(.3))}break;
 case 'fair-isle':for(let y=0;y<96;y+=24)for(let x=0;x<96;x+=24){L(x+12,y+3,x+21,y+12,ink(.32),1.7);L(x+21,y+12,x+12,y+21,ink(.32),1.7);L(x+12,y+21,x+3,y+12,ink(.32),1.7);L(x+3,y+12,x+12,y+3,ink(.32),1.7);D(x+12,y+12,2,ink(.4))}break;
 case 'argyle':for(let y=-48;y<144;y+=48)for(let x=-48;x<144;x+=48){L(x+24,y,x+48,y+24,ink(.28),1.5);L(x+48,y+24,x+24,y+48,ink(.28),1.5);L(x+24,y+48,x,y+24,ink(.28),1.5);L(x,y+24,x+24,y,ink(.28),1.5)}break;
 case 'tonal-chevron':for(let y=-8;y<108;y+=16)for(let x=-24;x<108;x+=24){L(x,y,x+12,y+10,ink(.19));L(x+12,y+10,x+24,y,ink(.19))}break;
 case 'micro-dot':for(let y=5;y<100;y+=12)for(let x=5;x<100;x+=12)D(x,y,1.5,ink(.30));break;
 case 'birdseye':for(let y=5;y<104;y+=13)for(let x=5;x<104;x+=13){D(x,y,2,ink(.2));D(x,y,0.8,chalk(.7))}break;
 case 'heather-melange':for(let i=0;i<370;i++){const x=(i*53)%96,y=(i*71)%96;L(x,y,x+3,y-1,i%3?ink(.11):chalk(.23),.9)}break;
 case 'linen-slub':for(let i=0;i<95;i++){const x=(i*29)%96,y=(i*47)%96;L(x,y,x+(i%4)+1,y+((i%3)-1)*1.5,i%2?ink(.16):chalk(.2),.8)}break;
 case 'twill-diagonal':for(let k=-96;k<192;k+=11)L(k,0,k+96,96,ink(.23),1.5);break;
 case 'breton-stripe':for(let y=5;y<96;y+=24){ctx.fillStyle=ink(.32);ctx.fillRect(0,y,96,5)}break;
 case 'botanical-line':for(let y=-8;y<110;y+=35)for(let x=-10;x<110;x+=40){L(x+7,y,x+24,y+28,ink(.2),1);ctx.strokeStyle=ink(.23);ctx.lineWidth=1;for(let t=0;t<3;t++){ctx.beginPath();ctx.ellipse(x+8+t*5,y+8+t*7,3,6,.7,0,Math.PI*2);ctx.stroke()}}break;
 case 'architect-grid':for(let x=0;x<96;x+=24)L(x,0,x,96,ink(.2),.9);for(let y=0;y<96;y+=24)L(0,y,96,y,ink(.2),.9);for(let x=12;x<96;x+=24)for(let y=12;y<96;y+=24)D(x,y,1.3,ink(.3));break;
 }
 return canvas;
}
export function makeTextilePreview(id,hex='#d8c3a4'){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');drawTextileTile(c,id,hex);return c;
}