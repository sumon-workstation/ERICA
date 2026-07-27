import { NextResponse } from "next/server"; import { admin } from "@/lib/supabase/admin"; import { runAutomations } from "@/lib/automation";
export async function POST(req:Request,{params}:{params:{token:string}}){try{
 const db=admin();
 const {data:hook,error}=await db.from("webhooks").select("*").eq("token",params.token).single();
 if(error||!hook)return NextResponse.json({error:"Unknown webhook"},{status:404});
 if(!hook.enabled)return NextResponse.json({error:"Webhook disabled"},{status:403});
 const payload=await req.json().catch(()=>({}));
 await db.from("webhooks").update({last_triggered_at:new Date().toISOString()}).eq("id",hook.id);
 await runAutomations(db,hook.org_id,hook.trigger_key,payload);
 return NextResponse.json({ok:true});
}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
