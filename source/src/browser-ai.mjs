/** Optional true local browser LLM. Never sends the user's profile to an external server. */
export async function getBrowserAIStatus(){
 if(typeof LanguageModel==='undefined'||typeof LanguageModel.availability!=='function')return {available:false,message:'On-device language model unavailable in this browser. The free outfit optimizer still works.'};
 try{const status=await LanguageModel.availability();return {available:status!=='unavailable',status,message:status==='available'?'On-device AI ready':status==='downloadable'?'Optional AI model must first be downloaded onto this computer.':status==='downloading'?'On-device AI model is downloading.':'AI model is unavailable on this device.'}}catch{return {available:false,message:'Unable to access on-device AI. Local stylist remains available.'}}
}
export async function explainWithBrowserAI({brief,look,style,palette}){
 if(typeof LanguageModel==='undefined')throw Error('On-device AI is not supported on this device');
 const availability=await LanguageModel.availability();if(availability==='unavailable')throw Error('On-device AI unavailable');
 const session=await LanguageModel.create();
 try{const products=look.items.map(x=>`${x.member.label}: ${x.product?.name||'not found'}, ${x.product?.color||''}`).join('\n');
 const prompt=`You are a fashion stylist. Write a concise two-sentence English styling explanation only. Never make up clothing items, product prices, availability or purchase links. Use only these provided selections. Style: ${style}; palette: ${palette}. User brief: ${String(brief).slice(0,300)}. Selected garments:\n${products}`;
 const output=await session.prompt(prompt);return String(output).slice(0,800);
 } finally {if(typeof session.destroy==='function')session.destroy()}
}

export function validateAIIntent(output){
 const text=String(output||'');let data;try{data=JSON.parse(text)}catch{const candidate=text.match(/\{[\s\S]*\}/);if(!candidate)throw Error('AI returned no structured intent');data=JSON.parse(candidate[0])}
 const styles=['everyday','elegant','holiday','active'],palettes=['sand','sage','coastal','rose','mono','autumn','lavender','terracotta','denim','sunset','forest','pastel'];
 const res={};
 if(styles.includes(data.style))res.style=data.style;
 if(palettes.includes(data.palette))res.palette=data.palette;
 if(Number.isFinite(Number(data.budget))&&Number(data.budget)>=30&&Number(data.budget)<=10000)res.budget=Number(data.budget);
 if(['identical','coordinated'].includes(data.matching))res.matching=data.matching;
 if(['price','harmony','balanced'].includes(data.priority))res.priority=data.priority;
 res.rationale=String(data.rationale||'').replace(/[<>]/g,'').slice(0,180);
 return res;
}
export async function interpretBriefWithBrowserAI(brief){
 if(typeof LanguageModel==='undefined')throw Error('Chrome on-device AI unavailable');
 const status=await LanguageModel.availability();if(status==='unavailable')throw Error('Local model unavailable');
 const session=await LanguageModel.create();
 try{
  const prompt=`Read the following request for coordinated family clothing. The request might be in Polish or English. Respond ONLY valid JSON (without markdown) with keys style, palette, budget, matching, priority, rationale. Allowed style: everyday,elegant,holiday,active. Allowed palette: sand,sage,coastal,rose,mono,autumn,lavender,terracotta,denim,sunset,forest,pastel. Allowed matching: coordinated,identical. Allowed priority: balanced,price,harmony. Budget EUR numerical or null. Do not invent product items or offer prices. If unsure, omit fields. Request: ${String(brief).slice(0,800)}`;
  return validateAIIntent(await session.prompt(prompt));
 }finally{if(typeof session.destroy==='function')session.destroy()}
}