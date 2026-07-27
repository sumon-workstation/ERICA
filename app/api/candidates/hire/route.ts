import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){try{
 const {candidate_id}=await req.json(),db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();
 const {data:candidate,error:ce}=await db.from("candidates").select("*,job_postings(title,department)").eq("id",candidate_id).eq("org_id",m!.org_id).single();
 if(ce||!candidate)throw Error(ce?.message||"Candidate not found");
 const {data:entity,error:ee}=await db.from("entities").insert({org_id:m!.org_id,type:"person",name:candidate.name,email:candidate.email,phone:candidate.phone,is_employee:true}).select().single();
 if(ee)throw ee;
 const {error:emp}=await db.from("employees").insert({org_id:m!.org_id,entity_id:entity.id,job_title:candidate.job_postings?.title,department:candidate.job_postings?.department,start_date:new Date().toISOString().slice(0,10)});
 if(emp)throw emp;
 await db.from("candidates").update({stage:"hired"}).eq("id",candidate_id).eq("org_id",m!.org_id);
 return NextResponse.json({ok:true});
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
