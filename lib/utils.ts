import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs))}
export const money=(n:number|string=0,currency="USD")=>new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:0}).format(Number(n));
export const daysSince=(d:string|null|undefined)=>d?Math.floor((Date.now()-new Date(d).getTime())/86400000):null;
