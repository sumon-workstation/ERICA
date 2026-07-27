import{getContext}from"@/lib/context";import{PageHeader}from"@/components/page-header";import{Pipeline}from"@/components/pipeline";import{CrmForms}from"@/components/crm-forms";
import{CrmTaskActions,QuoteActions,QuoteRow,CaseActions,CaseRow,CampaignActions,ApprovalRow,AssignToMe}from"@/components/module-actions";import{money}from"@/lib/utils";
import{ListSection,Badge}from"@/components/list-section";
export default async function CRM(){const{db,user,member}=await getContext(),oid=member.org_id;
 const[{data:deals},{data:entities},{data:tasks},{data:activity},{data:quotes},{data:cases},{data:campaigns},{data:approvals}]=await Promise.all([
  db.from("deals").select("*,entities(name)").eq("org_id",oid).order("created_at"),
  db.from("entities").select("id,name,email,phone,is_customer,lead_score,lead_source,territory,assigned_to").eq("org_id",oid).order("name"),
  db.from("tasks").select("*,entities(name)").eq("org_id",oid).eq("module","crm").order("created_at",{ascending:false}),
  db.from("activity_log").select("*").eq("org_id",oid).in("module",["entities","deals","tasks","cases"]).order("created_at",{ascending:false}).limit(8),
  db.from("quotes").select("*,entities(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("cases").select("*,entities(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("campaigns").select("*,campaign_members(count)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("approval_requests").select("*").eq("org_id",oid).order("created_at",{ascending:false}).limit(10)]);
 const open=deals?.filter(x=>!["Won","Lost"].includes(x.stage))||[];
 const won=deals?.filter(x=>x.stage==="Won").length||0,lost=deals?.filter(x=>x.stage==="Lost").length||0;
 const winRate=won+lost?Math.round((won/(won+lost))*100):0;
 const forecast=open.reduce((s,x)=>s+Number(x.value)*(Number(x.probability)/100),0);
 return <><PageHeader eyebrow="CRM · Customer 360" title="Revenue pipeline"><CrmForms entities={entities||[]} userId={user.id}/></PageHeader>
 <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
  <div className="card"><p className="text-sm text-black/45">Open pipeline</p><p className="mt-2 text-2xl font-black">{money(open.reduce((s,x)=>s+Number(x.value),0))}</p></div>
  <div className="card"><p className="text-sm text-black/45">Weighted forecast</p><p className="mt-2 text-2xl font-black">{money(forecast)}</p></div>
  <div className="card"><p className="text-sm text-black/45">Win rate</p><p className="mt-2 text-2xl font-black">{winRate}%</p></div>
  <div className="card"><p className="text-sm text-black/45">Active deals</p><p className="mt-2 text-2xl font-black">{deals?.length||0}</p></div>
  <div className="card"><p className="text-sm text-black/45">Contacts</p><p className="mt-2 text-2xl font-black">{entities?.length||0}</p></div>
 </div>
 <div className="overflow-x-auto pb-4"><Pipeline deals={deals||[]}/></div>
 <div className="mt-4 grid gap-6 lg:grid-cols-2">
  <section className="card"><h2 className="text-xl font-black">Contacts &amp; leads</h2><div className="mt-4 max-h-96 divide-y overflow-auto">{entities?.map(e=><div className="flex items-center justify-between gap-2 py-3 text-sm" key={e.id}><div className="min-w-0"><b className="truncate">{e.name}</b><p className="truncate text-xs text-black/40">{e.email||"—"} {e.lead_source?`· ${e.lead_source}`:""} {e.territory?`· ${e.territory}`:""}</p></div><div className="flex shrink-0 items-center gap-2"><Badge tone={e.is_customer?"good":"default"}>{e.is_customer?"Customer":`Score ${e.lead_score||0}`}</Badge><AssignToMe id={e.id} mine={e.assigned_to===user.id} userId={user.id}/></div></div>)}</div></section>
  <section className="card"><h2 className="text-xl font-black">Relationship timeline</h2><div className="mt-4 max-h-96 divide-y overflow-auto">{activity?.map(a=><div className="py-3" key={a.id}><b className="text-sm">{a.summary}</b><p className="text-xs capitalize text-black/40">{a.module} · {new Date(a.created_at).toLocaleString()}</p></div>)}</div></section>
 </div>
 <CrmTaskActions entities={entities||[]} tasks={tasks||[]}/>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Quotes & proposals" action={<QuoteActions entities={entities||[]} deals={deals||[]}/>} empty="No quotes yet.">{quotes?.map(q=><QuoteRow q={q} key={q.id}/>)}</ListSection>
  <ListSection title="Support cases" action={<CaseActions entities={entities||[]}/>} empty="No open cases.">{cases?.map(c=><CaseRow c={c} key={c.id}/>)}</ListSection>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Campaigns" action={<CampaignActions entities={entities||[]} campaigns={campaigns||[]}/>} empty="No campaigns yet.">{campaigns?.map((c:any)=><div className="flex items-center justify-between py-3 text-sm" key={c.id}><div><b>{c.name}</b><p className="text-xs capitalize text-black/40">{c.type} · {c.status} · {c.campaign_members?.[0]?.count||0} members</p></div><span className="text-xs font-bold text-black/45">{money(c.budget)} → {money(c.expected_revenue)}</span></div>)}</ListSection>
  <ListSection title="Deal desk approvals" empty="No approvals pending.">{approvals?.map(a=><ApprovalRow a={a} key={a.id}/>)}</ListSection>
 </div>
 </>}
