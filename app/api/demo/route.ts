import{NextResponse}from"next/server";import{createClient}from"@/lib/supabase/server";import{runAutomations}from"@/lib/automation";
export async function POST(){try{const db=createClient(),{data:{user}}=await db.auth.getUser();if(!user)throw Error("Unauthorized");const{data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single(),org_id=m!.org_id;const{count}=await db.from("deals").select("*",{count:"exact",head:true}).eq("org_id",org_id);if(count)return NextResponse.json({ok:true,existing:true});
 const{data:entities,error:e}=await db.from("entities").insert([
  {org_id,type:"company",name:"Northstar Labs",email:"hello@northstarlabs.co",is_lead:true,tags:["SaaS","Priority"]},
  {org_id,type:"company",name:"Studio Kindred",email:"ops@studiokindred.com",is_customer:true},
  {org_id,type:"company",name:"Apex Office Supply",email:"orders@apexoffice.co",is_vendor:true},
  {org_id,type:"person",name:"Maya Chen",email:"maya@erica.demo",is_employee:true},
  {org_id,type:"person",name:"Jon Bell",email:"jon@erica.demo",is_employee:true}
 ]).select();if(e)throw e;const north=entities![0],kindred=entities![1],vendor=entities![2],maya=entities![3],jon=entities![4];
 const{data:employees}=await db.from("employees").insert([{org_id,entity_id:maya.id,job_title:"Head of Growth",department:"Revenue",start_date:"2026-02-03"},{org_id,entity_id:jon.id,job_title:"Operations Lead",department:"Operations",start_date:"2026-03-10"}]).select();
 const{data:rules}=await db.from("automation_rules").insert([{org_id,name:"Restock before we run out",trigger_key:"inventory.low",action_key:"draft_po"},{org_id,name:"Turn wins into revenue",trigger_key:"deal.won",action_key:"customer_invoice"},{org_id,name:"Keep leave in sync",trigger_key:"leave.approved",action_key:"leave_calendar"},{org_id,name:"Post approved expenses",trigger_key:"expense.approved",action_key:"expense_ledger"},{org_id,name:"Alert on urgent cases",trigger_key:"case.urgent",action_key:"case_notify"}]).select();
 const{data:deals}=await db.from("deals").insert([{org_id,entity_id:north.id,title:"Northstar expansion",value:42000,stage:"Won",probability:100},{org_id,entity_id:kindred.id,title:"Kindred services renewal",value:18500,stage:"Negotiation",probability:80},{org_id,entity_id:north.id,title:"Analytics rollout",value:12000,stage:"Proposal",probability:55}]).select("*,entities(*)");
 const{data:items}=await db.from("inventory_items").insert([{org_id,sku:"LAP-14-PRO",name:"14-inch Pro Laptop",quantity:2,reorder_point:3,unit_cost:1299},{org_id,sku:"HEAD-NC-01",name:"Noise-canceling Headset",quantity:18,reorder_point:5,unit_cost:189},{org_id,sku:"DOCK-USBC",name:"USB-C Dock",quantity:7,reorder_point:4,unit_cost:119}]).select();
 await db.from("assets").insert([{org_id,name:"MacBook Pro — Maya",asset_tag:"ERICA-001",status:"checked_out",assigned_employee_id:employees![0].id,checked_out_at:new Date().toISOString()},{org_id,name:"Dell XPS — Jon",asset_tag:"ERICA-002",status:"checked_out",assigned_employee_id:employees![1].id,checked_out_at:new Date().toISOString()}]);
 const{data:leave}=await db.from("leave_requests").insert({org_id,employee_id:employees![0].id,leave_type:"Vacation",starts_on:"2026-08-10",ends_on:"2026-08-14",reason:"Family trip",status:"approved",reviewed_by:user.id,reviewed_at:new Date().toISOString()}).select().single();
 await db.from("onboarding_items").insert([{org_id,employee_id:employees![1].id,title:"Complete security training",completed:true},{org_id,employee_id:employees![1].id,title:"Meet department leads",completed:false}]);
 await db.from("attendance").insert([{org_id,employee_id:employees![0].id,clock_in:new Date(Date.now()-8*3600000).toISOString(),clock_out:new Date().toISOString()},{org_id,employee_id:employees![1].id,clock_in:new Date(Date.now()-7*3600000).toISOString()}]);
 await db.from("ledger_entries").insert([{org_id,type:"income",category:"Services",description:"Studio Kindred retainer",amount:12500},{org_id,type:"expense",category:"Software",description:"Team tools",amount:1280},{org_id,type:"expense",category:"Operations",description:"Office supplies",amount:640}]);
 const{data:po}=await db.from("purchase_orders").insert({org_id,vendor_id:vendor.id,po_number:"PO-2026-001",status:"approved",total:1480,items:[{description:"Office starter kits",quantity:10,price:148}]}).select().single();

 // CRM: cases, campaign, quote
 await db.from("cases").insert([{org_id,entity_id:kindred.id,subject:"Renewal contract question",priority:"normal",description:"Kindred asked about multi-year renewal pricing."},{org_id,entity_id:north.id,subject:"Login outage",priority:"urgent",description:"Northstar cannot access the dashboard."}]);
 const{data:campaign}=await db.from("campaigns").insert({org_id,name:"Q3 growth push",type:"email",status:"active",budget:4000,expected_revenue:30000,start_date:"2026-07-01",end_date:"2026-09-30"}).select().single();
 if(campaign)await db.from("campaign_members").insert([{org_id,campaign_id:campaign.id,entity_id:north.id,status:"responded"},{org_id,campaign_id:campaign.id,entity_id:kindred.id,status:"converted"}]);
 await db.from("quotes").insert({org_id,entity_id:north.id,deal_id:deals![2].id,quote_number:"QUO-2026-001",status:"sent",valid_until:"2026-08-30",items:[{description:"Analytics rollout",amount:12000}],subtotal:12000,total:12000});

 // ERP: sales order, vendor bill, expense, budget, recurring billing
 await db.from("sales_orders").insert({org_id,entity_id:kindred.id,order_number:"SO-2026-001",status:"confirmed",items:[{description:"Services renewal",amount:18500}],total:18500});
 if(po)await db.from("bills").insert({org_id,vendor_id:vendor.id,po_id:po.id,bill_number:"BILL-2026-001",status:"pending",amount:1480,due_on:"2026-08-15"});
 const{data:expense}=await db.from("expenses").insert({org_id,employee_id:employees![0].id,category:"Travel",description:"Client visit — flights",amount:420,status:"approved"}).select().single();
 await db.from("budgets").insert({org_id,category:"Software",period_start:"2026-07-01",period_end:"2026-07-31",amount_planned:2000});
 await db.from("recurring_invoices").insert({org_id,customer_id:kindred.id,plan_name:"Managed services",amount:1500,interval:"monthly",next_run_on:"2026-08-01"});

 // HR: ATS, performance, benefits, esignature
 const{data:posting}=await db.from("job_postings").insert({org_id,title:"Senior Product Engineer",department:"Engineering",location:"Remote",status:"open",description:"Own core platform features end to end."}).select().single();
 if(posting)await db.from("candidates").insert([{org_id,job_posting_id:posting.id,name:"Priya Nair",email:"priya@example.com",stage:"interview",score:82},{org_id,job_posting_id:posting.id,name:"Leo García",email:"leo@example.com",stage:"applied",score:null}]);
 await db.from("performance_reviews").insert({org_id,employee_id:employees![1].id,cycle:"H1 2026",rating:4,strengths:"Reliable delivery, strong ownership.",improvements:"Delegate more.",status:"submitted"});
 await db.from("goals").insert({org_id,employee_id:employees![0].id,title:"Grow qualified pipeline 20%",target:"20% QoQ",progress:60,due_on:"2026-09-30"});
 const{data:plan}=await db.from("benefit_plans").insert({org_id,name:"Core Health PPO",category:"health",provider:"Meridian",cost_employee:45,cost_employer:310}).select().single();
 if(plan)await db.from("benefit_enrollments").insert({org_id,employee_id:employees![0].id,plan_id:plan.id});
 await db.from("hr_documents").insert({org_id,employee_id:employees![1].id,title:"Updated confidentiality agreement",status:"pending"});

 // Inventory: warehouse, variants, bundle, serials
 const{data:warehouse}=await db.from("warehouses").insert({org_id,name:"HQ warehouse",location:"Austin, TX",is_default:true}).select().single();
 if(items){await db.from("item_variants").insert({org_id,item_id:items[1].id,name:"Headset — Black",sku_suffix:"BLK",quantity:10});
  await db.from("item_components").insert({org_id,parent_item_id:items[0].id,component_item_id:items[1].id,quantity:1});
  await db.from("item_serials").insert([{org_id,item_id:items[0].id,serial_number:"SN-LAP-0001",status:"in_stock",warehouse_id:warehouse?.id},{org_id,item_id:items[0].id,serial_number:"SN-LAP-0002",status:"assigned",warehouse_id:warehouse?.id}]);}

 // Automation: webhook + credential
 await db.from("webhooks").insert({org_id,name:"Zapier / external CRM sync",trigger_key:"webhook.custom"});
 await db.from("automation_credentials").insert({org_id,name:"Slack notifications",kind:"api_key",value:"xoxb-demo-0000000000"});

 await runAutomations(db,org_id,"deal.won",deals![0]);await runAutomations(db,org_id,"inventory.low",items![0]);await runAutomations(db,org_id,"leave.approved",leave);
 if(expense)await runAutomations(db,org_id,"expense.approved",expense);
 await runAutomations(db,org_id,"case.urgent",{subject:"Login outage",description:"Northstar cannot access the dashboard."});
 return NextResponse.json({ok:true,rules:rules?.length})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
