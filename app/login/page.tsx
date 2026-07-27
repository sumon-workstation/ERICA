"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { useSearchParams } from "next/navigation";
export default function Login(){
 const params=useSearchParams(),[signup,setSignup]=useState(params.get("mode")==="signup"),[error,setError]=useState(""),[loading,setLoading]=useState(false); const supabase=createClient();
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");const f=new FormData(e.currentTarget),email=String(f.get("email")),password=String(f.get("password"));
  const result=signup?await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/auth/callback`}}):await supabase.auth.signInWithPassword({email,password});
  if(result.error)setError(result.error.message);else location.href="/app";setLoading(false)}
 async function google(){await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${location.origin}/auth/callback`}})}
 return <main className="grid min-h-screen lg:grid-cols-2"><section className="hidden bg-ink p-14 text-white lg:flex lg:flex-col lg:justify-between"><Logo light/><div><p className="text-lime">“ERICA gave us one operating rhythm.”</p><p className="mt-4 max-w-lg text-4xl font-black leading-tight">The clarity of an enterprise platform, built for a team that moves fast.</p></div><p className="text-sm text-white/40">CRM · ERP · HR · Inventory · Automation</p></section><section className="grid place-items-center p-6"><div className="w-full max-w-md"><div className="lg:hidden"><Logo/></div><h1 className="mt-10 text-4xl font-black">{signup?"Build your workspace":"Welcome back"}</h1><p className="mt-2 text-black/50">{signup?"30 days free. No card required.":"Sign in to continue to ERICA."}</p>
 <form onSubmit={submit} className="mt-8 space-y-4"><label><span className="label">Email</span><input className="input" name="email" type="email" required/></label><label><span className="label">Password</span><input className="input" name="password" type="password" minLength={8} required/></label>{error&&<p className="text-sm text-red-600">{error}</p>}<button className="btn w-full" disabled={loading}>{loading?"Please wait…":signup?"Create account":"Sign in"}</button></form>
 <button onClick={google} className="btn-secondary mt-3 w-full">Continue with Google</button><button onClick={()=>setSignup(!signup)} className="mt-6 text-sm font-semibold text-moss">{signup?"Already have an account? Sign in":"New to ERICA? Start free"}</button></div></section></main>
}
