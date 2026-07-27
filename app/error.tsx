"use client";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="card w-full max-w-lg text-center">
  <AlertTriangle className="mx-auto text-amber-600" size={28}/>
  <h1 className="mt-4 text-2xl font-black">Something went wrong</h1>
  <p className="mt-3 text-sm text-black/60">
   The page hit an unexpected error. If this keeps happening, check your deployment's
   function logs{error.digest?<> for error <code className="rounded bg-black/5 px-1.5 py-0.5">{error.digest}</code></>:null} — the full message is recorded there even though it isn't shown here.
  </p>
  <div className="mt-6 flex justify-center gap-3">
   <button onClick={reset} className="btn">Try again</button>
   <a href="/app" className="btn-secondary">Back to dashboard</a>
  </div>
 </div></main>
}
