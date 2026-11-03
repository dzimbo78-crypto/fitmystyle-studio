// Classification uses product names and the observed merchant department only.
// A category label is not evidence that a multipack is a complete outfit.
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').toLowerCase();
export function classifyGarment(name,sourceCategory='top'){
 const n=fold(name),top=/bluz[akęa]|koszulk|t-shirt|sweter|kaftanik|tunik|body/,bottom=/spodni|leg+ins|jeggins|szort|spodnic|polspioch/;
 if(/czapk|rekawic|szalik|szal |komin|kominiark|opask|skarpet|torebk|plecak|pasek|apaszk|kapelusz|czapeczk|sliniak|kocyk/.test(n)&&!top.test(n)&&!bottom.test(n))return {category:'extra',garmentKind:'extra'};
 if(/stroj kapiel|kostium kapiel/.test(n))return {category:'onepiece',garmentKind:'swimwear'};
 if(/majtki|majtcz|biustonos|bielizn|bokserki|rajstop|figi /.test(n))return {category:'extra',garmentKind:'underwear'};
 if(/pizam|szlafrok|koszul[ak] nocn/.test(n))return {category:'onepiece',garmentKind:'nightwear'};
 if(/komplet|zestaw/.test(n)&&((top.test(n)&&bottom.test(n))||/komplet dresowy|komplet: sukienka i koszulka|komplet:.*bluzka.*sukienka/.test(n)))return {category:'onepiece',garmentKind:'set'};
 if(/body|bodziak/.test(n)&&!/t-shirt|koszulk|bluzka/.test(n))return {category:'top',garmentKind:'bodysuit'};
 if(/ocieplan.*kombinezon|kombinezon.*ocieplen|kurtk|plaszcz|bezrekawnik|kamizelk|parka|puchow|anorak|^futro /.test(n))return {category:'outer',garmentKind:'outer'};
 if(/buty|botki|botkow|kozaki|kozakow|trampk|sneakers|sneaker|polbut|mokasyn|sandal|balerin|klapk|kapci|kapec|szpilk|espadryl|sniegow|baletk|obuw/.test(n))return {category:'shoes',garmentKind:/kapci|kapec|pantofl/.test(n)?'slippers':/klapk|sandal|espadryl/.test(n)?'open-shoes':'shoes'};
 if(/pajac|rampers|spioch/.test(n)&&!/polspioch/.test(n))return {category:'onepiece',garmentKind:'romper'};
 if(/sukienk/.test(n))return {category:'onepiece',garmentKind:'dress'};
 if(/kombinezon/.test(n))return {category:'onepiece',garmentKind:'jumpsuit'};
 if(bottom.test(n)||/jeans|chino|jogg|bermudy/.test(n)||sourceCategory==='bottom')return {category:'bottom',garmentKind:'pants'};
 if(/polo/.test(n))return {category:'top',garmentKind:'polo'};
 if(/koszul[aeiy] |koszul[aeiy]$/.test(n)&&!/koszulk/.test(n))return {category:'top',garmentKind:'shirt'};
 if(/swetr|sweter|kardigan|golf |pulower/.test(n))return {category:'top',garmentKind:'sweater'};
 if(/bluz.*kaptur|hoodie/.test(n))return {category:'top',garmentKind:'hoodie'};
 if(/bluzk/.test(n))return {category:'top',garmentKind:'blouse'};
 if(/longsleeve/.test(n))return {category:'top',garmentKind:'tee'};
 if(/bluz/.test(n))return {category:'top',garmentKind:'crewneck'};
 if(/t-shirt|tshirt|koszulk|top /.test(n))return {category:'top',garmentKind:'tee'};
 if(/komplet|zestaw/.test(n))return {category:'onepiece',garmentKind:'unverified-set'};
 return {category:sourceCategory,garmentKind:sourceCategory==='extra'?'extra':'unclassified'};
}
export function classifyColor(label){
 const n=fold(label);
 if(/wielokolor|multikolor|multi|wzor/.test(n))return 'multi';
 if(/czarn/.test(n))return 'black';if(/granat|indygo/.test(n))return 'navy';if(/braz|czekolad|mahoni|karmel/.test(n))return 'brown';
 if(/bez|krem|ecru|smietan|piask/.test(n))return 'beige';if(/biel|bial/.test(n))return 'white';
 if(/ziel|oliwk|khaki|szalwi|miet/.test(n))return 'green';if(/szar|grafit|srebr/.test(n))return 'grey';
 if(/niebies|blekit/.test(n))return 'blue';if(/fiolet|lawend|liliow/.test(n))return 'purple';if(/roz/.test(n))return 'pink';if(/czerw|bord|wisni|malin/.test(n))return 'red';
 if(/pomarancz/.test(n))return 'orange';if(/zol|musztard|zlot/.test(n))return 'yellow';return 'multi';
}
