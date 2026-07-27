import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(req:NextRequest){
  let res=NextResponse.next({request:req});
  const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
    cookies:{getAll:()=>req.cookies.getAll(),setAll(items:{name:string;value:string;options?:any}[]){items.forEach(i=>req.cookies.set(i.name,i.value));res=NextResponse.next({request:req});items.forEach(i=>res.cookies.set(i.name,i.value,i.options))}}
  });
  const {data:{user}}=await supabase.auth.getUser();
  if(!user&&req.nextUrl.pathname.startsWith("/app")) return NextResponse.redirect(new URL("/demo",req.url));
  if(user&&req.nextUrl.pathname==="/login") return NextResponse.redirect(new URL("/app",req.url));
  return res;
}
export const config={matcher:["/app/:path*","/login"]};
