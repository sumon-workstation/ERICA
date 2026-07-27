import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server"; import { runAutomations } from "@/lib/automation";
export async function POST(req:Request){try{
 const {rule_id}=await req.json(),db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();
 const oid=m!.org_id;
 const {data:rule,error}=await db.from("automation_rules").select("*").eq("id",rule_id).eq("org_id",oid).single();
 if(error||!rule)throw Error(error?.message||"Rule not found");
 const {data:entity}=await db.from("entities").select("id").eq("org_id",oid).limit(1).maybeSingle();
 const {data:employee}=await db.from("employees").select("id").eq("org_id",oid).limit(1).maybeSingle();
 const samples:Record<string,any>={
  "inventory.low":{id:"00000000-0000-0000-0000-000000000000",name:"Sample item",quantity:1,reorder_point:5},
  "deal.won":{entity_id:entity?.id,title:"Sample deal",value:1000},
  "leave.approved":{employee_id:employee?.id,starts_on:new Date().toISOString().slice(0,10),ends_on:new Date().toISOString().slice(0,10),id:"00000000-0000-0000-0000-000000000000"},
  "expense.approved":{category:"Travel",description:"Sample expense",amount:150},
  "case.urgent":{subject:"Sample urgent case",description:"Manual test run"},
 };
 await runAutomations(db,oid,rule.trigger_key,samples[rule.trigger_key]||{});
 return NextResponse.json({ok:true});
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
