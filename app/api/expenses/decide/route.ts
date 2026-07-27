import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server"; import { runAutomations } from "@/lib/automation";
export async function POST(req:Request){try{
 const {id,status}=await req.json(),db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();
 const {data:expense,error}=await db.from("expenses").update({status}).eq("id",id).eq("org_id",m!.org_id).select().single();
 if(error)throw error;
 if(status==="approved")await runAutomations(db,m!.org_id,"expense.approved",expense);
 return NextResponse.json(expense);
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
