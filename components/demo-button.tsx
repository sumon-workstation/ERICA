"use client"; import { useState } from "react";
export function DemoButton(){const [busy,setBusy]=useState(false);return <button className="btn" disabled={busy} onClick={async()=>{setBusy(true);const r=await fetch("/api/demo",{method:"POST"});if(r.ok)location.reload();else{alert("Could not load demo data");setBusy(false)}}}>{busy?"Building demo…":"Load demo data"}</button>}
