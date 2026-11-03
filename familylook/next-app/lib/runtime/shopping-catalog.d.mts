import type {RetailOffer} from '../shopping-types';
export function catalogPage(catalog:{schema:string;checkedAt:string;offers:unknown[]},query?:Record<string,string>):{schema:string;checkedAt:string;priceMode:string;liveStock:false;currency:string;total:number;page:number;limit:number;pages:number;facets:{stores:Record<string,number>;categories:Record<string,number>};offers:RetailOffer[]};
