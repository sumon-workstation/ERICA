"use client"; import { useState } from "react";
export function StatusButton({table,id,data,label,className="text-xs font-bold text-moss"}:{table:string;id:string;data:Record<string,any>;label:string;className?:string}){
 const [busy,setBusy]=useState(false);
 async function run(){setBusy(true);const r=await fetch("/api/records",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({table,id,data})});if(r.ok)location.reload();else{alert((await r.json()).error);setBusy(false)}}
 return <button className={className} disabled={busy} onClick={run}>{busy?"…":label}</button>
}
export function DeleteButton({table,id,label="Delete",className="text-xs font-bold text-red-600"}:{table:string;id:string;label?:string;className?:string}){
 const [busy,setBusy]=useState(false);
 async function run(){if(!confirm("Remove this record?"))return;setBusy(true);const r=await fetch("/api/records",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({table,id})});if(r.ok)location.reload();else{alert((await r.json()).error);setBusy(false)}}
 return <button className={className} disabled={busy} onClick={run}>{busy?"…":label}</button>
}
