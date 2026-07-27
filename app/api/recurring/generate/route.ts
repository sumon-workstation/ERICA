import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server";
const step:Record<string,number>={monthly:1,quarterly:3,yearly:12};
function addMonthsClamped(dateStr:string,months:number){
 const d=new Date(`${dateStr}T00:00:00Z`);
 const targetMonthIndex=d.getUTCMonth()+months,year=d.getUTCFullYear()+Math.floor(targetMonthIndex/12),month=((targetMonthIndex%12)+12)%12;
 const daysInTargetMonth=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 return new Date(Date.UTC(year,month,Math.min(d.getUTCDate(),daysInTargetMonth))).toISOString().slice(0,10);
}
export async function POST(req:Request){try{
 const {id}=await req.json(),db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();
 const {data:sub,error}=await db.from("recurring_invoices").select("*").eq("id",id).eq("org_id",m!.org_id).single();
 if(error||!sub)throw Error(error?.message||"Not found");
 const {data:invoice,error:ie}=await db.from("invoices").insert({org_id:m!.org_id,customer_id:sub.customer_id,
  invoice_number:`INV-REC-${Date.now().toString().slice(-6)}`,status:"sent",amount:sub.amount,
  items:[{description:`${sub.plan_name} (${sub.interval})`,amount:sub.amount}]}).select().single();
 if(ie)throw ie;
 const nextRunOn=addMonthsClamped(sub.next_run_on,step[sub.interval]);
 await db.from("recurring_invoices").update({next_run_on:nextRunOn}).eq("id",id).eq("org_id",m!.org_id);
 return NextResponse.json(invoice);
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
