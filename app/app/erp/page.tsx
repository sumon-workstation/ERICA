import{getContext}from"@/lib/context";import{PageHeader}from"@/components/page-header";import{RecordForm}from"@/components/record-form";import{InvoicePDF}from"@/components/invoice-pdf";import{money}from"@/lib/utils";
import{ErpActions}from"@/components/module-actions";
import{SalesOrderActions,SalesOrderRow,BillActions,BillRow,ExpenseActions,ExpenseRow,BudgetActions,RecurringActions,RecurringRow}from"@/components/erp-actions";
import{ListSection}from"@/components/list-section";
export default async function ERP(){const{db,member}=await getContext(),oid=member.org_id,currency=(member.organizations as any)?.currency||"USD";
 const[{data:invoices},{data:pos},{data:ledger},{data:entities},{data:employees},{data:orders},{data:bills},{data:expenses},{data:budgets},{data:recurring}]=await Promise.all([
  db.from("invoices").select("*,entities(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("purchase_orders").select("*,entities(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("ledger_entries").select("*").eq("org_id",oid).order("entry_date",{ascending:false}),
  db.from("entities").select("id,name,is_vendor,is_customer").eq("org_id",oid).order("name"),
  db.from("employees").select("id,entities(name)").eq("org_id",oid),
  db.from("sales_orders").select("*,entities(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("bills").select("*,entities(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("expenses").select("*,employees(entities(name))").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("budgets").select("*").eq("org_id",oid).order("period_start",{ascending:false}),
  db.from("recurring_invoices").select("*,entities(name)").eq("org_id",oid).order("next_run_on")]);
 const income=ledger?.filter(x=>x.type==="income").reduce((s,x)=>s+Number(x.amount),0)||0,expense=ledger?.filter(x=>x.type==="expense").reduce((s,x)=>s+Number(x.amount),0)||0;
 const ar=invoices?.filter(i=>i.status!=="paid").reduce((s,i)=>s+Number(i.amount),0)||0;
 const ap=(bills?.filter(b=>b.status!=="paid").reduce((s,b)=>s+Number(b.amount),0)||0)+(pos?.filter(p=>p.status!=="received"&&p.status!=="cancelled").reduce((s,p)=>s+Number(p.total),0)||0);
 const vendors=entities?.filter(e=>e.is_vendor)||[],customers=entities?.filter(e=>e.is_customer)||entities||[];
 const budgetActual=(b:any)=>ledger?.filter(l=>l.type==="expense"&&l.category===b.category&&l.entry_date>=b.period_start&&l.entry_date<=b.period_end).reduce((s,l)=>s+Number(l.amount),0)||0;
 return <><PageHeader eyebrow="Finance & operations" title="Money without mystery"><div className="flex flex-wrap gap-2"><ErpActions vendors={vendors} customers={customers}/><RecordForm table="ledger_entries" button="Add ledger entry" fields={[{name:"type",label:"Type",options:["income","expense"]},{name:"category",label:"Category",required:true},{name:"description",label:"Description"},{name:"amount",label:"Amount",type:"number",required:true},{name:"entry_date",label:"Date",type:"date"}]}/></div></PageHeader>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
  <div className="card"><p className="text-sm text-black/45">Income</p><b className="mt-2 block text-2xl">{money(income,currency)}</b></div>
  <div className="card"><p className="text-sm text-black/45">Expenses</p><b className="mt-2 block text-2xl">{money(expense,currency)}</b></div>
  <div className="card bg-ink text-white"><p className="text-sm text-white/45">Net (P&amp;L)</p><b className="mt-2 block text-2xl text-lime">{money(income-expense,currency)}</b></div>
  <div className="card"><p className="text-sm text-black/45">Accounts receivable</p><b className="mt-2 block text-2xl">{money(ar,currency)}</b></div>
  <div className="card"><p className="text-sm text-black/45">Accounts payable</p><b className="mt-2 block text-2xl">{money(ap,currency)}</b></div>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <section className="card"><h2 className="text-xl font-black">Invoices</h2><div className="mt-4 max-h-96 divide-y overflow-auto">{invoices?.map(i=><div className="flex justify-between py-3" key={i.id}><div><b className="text-sm">{i.invoice_number} · {i.entities?.name}</b><p className="text-xs text-black/40">{i.status} · {money(i.amount,currency)}</p></div><InvoicePDF invoice={i}/></div>)}</div></section>
  <section className="card"><h2 className="text-xl font-black">Purchase orders</h2><div className="mt-4 max-h-96 divide-y overflow-auto">{pos?.map(p=><div className="flex justify-between py-3 text-sm" key={p.id}><b>{p.po_number} · {p.entities?.name}</b><span className="capitalize text-black/45">{p.status}</span></div>)}</div></section>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Sales orders & quotations" action={<SalesOrderActions entities={customers}/>} empty="No sales orders yet.">{orders?.map(o=><SalesOrderRow o={o} key={o.id}/>)}</ListSection>
  <ListSection title="Vendor bills · 3-way match" action={<BillActions vendors={vendors} pos={pos||[]}/>} empty="No vendor bills yet.">{bills?.map(b=><BillRow b={b} key={b.id}/>)}</ListSection>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Expense reports" action={<ExpenseActions employees={employees||[]}/>} empty="No expenses submitted.">{expenses?.map(x=><ExpenseRow x={x} key={x.id}/>)}</ListSection>
  <ListSection title="Recurring billing" action={<RecurringActions customers={customers}/>} empty="No subscriptions yet.">{recurring?.map(r=><RecurringRow r={r} key={r.id}/>)}</ListSection>
 </div>
 <ListSection title="Budgets vs actuals" action={<BudgetActions/>} empty="No budget lines yet.">{budgets?.map(b=>{const actual=budgetActual(b),over=actual>b.amount_planned;return <div className="flex items-center justify-between py-3 text-sm" key={b.id}><div><b>{b.category}</b><p className="text-xs text-black/40">{b.period_start} → {b.period_end}</p></div><span className={`font-bold ${over?"text-red-600":"text-moss"}`}>{money(actual,currency)} / {money(b.amount_planned,currency)}</span></div>})}</ListSection>
 </>}
