/** Official public NBP API; never changes product prices or their verification date. */
import {writeFile,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const url='https://api.nbp.pl/api/exchangerates/tables/a/?format=json';
export function parseExchangeTable(data){const table=data?.[0];if(!/^\d{4}-\d{2}-\d{2}$/.test(table?.effectiveDate)||!Array.isArray(table.rates))throw Error('Invalid NBP table');const rates={PLN:1};for(const code of ['EUR','DKK']){const value=table.rates.find(r=>r.code===code)?.mid;if(!Number.isFinite(value)||value<=0)throw Error('Missing NBP exchange rate');rates[code]=value;}return {source:'NBP',url,effectiveDate:table.effectiveDate,base:'PLN',rates};}
if(process.argv[1]===fileURLToPath(import.meta.url)){const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('NBP unavailable: '+r.status);const data=parseExchangeTable(await r.json()),target=fileURLToPath(new URL('../site/data/exchange-rates.json',import.meta.url)),temp=target+'.tmp';await writeFile(temp,JSON.stringify(data,null,2)+'\n');await rename(temp,target);console.log('NBP snapshot saved: '+data.effectiveDate);}
