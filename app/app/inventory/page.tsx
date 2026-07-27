import{getContext}from"@/lib/context";import{PageHeader}from"@/components/page-header";import{RecordForm}from"@/components/record-form";
import{StockAction,WarehouseActions,VariantActions,BundleActions,SerialActions,SerialRow}from"@/components/inventory-extras";
import{AlertTriangle,PackageCheck,Warehouse as WarehouseIcon}from"lucide-react";import{money,daysSince}from"@/lib/utils";
import{ListSection}from"@/components/list-section";
export default async function Inventory(){const{db,member}=await getContext(),oid=member.org_id,currency=(member.organizations as any)?.currency||"USD";
 const[{data:items},{data:assets},{data:moves},{data:warehouses},{data:variants},{data:components},{data:serials},{data:wstock}]=await Promise.all([
  db.from("inventory_items").select("*").eq("org_id",oid).order("name"),
  db.from("assets").select("*,employees(entities(name))").eq("org_id",oid),
  db.from("stock_movements").select("*,inventory_items(name)").eq("org_id",oid).order("created_at",{ascending:false}).limit(200),
  db.from("warehouses").select("*").eq("org_id",oid).order("created_at"),
  db.from("item_variants").select("*,inventory_items(name)").eq("org_id",oid),
  db.from("item_components").select("*,parent:parent_item_id(name),component:component_item_id(name)").eq("org_id",oid),
  db.from("item_serials").select("*,inventory_items(name)").eq("org_id",oid).order("created_at",{ascending:false}),
  db.from("warehouse_stock").select("*,warehouses(name),inventory_items(name)").eq("org_id",oid)]);
 const lastMove:Record<string,string>={}; moves?.forEach(m=>{if(!lastMove[m.item_id])lastMove[m.item_id]=m.created_at});
 const totalValue=items?.reduce((s,i)=>s+Number(i.quantity)*Number(i.unit_cost),0)||0;
 const lowCount=items?.filter(i=>Number(i.quantity)<=Number(i.reorder_point)).length||0;
 const bookValue=(a:any)=>{if(!a.purchased_on||!a.purchase_cost)return null;const months=Math.max(0,(Date.now()-new Date(a.purchased_on).getTime())/2629800000);const dep=Math.min(1,months/(a.depreciation_months||36));return Math.max(0,a.purchase_cost*(1-dep))};
 return <><PageHeader eyebrow="Inventory & assets" title="Know what's where"><div className="flex flex-wrap gap-2"><StockAction items={items||[]} warehouses={warehouses||[]}/><WarehouseActions/><RecordForm table="inventory_items" button="New item" fields={[{name:"name",label:"Item name",required:true},{name:"sku",label:"SKU",required:true},{name:"category",label:"Category"},{name:"barcode",label:"Barcode"},{name:"quantity",label:"Opening quantity",type:"number"},{name:"reorder_point",label:"Reorder at",type:"number"},{name:"unit_cost",label:"Unit cost",type:"number"}]}/></div></PageHeader>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <div className="card"><p className="text-sm text-black/45">Inventory value (wtd. avg.)</p><b className="mt-2 block text-2xl">{money(totalValue,currency)}</b></div>
  <div className="card"><p className="text-sm text-black/45">SKUs tracked</p><b className="mt-2 block text-2xl">{items?.length||0}</b></div>
  <div className="card"><p className="text-sm text-black/45">Low stock</p><b className="mt-2 block text-2xl">{lowCount}</b></div>
  <div className="card"><p className="text-sm text-black/45">Warehouses</p><b className="mt-2 block text-2xl">{warehouses?.length||0}</b></div>
 </div>
 <div className="mt-6 grid gap-4 lg:grid-cols-3">{items?.map(i=>{const low=Number(i.quantity)<=Number(i.reorder_point),age=daysSince(lastMove[i.id]);return <div className="card" key={i.id}><div className="flex justify-between"><PackageCheck className="text-moss"/>{low&&<span className="flex items-center gap-1 text-xs font-bold text-amber-700"><AlertTriangle size={14}/> Low</span>}</div><h3 className="mt-6 text-lg font-black">{i.name}</h3><p className="text-xs text-black/40">{i.sku}{i.category?` · ${i.category}`:""}{i.barcode?` · #${i.barcode}`:""}</p><div className="mt-5 flex justify-between"><b>{i.quantity} {i.unit}</b><span className="text-sm text-black/50">{money(i.unit_cost,currency)} each</span></div><p className="mt-2 text-[11px] text-black/35">{age!==null?`Last movement ${age}d ago`:"No movement yet"}</p></div>})}</div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <section className="card"><h2 className="text-xl font-black">Recent movements</h2><div className="max-h-72 overflow-auto">{moves?.slice(0,8).map(m=><div className="flex justify-between border-b py-3 text-sm" key={m.id}><span>{m.inventory_items?.name}</span><b className={m.direction==="in"?"text-green-700":"text-red-600"}>{m.direction==="in"?"+":"-"}{m.quantity}</b></div>)}</div></section>
  <section className="card"><h2 className="text-xl font-black">Company assets</h2><div className="max-h-72 overflow-auto">{assets?.length?assets.map((a:any)=><div className="flex justify-between border-b py-3 text-sm" key={a.id}><b>{a.name}</b><span className="text-right text-xs text-black/50">{a.employees?.entities?.name||a.status}{bookValue(a)!==null&&<><br/>{money(bookValue(a)!,currency)} book value</>}</span></div>):<p className="py-8 text-sm text-black/40">No assets checked out yet.</p>}</div></section>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Warehouses" icon={<WarehouseIcon size={18}/>} empty="No warehouses yet.">{warehouses?.map((w:any)=><div className="flex justify-between py-3 text-sm" key={w.id}><b>{w.name}</b><span className="text-xs text-black/45">{w.location||"—"} · {wstock?.filter((s:any)=>s.warehouse_id===w.id).reduce((s:number,x:any)=>s+Number(x.quantity),0)} units</span></div>)}</ListSection>
  <ListSection title="Variants" action={<VariantActions items={items||[]}/>} empty="No variants yet.">{variants?.map((v:any)=><div className="flex justify-between py-3 text-sm" key={v.id}><div><b>{v.name}</b><p className="text-xs text-black/40">{v.inventory_items?.name} · {v.sku_suffix}</p></div><span className="font-bold">{v.quantity}</span></div>)}</ListSection>
 </div>
 <div className="mt-6 grid gap-6 lg:grid-cols-2">
  <ListSection title="Bundles & kits" action={<BundleActions items={items||[]}/>} empty="No bundles composed yet.">{components?.map((c:any)=><div className="flex justify-between py-3 text-sm" key={c.id}><b>{c.parent?.name}</b><span className="text-xs text-black/45">{c.quantity} × {c.component?.name}</span></div>)}</ListSection>
  <ListSection title="Serial / batch tracking" action={<SerialActions items={items||[]} warehouses={warehouses||[]}/>} empty="No serials registered.">{serials?.map((s:any)=><SerialRow s={s} key={s.id}/>)}</ListSection>
 </div>
 </>}
