"use client"; import {FormEvent,useState} from "react"; import {mutate,Modal,FormButton} from "@/components/ui-kit"; import {DeleteButton} from "@/components/status-action"; import {Badge} from "@/components/list-section";

const templates=[
 {name:"Low stock auto-reorder",trigger_key:"inventory.low",action_key:"draft_po",desc:"When stock falls below reorder point, draft a purchase order and notify ops."},
 {name:"Deal won → invoice",trigger_key:"deal.won",action_key:"customer_invoice",desc:"When a deal is marked Won, convert the contact to a customer and draft an invoice."},
 {name:"Leave approved → calendar",trigger_key:"leave.approved",action_key:"leave_calendar",desc:"When leave is approved, block the shared calendar and notify the team."},
 {name:"Expense approved → ledger",trigger_key:"expense.approved",action_key:"expense_ledger",desc:"When an expense is approved, post it to the ledger and notify finance."},
 {name:"Urgent case → notify",trigger_key:"case.urgent",action_key:"case_notify",desc:"When an urgent support case opens, immediately notify the support team."},
];
export function TemplateGallery(){
 const[busy,setBusy]=useState("");
 async function activate(t:typeof templates[number]){setBusy(t.name);try{await mutate("POST",{table:"automation_rules",data:{name:t.name,trigger_key:t.trigger_key,action_key:t.action_key}});location.reload()}catch(x:any){alert(x.message);setBusy("")}}
 return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{templates.map(t=><div className="card" key={t.name}><b className="text-sm">{t.name}</b><p className="mt-2 text-xs text-black/50">{t.desc}</p><button disabled={busy===t.name} onClick={()=>activate(t)} className="btn-secondary mt-4 w-full text-xs">{busy===t.name?"Activating…":"Use template"}</button></div>)}</div>
}

export function WebhookActions(){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"webhooks",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New webhook</button><Modal title="New inbound webhook" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><input className="input" name="name" placeholder="Webhook name" required/><input className="input" name="trigger_key" placeholder="Trigger key (e.g. webhook.custom)" defaultValue="webhook.custom" required/><p className="text-xs text-black/40">Any automation rule listening on this trigger key will run when the endpoint receives a POST.</p><FormButton busy={busy}>Create webhook</FormButton></form></Modal></>
}
export function WebhookRow({w,baseUrl}:{w:any;baseUrl:string}){
 const[busy,setBusy]=useState(false),[copied,setCopied]=useState(false);
 const url=`${baseUrl}/api/webhooks/inbound/${w.token}`;
 async function toggle(){setBusy(true);await mutate("PATCH",{table:"webhooks",id:w.id,data:{enabled:!w.enabled}});location.reload()}
 async function copy(){await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1500)}
 return <div className="py-3 text-sm"><div className="flex items-center justify-between gap-2"><b>{w.name}</b><div className="flex items-center gap-3"><Badge tone={w.enabled?"good":"default"}>{w.enabled?"Active":"Paused"}</Badge><button disabled={busy} onClick={toggle} className="text-xs font-bold text-moss">{w.enabled?"Pause":"Resume"}</button><DeleteButton table="webhooks" id={w.id}/></div></div><div className="mt-2 flex items-center gap-2 rounded-lg bg-black/5 p-2"><code className="min-w-0 flex-1 truncate text-xs">{url}</code><button onClick={copy} className="shrink-0 text-xs font-bold text-moss">{copied?"Copied!":"Copy"}</button></div><p className="mt-1 text-xs text-black/40">Fires trigger “{w.trigger_key}” · {w.last_triggered_at?`last hit ${new Date(w.last_triggered_at).toLocaleString()}`:"never triggered"}</p></div>
}

export function CredentialActions(){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"automation_credentials",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New credential</button><Modal title="Store a credential" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><input className="input" name="name" placeholder="Credential name (e.g. Slack workspace)" required/><select className="input" name="kind"><option value="api_key">API key</option><option value="oauth_token">OAuth token</option><option value="basic_auth">Basic auth</option></select><input className="input" name="value" type="password" placeholder="Secret value" required/><p className="text-xs text-black/40">Stored per-organization and only visible to org members with access to this workspace.</p><FormButton busy={busy}>Save credential</FormButton></form></Modal></>
}
export function CredentialRow({c}:{c:any}){
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{c.name}</b><p className="text-xs capitalize text-black/40">{c.kind.replace("_"," ")} · ••••{String(c.value).slice(-4)}</p></div><DeleteButton table="automation_credentials" id={c.id}/></div>
}

export function TestRunButton({ruleId}:{ruleId:string}){
 const[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 async function run(){setBusy(true);const r=await fetch("/api/automation/test",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({rule_id:ruleId})});setBusy(false);if(r.ok){setDone(true);setTimeout(()=>location.reload(),700)}else alert((await r.json()).error)}
 return <button disabled={busy} onClick={run} className="text-xs font-bold text-moss">{busy?"Running…":done?"Ran ✓":"Run test"}</button>
}
