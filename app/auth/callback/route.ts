import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(req:Request){const url=new URL(req.url),code=url.searchParams.get("code");if(code)await createClient().auth.exchangeCodeForSession(code);return NextResponse.redirect(new URL("/app",url.origin))}
