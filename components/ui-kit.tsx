"use client";
import { ReactNode } from "react";
export async function mutate(method:"POST"|"PATCH"|"DELETE",body:any){
 const r=await fetch("/api/records",{method,headers:{"content-type":"application/json"},body:JSON.stringify(body)});
 const x=await r.json(); if(!r.ok)throw Error(x.error||"Unable to save"); return x;
}
export function Modal({title,open,onClose,children}:{title:string;open:boolean;onClose:()=>void;children:ReactNode}){
 if(!open)return null;return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onMouseDown={onClose}><div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-cream p-6 shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black">{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>
}
export function FormButton({children,busy}:{children:ReactNode,busy:boolean}){return <button disabled={busy} className="btn mt-5 w-full">{busy?"Saving…":children}</button>}
