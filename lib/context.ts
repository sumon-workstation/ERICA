import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export async function getContext(){
 const db=createClient(),{data:{user}}=await db.auth.getUser(); if(!user)return redirect("/login");
 let {data:member}=await db.from("org_members").select("org_id,role,organizations(name,trial_ends_at,subscription_status)").eq("user_id",user.id).limit(1).maybeSingle();
 if(!member){await db.rpc("create_organization",{org_name:`${user.email?.split("@")[0]||"My"} Workspace`});const x=await db.from("org_members").select("org_id,role,organizations(name,trial_ends_at,subscription_status)").eq("user_id",user.id).limit(1).single();member=x.data}
 if(!member)throw new Error("Unable to initialize workspace"); return {db,user,member};
}
