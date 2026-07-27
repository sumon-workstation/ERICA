import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){try{
 const {quote_id}=await req.json(),db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();
 const {data:quote,error:qe}=await db.from("quotes").select("*").eq("id",quote_id).eq("org_id",m!.org_id).single();
 if(qe||!quote)throw Error(qe?.message||"Quote not found");
 const {data:order,error}=await db.from("sales_orders").insert({org_id:m!.org_id,entity_id:quote.entity_id,quote_id:quote.id,
  order_number:`SO-${Date.now().toString().slice(-6)}`,status:"confirmed",items:quote.items,total:quote.total}).select().single();
 if(error)throw error;
 await db.from("quotes").update({status:"accepted"}).eq("id",quote_id).eq("org_id",m!.org_id);
 return NextResponse.json(order);
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
