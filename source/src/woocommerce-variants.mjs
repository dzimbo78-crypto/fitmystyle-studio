/** Join public Store API variations to publicly visible parent metadata.
 * A product variant is NOT marked in stock unless the API explicitly indicates it.
 */
const keys=['Size','Rozmiar','Größe','Taille'];
export function joinWooVariations(parents,variations){
 const byId=new Map((parents||[]).map(p=>[Number(p.id),p]));
 const merged=[];
 for(const child of variations||[]){const id=Number(child.parent||child.parent_id||child.parentId||child.parent?.id);const parent=byId.get(id);
  // Do not synthesize missing parent identity/role or invent valid product sizes.
  if(!parent||!child||!child.id)continue;
  const attr=Array.isArray(child.attributes)?child.attributes:[];
  const size=attr.find(a=>/^(size|rozmiar|gr[öo]sse)$/i.test(a.name||a.taxonomy||''));
  if(!size)continue;
  const cols=attr.find(a=>/^(colou?r|kolor|farbe)$/i.test(a.name||a.taxonomy||''));
  const color=cols?.value||cols?.term||cols?.option||'';
  merged.push({
   ...parent,...child,id:child.id,type:'simple',
   name:parent.name,
   permalink:child.permalink||((parent.permalink||'')+(parent.permalink?.includes('?')?'&':'?')+'variation_id='+child.id),
   categories:parent.categories,
   description:parent.description||parent.short_description,
   images:child.images?.length?child.images:parent.images,
   prices:child.prices||parent.prices,
   attributes:[{name:'Size',terms:[{name:size.value||size.term||size.option||size.terms?.[0]?.name||''}]},
    {name:'Color',terms:[{name:color||parent.attributes?.find(a=>/colou?r|kolor/i.test(a.name||''))?.terms?.[0]?.name||''}]}],
   is_in_stock:child.is_in_stock===true
  });
 }
 return merged;
}