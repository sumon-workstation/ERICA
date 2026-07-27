import { Logo } from "@/components/logo";
import { AlertTriangle } from "lucide-react";

const steps=[
 "Apply supabase/migrations/202607260001_initial.sql then 202607270001_expand_modules.sql to your Supabase project's SQL editor.",
 "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in your deployment's environment variables.",
 "Redeploy (or wait for the next deploy) so the new environment variables take effect.",
];

export default function SetupRequired({searchParams}:{searchParams:{reason?:string}}){
 const reason=searchParams.reason||"An unknown setup error occurred.";
 return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="w-full max-w-xl"><Logo/>
 <div className="card mt-8">
  <div className="flex items-center gap-3"><AlertTriangle className="text-amber-600" size={22}/><h1 className="text-2xl font-black">Setup isn't finished yet</h1></div>
  <p className="mt-4 rounded-xl bg-black/5 p-4 font-mono text-sm text-black/70">{reason}</p>
  <p className="mt-6 text-sm font-bold uppercase tracking-wider text-moss">What's left</p>
  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-black/70">{steps.map(s=><li key={s}>{s}</li>)}</ol>
  <a href="/app" className="btn mt-6 inline-block">Try again</a>
 </div></div></main>
}
