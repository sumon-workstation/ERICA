import { NextResponse } from "next/server"; import { createClient } from "@/lib/supabase/server"; import { runAutomations } from "@/lib/automation";
async function ctx(){const db=createClient(),{data:{user}}=await db.auth.getUser();if(!user)throw Error("Unauthorized");const {data:m}=await db.from("org_members").select("org_id").eq("user_id",user.id).single();return{db,oid:m!.org_id}}
export async function POST(req:Request){try{
 const data=await req.json(),c=await ctx();
 if(data.entity_id==="")data.entity_id=null;
 const {data:row,error}=await c.db.from("cases").insert({...data,org_id:c.oid}).select().single();
 if(error)throw error;
 if(row.priority==="urgent")await runAutomations(c.db,c.oid,"case.urgent",row);
 return NextResponse.json(row);
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
export async function PATCH(req:Request){try{
 const {id,status}=await req.json(),c=await ctx();
 const patch:any={status}; if(status==="resolved"||status==="closed")patch.resolved_at=new Date().toISOString();
 const {data:row,error}=await c.db.from("cases").update(patch).eq("id",id).eq("org_id",c.oid).select().single();
 if(error)throw error; return NextResponse.json(row);
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
