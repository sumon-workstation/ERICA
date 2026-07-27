import{getContext}from"@/lib/context";import{PageHeader}from"@/components/page-header";import{HrActions,ApproveLeave}from"@/components/hr-actions";import{PeopleOpsActions}from"@/components/module-actions";import{CalendarDays,UserRoundCheck,Briefcase}from"lucide-react";
import{JobPostingActions,CandidateActions,CandidateRow,ReviewActions,ReviewRow,GoalActions,GoalRow,BenefitPlanActions,EnrollActions,DocumentActions,DocumentRow}from"@/components/hr-extras";
import{ListSection}from"@/components/list-section";
export default async function HR(){const{db,member}=await getContext(),oid=member.org_id;
 const[{data:employees},{data:leaves},{data:attendance},{data:onboarding},{data:postings},{data:candidates},{data:reviews},{data:goals},{data:plans},{data:enrollments},{data:documents}]=await Promise.all([
  db.from("employees").select("*,entities(name,email)").eq("org_id",oid),
  db.from("leave_requests").select("*,employees(entities(name))").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("attendance").select("*,employees(entities(name))").eq("org_id",oid).order("clock_in",{ascending:false}),
  db.from("onboarding_items").select("*,employees(entities(name))").eq("org_id",oid),
  db.from("job_postings").select("*").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("candidates").select("*,job_postings(title)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("performance_reviews").select("*,employees(entities(name))").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("goals").select("*,employees(entities(name))").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("benefit_plans").select("*").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("benefit_enrollments").select("*,employees(entities(name)),benefit_plans(name)").eq("org_id",oid),
  db.from("hr_documents").select("*,employees(entities(name))").eq("org_id",oid).order("created_at",{ascending:false})]);
 const byDept:Record<string,number>={}; employees?.forEach(e=>{const d=e.department||"Unassigned";byDept[d]=(byDept[d]||0)+1});
 const active=employees?.filter(e=>e.status==="active").length||0,terminated=employees?.filter(e=>e.status==="terminated").length||0;
 const turnover=active+terminated?Math.round((terminated/(active+terminated))*100):0;
 const tenureDays=employees?.filter(e=>e.start_date).map(e=>(Date.now()-new Date(e.start_date).getTime())/86400000)||[];
 const avgTenureMonths=tenureDays.length?Math.round((tenureDays.reduce((s,x)=>s+x,0)/tenureDays.length)/30):0;
 return <><PageHeader eyebrow="HR · People operations" title="A team that runs smoothly"><HrActions employees={employees||[]}/></PageHeader>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <div className="card"><p className="text-sm text-black/45">Headcount</p><p className="mt-2 text-2xl font-black">{employees?.length||0}</p></div>
  <div className="card"><p className="text-sm text-black/45">Open roles</p><p className="mt-2 text-2xl font-black">{postings?.filter(p=>p.status==="open").length||0}</p></div>
  <div className="card"><p className="text-sm text-black/45">Turnover</p><p className="mt-2 text-2xl font-black">{turnover}%</p></div>
  <div className="card"><p className="text-sm text-black/45">Avg. tenure</p><p className="mt-2 text-2xl font-black">{avgTenureMonths} mo</p></div>
 </div>
 <div className="mt-6 grid gap-4 lg:grid-cols-3">{employees?.map(e=><div className="card" key={e.id}><span className="grid h-11 w-11 place-items-center rounded-full bg-lime font-black">{e.entities?.name?.[0]}</span><h3 className="mt-4 font-black">{e.entities?.name}</h3><p className="text-sm text-black/45">{e.job_title||"Team member"}</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-moss">{e.department||"General"} · {e.status}</p></div>)}</div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="card"><div className="flex items-center gap-2"><CalendarDays/><h2 className="text-xl font-black">Leave approvals</h2></div><div className="mt-4 divide-y">{leaves?.map(l=><div className="flex items-center justify-between py-3" key={l.id}><div><b className="text-sm">{l.employees?.entities?.name}</b><p className="text-xs text-black/40">{l.leave_type} · {l.starts_on} → {l.ends_on}</p></div><span className="text-xs font-bold capitalize">{l.status==="pending"?<ApproveLeave id={l.id}/>:l.status}</span></div>)}</div></section><PeopleOpsActions employees={employees||[]} onboarding={onboarding||[]}/></div>
 <section className="card mt-6"><div className="flex items-center gap-2"><UserRoundCheck/><h2 className="text-xl font-black">Attendance log</h2></div><div className="mt-4 max-h-64 divide-y overflow-auto">{attendance?.map(a=><div className="flex justify-between py-3 text-sm" key={a.id}><b>{a.employees?.entities?.name}</b><span className="text-black/45">{new Date(a.clock_in).toLocaleString()} {a.clock_out?"· completed":"· active"}</span></div>)}</div></section>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Job postings" icon={<Briefcase size={18}/>} action={<JobPostingActions/>} empty="No open roles.">{postings?.map((p:any)=><div className="flex justify-between py-3 text-sm" key={p.id}><b>{p.title}</b><span className="text-xs capitalize text-black/45">{p.department} · {p.status}</span></div>)}</ListSection>
  <ListSection title="Candidate pipeline (ATS)" action={<CandidateActions jobPostings={postings||[]}/>} empty="No candidates yet.">{candidates?.map((c:any)=><CandidateRow c={c} key={c.id}/>)}</ListSection>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Performance reviews" action={<ReviewActions employees={employees||[]}/>} empty="No reviews yet.">{reviews?.map((r:any)=><ReviewRow r={r} key={r.id}/>)}</ListSection>
  <ListSection title="Goals" action={<GoalActions employees={employees||[]}/>} empty="No goals set.">{goals?.map((g:any)=><GoalRow g={g} key={g.id}/>)}</ListSection>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Benefits" action={<div className="flex gap-2"><BenefitPlanActions/><EnrollActions employees={employees||[]} plans={plans||[]}/></div>} empty="No benefit plans yet.">{plans?.map((p:any)=><div className="flex justify-between py-3 text-sm" key={p.id}><b>{p.name}</b><span className="text-xs capitalize text-black/45">{p.category} · ${p.cost_employee}/mo employee</span></div>)}{enrollments&&enrollments.length>0&&<div className="mt-2 pt-2 text-xs text-black/40">{enrollments.length} active enrollments</div>}</ListSection>
  <ListSection title="Documents & e-signature" action={<DocumentActions employees={employees||[]}/>} empty="Nothing pending signature.">{documents?.map((d:any)=><DocumentRow d={d} key={d.id}/>)}</ListSection>
 </div>
 <section className="card mt-6"><h2 className="text-xl font-black">Headcount by department</h2><div className="mt-4 space-y-2">{Object.entries(byDept).map(([dept,n])=><div key={dept} className="flex items-center gap-3 text-sm"><span className="w-32 shrink-0 truncate font-bold">{dept}</span><div className="h-2 flex-1 rounded-full bg-black/5"><div className="h-2 rounded-full bg-moss" style={{width:`${(n/(employees?.length||1))*100}%`}}/></div><span className="w-6 text-right text-black/45">{n}</span></div>)}</div></section>
 </>}
