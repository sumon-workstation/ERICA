"use client"; import {FormEvent,useState} from "react"; import {mutate,Modal,FormButton} from "@/components/ui-kit"; import {Badge} from "@/components/list-section";

export function SalesOrderActions({entities}:{entities:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));const amount=Number(f.amount||0);await mutate("POST",{table:"sales_orders",data:{entity_id:f.entity_id,order_number:`SO-${Date.now().toString().slice(-6)}`,items:[{description:f.description,amount}],total:amount}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New sales order</button><Modal title="New sales order" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="entity_id" required><option value="">Customer</option>{entities.map((e:any)=><option value={e.id} key={e.id}>{e.name}</option>)}</select><input className="input" name="description" placeholder="Line item" required/><input className="input" name="amount" type="number" step="any" placeholder="Amount" required/><FormButton busy={busy}>Create order</FormButton></form></Modal></>
}
export function SalesOrderRow({o}:{o:any}){
 const[busy,setBusy]=useState(false);
 async function confirm(){setBusy(true);await mutate("PATCH",{table:"sales_orders",id:o.id,data:{status:"confirmed"}});location.reload()}
 async function invoice(){setBusy(true);await mutate("POST",{table:"invoices",data:{customer_id:o.entity_id,invoice_number:`INV-${Date.now().toString().slice(-6)}`,status:"sent",amount:o.total,items:o.items}});await mutate("PATCH",{table:"sales_orders",id:o.id,data:{status:"invoiced"}});location.reload()}
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{o.order_number} · {o.entities?.name}</b><p className="text-xs capitalize text-black/40">{o.status} · ${Number(o.total).toLocaleString()}</p></div>{o.status==="quotation"&&<button disabled={busy} onClick={confirm} className="text-xs font-bold text-moss">Confirm</button>}{o.status==="confirmed"&&<button disabled={busy} onClick={invoice} className="text-xs font-bold text-moss">Invoice</button>}{o.status==="invoiced"&&<Badge tone="good">Invoiced</Badge>}</div>
}

export function BillActions({vendors,pos}:{vendors:any[];pos:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"bills",data:{vendor_id:f.vendor_id,po_id:f.po_id||null,bill_number:`BILL-${Date.now().toString().slice(-6)}`,amount:Number(f.amount||0),due_on:f.due_on||null}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New vendor bill</button><Modal title="New vendor bill" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="vendor_id" required><option value="">Vendor</option>{vendors.map((v:any)=><option value={v.id} key={v.id}>{v.name}</option>)}</select><select className="input" name="po_id"><option value="">Match to purchase order (optional)</option>{pos.map((p:any)=><option value={p.id} key={p.id}>{p.po_number} · ${Number(p.total).toLocaleString()}</option>)}</select><input className="input" name="amount" type="number" step="any" placeholder="Bill amount" required/><input className="input" name="due_on" type="date"/><FormButton busy={busy}>Create bill</FormButton></form></Modal></>
}
export function BillRow({b}:{b:any}){
 const[busy,setBusy]=useState(false);
 async function match(){setBusy(true);const r=await fetch("/api/bills/match",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:b.id})});if(r.ok)location.reload();else{alert((await r.json()).error);setBusy(false)}}
 async function pay(){setBusy(true);await mutate("PATCH",{table:"bills",id:b.id,data:{status:"paid"}});location.reload()}
 const tone=b.status==="matched"||b.status==="paid"?"good":b.status==="mismatched"?"bad":"default";
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{b.bill_number} · {b.entities?.name}</b><p className="text-xs text-black/40">${Number(b.amount).toLocaleString()}{b.due_on?` · due ${b.due_on}`:""}</p></div><div className="flex items-center gap-3"><Badge tone={tone as any}>{b.status}</Badge>{b.status==="pending"&&b.po_id&&<button disabled={busy} onClick={match} className="text-xs font-bold text-moss">3-way match</button>}{(b.status==="matched"||b.status==="pending")&&<button disabled={busy} onClick={pay} className="text-xs font-bold text-ink">Mark paid</button>}</div></div>
}

export function ExpenseActions({employees}:{employees:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"expenses",data:{...f,amount:Number(f.amount||0)}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>Submit expense</button><Modal title="Submit expense" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="employee_id" required>{employees.map((e:any)=><option value={e.id} key={e.id}>{e.entities?.name}</option>)}</select><input className="input" name="category" placeholder="Category (Travel, Meals…)" required/><input className="input" name="description" placeholder="Description"/><input className="input" name="amount" type="number" step="any" placeholder="Amount" required/><input className="input" name="spent_on" type="date"/><FormButton busy={busy}>Submit</FormButton></form></Modal></>
}
export function ExpenseRow({x}:{x:any}){
 const[busy,setBusy]=useState(false);
 async function decide(status:string){setBusy(true);const r=await fetch("/api/expenses/decide",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:x.id,status})});if(r.ok)location.reload();else{alert((await r.json()).error);setBusy(false)}}
 async function reimburse(){setBusy(true);await mutate("PATCH",{table:"expenses",id:x.id,data:{status:"reimbursed"}});location.reload()}
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{x.employees?.entities?.name} · {x.category}</b><p className="text-xs text-black/40">${Number(x.amount).toLocaleString()} · {x.spent_on}</p></div>{x.status==="submitted"?<div className="flex gap-3"><button disabled={busy} onClick={()=>decide("approved")} className="text-xs font-bold text-moss">Approve</button><button disabled={busy} onClick={()=>decide("rejected")} className="text-xs font-bold text-red-600">Reject</button></div>:x.status==="approved"?<button disabled={busy} onClick={reimburse} className="text-xs font-bold text-ink">Reimburse</button>:<Badge tone={x.status==="rejected"?"bad":"good"}>{x.status}</Badge>}</div>
}

export function BudgetActions(){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"budgets",data:{...f,amount_planned:Number(f.amount_planned||0)}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New budget line</button><Modal title="New budget line" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><input className="input" name="category" placeholder="Category" required/><input className="input" name="period_start" type="date" required/><input className="input" name="period_end" type="date" required/><input className="input" name="amount_planned" type="number" step="any" placeholder="Planned amount" required/><FormButton busy={busy}>Save budget</FormButton></form></Modal></>
}

export function RecurringActions({customers}:{customers:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"recurring_invoices",data:{...f,amount:Number(f.amount||0)}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New subscription</button><Modal title="New recurring billing plan" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="customer_id" required><option value="">Customer</option>{customers.map((c:any)=><option value={c.id} key={c.id}>{c.name}</option>)}</select><input className="input" name="plan_name" placeholder="Plan name" required/><input className="input" name="amount" type="number" step="any" placeholder="Amount per cycle" required/><select className="input" name="interval"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select><FormButton busy={busy}>Save plan</FormButton></form></Modal></>
}
export function RecurringRow({r}:{r:any}){
 const[busy,setBusy]=useState(false);
 async function run(){setBusy(true);const res=await fetch("/api/recurring/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:r.id})});if(res.ok)location.reload();else{alert((await res.json()).error);setBusy(false)}}
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{r.plan_name} · {r.entities?.name}</b><p className="text-xs capitalize text-black/40">${Number(r.amount).toLocaleString()}/{r.interval} · next {r.next_run_on}</p></div><button disabled={busy} onClick={run} className="text-xs font-bold text-moss">Generate invoice now</button></div>
}
