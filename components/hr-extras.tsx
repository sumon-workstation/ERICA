"use client"; import {FormEvent,useState} from "react"; import {mutate,Modal,FormButton} from "@/components/ui-kit"; import {Badge} from "@/components/list-section";

export function JobPostingActions(){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"job_postings",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New job posting</button><Modal title="New job posting" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><input className="input" name="title" placeholder="Job title" required/><input className="input" name="department" placeholder="Department"/><input className="input" name="location" placeholder="Location"/><select className="input" name="employment_type"><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option></select><textarea className="input" name="description" placeholder="Description" rows={3}/><FormButton busy={busy}>Publish posting</FormButton></form></Modal></>
}
export function CandidateActions({jobPostings}:{jobPostings:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"candidates",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn" onClick={()=>setOpen(true)}>Add candidate</button><Modal title="Add candidate" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="job_posting_id" required><option value="">Job posting</option>{jobPostings.map((j:any)=><option value={j.id} key={j.id}>{j.title}</option>)}</select><input className="input" name="name" placeholder="Candidate name" required/><input className="input" name="email" type="email" placeholder="Email"/><input className="input" name="phone" placeholder="Phone"/><FormButton busy={busy}>Save candidate</FormButton></form></Modal></>
}
const stages=["applied","screening","interview","offer","hired","rejected"];
export function CandidateRow({c}:{c:any}){
 const[busy,setBusy]=useState(false);
 async function setStage(stage:string){setBusy(true);await mutate("PATCH",{table:"candidates",id:c.id,data:{stage}});location.reload()}
 async function hire(){setBusy(true);const r=await fetch("/api/candidates/hire",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({candidate_id:c.id})});if(r.ok)location.reload();else{alert((await r.json()).error);setBusy(false)}}
 return <div className="flex items-center justify-between gap-2 py-3 text-sm"><div><b>{c.name}</b><p className="text-xs text-black/40">{c.job_postings?.title}</p></div>{c.stage==="hired"?<Badge tone="good">Hired</Badge>:<div className="flex items-center gap-2"><select disabled={busy} className="rounded-lg border p-1 text-xs" value={c.stage} onChange={e=>setStage(e.target.value)}>{stages.map(s=><option key={s}>{s}</option>)}</select>{c.stage==="offer"&&<button disabled={busy} onClick={hire} className="text-xs font-bold text-moss">Hire</button>}</div>}</div>
}

export function ReviewActions({employees}:{employees:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"performance_reviews",data:{...f,rating:f.rating?Number(f.rating):null}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New review</button><Modal title="New performance review" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="employee_id" required>{employees.map((e:any)=><option value={e.id} key={e.id}>{e.entities?.name}</option>)}</select><input className="input" name="cycle" placeholder="Cycle (e.g. Q3 2026)" required/><select className="input" name="rating"><option value="">Rating</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>)}</select><textarea className="input" name="strengths" placeholder="Strengths" rows={2}/><textarea className="input" name="improvements" placeholder="Areas to improve" rows={2}/><FormButton busy={busy}>Save review</FormButton></form></Modal></>
}
export function ReviewRow({r}:{r:any}){
 const[busy,setBusy]=useState(false);
 async function advance(){setBusy(true);await mutate("PATCH",{table:"performance_reviews",id:r.id,data:{status:r.status==="draft"?"submitted":"acknowledged"}});location.reload()}
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{r.employees?.entities?.name} · {r.cycle}</b><p className="text-xs text-black/40">{r.rating?`${r.rating}/5`:"Unrated"} · {r.status}</p></div>{r.status!=="acknowledged"&&<button disabled={busy} onClick={advance} className="text-xs font-bold text-moss">{r.status==="draft"?"Submit":"Acknowledge"}</button>}</div>
}
export function GoalActions({employees}:{employees:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"goals",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New goal</button><Modal title="New goal" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="employee_id" required>{employees.map((e:any)=><option value={e.id} key={e.id}>{e.entities?.name}</option>)}</select><input className="input" name="title" placeholder="Goal" required/><input className="input" name="target" placeholder="Target / metric"/><input className="input" name="due_on" type="date"/><FormButton busy={busy}>Save goal</FormButton></form></Modal></>
}
export function GoalRow({g}:{g:any}){
 const[busy,setBusy]=useState(false);
 async function bump(delta:number){setBusy(true);const progress=Math.max(0,Math.min(100,g.progress+delta));await mutate("PATCH",{table:"goals",id:g.id,data:{progress,status:progress>=100?"completed":"in_progress"}});location.reload()}
 return <div className="flex items-center justify-between gap-3 py-3 text-sm"><div className="min-w-0"><b>{g.title}</b><p className="text-xs text-black/40">{g.employees?.entities?.name}</p><div className="mt-1 h-1.5 w-40 rounded-full bg-black/10"><div className="h-1.5 rounded-full bg-moss" style={{width:`${g.progress}%`}}/></div></div>{g.status!=="completed"&&<div className="flex gap-2"><button disabled={busy} onClick={()=>bump(-10)} className="text-xs font-bold text-black/40">-10</button><button disabled={busy} onClick={()=>bump(10)} className="text-xs font-bold text-moss">+10</button></div>}</div>
}

export function BenefitPlanActions(){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f:any=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"benefit_plans",data:{...f,cost_employee:Number(f.cost_employee||0),cost_employer:Number(f.cost_employer||0)}});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>New plan</button><Modal title="New benefit plan" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><input className="input" name="name" placeholder="Plan name" required/><select className="input" name="category"><option value="health">Health</option><option value="dental">Dental</option><option value="vision">Vision</option><option value="retirement">Retirement</option></select><input className="input" name="provider" placeholder="Provider"/><input className="input" name="cost_employee" type="number" placeholder="Employee cost / mo"/><input className="input" name="cost_employer" type="number" placeholder="Employer cost / mo"/><FormButton busy={busy}>Save plan</FormButton></form></Modal></>
}
export function EnrollActions({employees,plans}:{employees:any[];plans:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"benefit_enrollments",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn" onClick={()=>setOpen(true)}>Enroll employee</button><Modal title="Enroll in benefit plan" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="employee_id" required>{employees.map((e:any)=><option value={e.id} key={e.id}>{e.entities?.name}</option>)}</select><select className="input" name="plan_id" required>{plans.map((p:any)=><option value={p.id} key={p.id}>{p.name}</option>)}</select><FormButton busy={busy}>Enroll</FormButton></form></Modal></>
}

export function DocumentActions({employees}:{employees:any[]}){
 const[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{const f=Object.fromEntries(new FormData(e.currentTarget));await mutate("POST",{table:"hr_documents",data:f});location.reload()}catch(x:any){alert(x.message);setBusy(false)}}
 return <><button className="btn-secondary" onClick={()=>setOpen(true)}>Request signature</button><Modal title="Request document signature" open={open} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-3"><select className="input" name="employee_id" required>{employees.map((e:any)=><option value={e.id} key={e.id}>{e.entities?.name}</option>)}</select><input className="input" name="title" placeholder="Document title" required/><FormButton busy={busy}>Send for signature</FormButton></form></Modal></>
}
export function DocumentRow({d}:{d:any}){
 const[busy,setBusy]=useState(false);
 async function sign(){setBusy(true);await mutate("PATCH",{table:"hr_documents",id:d.id,data:{status:"signed",signed_at:new Date().toISOString()}});location.reload()}
 return <div className="flex items-center justify-between py-3 text-sm"><div><b>{d.title}</b><p className="text-xs text-black/40">{d.employees?.entities?.name}</p></div>{d.status==="pending"?<button disabled={busy} onClick={sign} className="text-xs font-bold text-moss">Sign now</button>:<Badge tone="good">Signed</Badge>}</div>
}
