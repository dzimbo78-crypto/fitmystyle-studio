import {TYPEFACES} from './photo-catalog.mjs';
import {designText} from './photo-core.mjs';
import {safeColor} from './scene-model.mjs';
/** Same clean design is used by photographic mockups and the 3D renderer. */
export function paintDesign(ctx,artwork,image=null,size=768){const font=TYPEFACES[artwork.font]||TYPEFACES.sans,text=designText(artwork);ctx.clearRect(0,0,size,size);if(artwork.enabled===false)return;ctx.fillStyle=safeColor(artwork.color,'#594d43');ctx.strokeStyle=ctx.fillStyle;
 if(image){const maxH=text?size*.56:size*.87,r=Math.min(size*.86/image.width,maxH/image.height),w=image.width*r,h=image.height*r;ctx.drawImage(image,(size-w)/2,text?size*.1:(size-h)/2,w,h);}
 let fs=artwork.layout==='monogram'?size*.49:artwork.layout==='badge'?size*.15:size*.18;ctx.font=`${font.weight} ${fs}px ${font.family}`;while(ctx.measureText(text).width>size*.88&&fs>18)ctx.font=`${font.weight} ${--fs}px ${font.family}`;ctx.textAlign='center';ctx.textBaseline='middle';if(artwork.layout==='badge'&&!image&&text){ctx.lineWidth=size*.0045;ctx.beginPath();ctx.arc(size/2,size/2,size*.37,0,Math.PI*2);ctx.stroke();}if(text)ctx.fillText(text,size/2,image?size*.82:size*.5);
}
