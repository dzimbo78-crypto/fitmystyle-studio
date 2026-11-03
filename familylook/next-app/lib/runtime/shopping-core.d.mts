import type {Member} from '../types';
import type {ShoppingPlan,RetailOffer} from '../shopping-types';
export function normalizeShopping(raw:unknown,members:Member[]):ShoppingPlan;
export function normalizeOffer(raw:unknown):RetailOffer|null;
