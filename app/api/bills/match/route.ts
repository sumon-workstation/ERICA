import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){try{
 const {id}=await req.json(),db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();
 const {data:bill,error}=await db.from("bills").select("*,purchase_orders(total)").eq("id",id).eq("org_id",m!.org_id).single();
 if(error||!bill)throw Error(error?.message||"Bill not found");
 const poTotal=Number(bill.purchase_orders?.total||0);
 const status=poTotal&&Math.abs(poTotal-Number(bill.amount))<0.01?"matched":"mismatched";
 const {data:row,error:ue}=await db.from("bills").update({status}).eq("id",id).eq("org_id",m!.org_id).select().single();
 if(ue)throw ue; return NextResponse.json(row);
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
