/** Dependency-free, client-side PDF A4 tiling: all geometry in millimeters, no rasterization.
 * Each sheet has a fixed 180 x 260 mm tile plus 50 mm calibration ruler.
 */
const mm2pt=n=>n*72/25.4;
const n=x=>Number(x).toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
const ascii=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'?');
const quote=s=>ascii(s).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
function vector(pts,p,ox,oy){let out='';for(let i=0;i<pts.length;i++){const x=mm2pt(15+pts[i][0]+p.offsetX-ox),y=mm2pt(277-(pts[i][1]+p.offsetY-oy));out+=`${n(x)} ${n(y)} ${i?'l':'m'}\n`;}return out+'h S\n';}
export function exportTiledA4Pdf(draft){if(!draft?.pieces?.length)throw Error('No draft pattern');const tileW=180,tileH=260;const cols=Math.ceil(draft.width/tileW),rows=Math.ceil(draft.height/tileH);const pages=[];const count=cols*rows;if(count>90)throw Error(`Draft requires ${count} pages; choose shorter dimensions`);
for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
const ox=col*tileW,oy=row*tileH;let stream='0.5 w 0 0 0 RG 0 0 0 rg\n';
stream+='BT /F1 10 Tf 42 812 Td (FitMyStyle  |  PATTERN DRAFT  |  CHECK FIT) Tj ET\n';
stream+=`BT /F1 8 Tf 42 797 Td (${quote(draft.design.name)}  -  ${col+1}/${cols} x ${row+1}/${rows}  -  Page ${pages.length+1}/${count}) Tj ET\n`;
const left=mm2pt(15),bottom=mm2pt(17),w=mm2pt(tileW),h=mm2pt(tileH);
stream+=`${n(left)} ${n(bottom)} ${n(w)} ${n(h)} re S\nq\n${n(left)} ${n(bottom)} ${n(w)} ${n(h)} re W n\n`;
for(const piece of draft.pieces){const px=piece.offsetX,py=piece.offsetY;if(px+Math.max(...piece.cut.map(q=>q[0]))<ox||px+Math.min(...piece.cut.map(q=>q[0]))>ox+tileW||py+Math.max(...piece.cut.map(q=>q[1]))<oy||py+Math.min(...piece.cut.map(q=>q[1]))>oy+tileH)continue;
stream+='0 0 0 RG 0.7 w\n'+vector(piece.cut,piece,ox,oy);
stream+='0.3 0.45 0.33 RG [5 3] 0 d 0.35 w\n'+vector(piece.points,piece,ox,oy)+'[] 0 d\n';
}
stream+='Q\n';
stream+=`0.7 w ${n(mm2pt(19))} ${n(mm2pt(8))} m ${n(mm2pt(69))} ${n(mm2pt(8))} l S\n`;
stream+='BT /F1 7 Tf 44 10 Td (50 mm CONTROL - PRINT AT 100% / ACTUAL SIZE) Tj ET\n';

pages.push(stream);
}
// An elementary and spec-compliant PDF writer with accurate byte offsets. ASCII only.
const objects=[null];const push=s=>(objects.push(s),objects.length-1);const fontId=push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');const pagesId=push('PAGES_PLACEHOLDER');const pageIds=[];
for(const content of pages){const length=new TextEncoder().encode(content).length;const contentId=push(`<< /Length ${length} >>\nstream\n${content}endstream`);const pageId=push(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${n(mm2pt(210))} ${n(mm2pt(297))}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);pageIds.push(pageId);}
objects[pagesId]=`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] >>`;
const catalogId=push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);let pdf='%PDF-1.4\n%FitMyStyle local export\n';const offsets=[0];for(let i=1;i<objects.length;i++){offsets.push(new TextEncoder().encode(pdf).length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}const pos=new TextEncoder().encode(pdf).length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${pos}\n%%EOF`;return {bytes:new TextEncoder().encode(pdf),pages:count,rows,cols};}