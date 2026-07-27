import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

function fail(reason:string):never{
 redirect(`/setup-required?reason=${encodeURIComponent(reason)}`);
}

export async function getContext(){
 cookies(); // touch a Dynamic API unconditionally so this route is never mistakenly prerendered as static, even when the early-exit branch below is taken
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  fail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in this environment's variables.");

 const db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return redirect("/login");

 let {data:member,error:memberError}=await db.from("org_members")
  .select("org_id,role,organizations(name,trial_ends_at,subscription_status,currency)")
  .eq("user_id",user.id).limit(1).maybeSingle();
 if(memberError)fail(`Database error reading org_members — the schema is likely not migrated yet: ${memberError.message}`);

 if(!member){
  const {error:createError}=await db.rpc("create_organization",{org_name:`${user.email?.split("@")[0]||"My"} Workspace`});
  if(createError)fail(`Database error creating your workspace — the schema is likely not migrated yet: ${createError.message}`);
  const x=await db.from("org_members").select("org_id,role,organizations(name,trial_ends_at,subscription_status,currency)").eq("user_id",user.id).limit(1).maybeSingle();
  if(x.error)fail(`Database error after creating workspace: ${x.error.message}`);
  member=x.data;
 }
 if(!member)fail("Unable to initialize a workspace for this account. Check that supabase/migrations have been applied.");
 return {db,user,member};
}
