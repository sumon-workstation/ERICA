import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { money } from "@/lib/utils";
async function notify(subject:string,html:string){if(!process.env.RESEND_API_KEY)return;const resend=new Resend(process.env.RESEND_API_KEY);await resend.emails.send({from:process.env.EMAIL_FROM||"ERICA <onboarding@resend.dev>",to:process.env.AUTOMATION_NOTIFY_EMAIL||"delivered@resend.dev",subject,html})}
function conditionMet(condition:any,input:any):boolean{
 if(!condition||!condition.field)return true;
 const actual=input?.[condition.field],expected=condition.value;
 if(actual===undefined)return false;
 switch(condition.operator){
  case "equals": return String(actual)===String(expected);
  case "gt": return Number(actual)>Number(expected);
  case "lt": return Number(actual)<Number(expected);
  case "contains": return String(actual).includes(String(expected));
  default: return true;
 }
}
export async function runAutomations(db:SupabaseClient,orgId:string,trigger:string,input:any){
 const {data:rules}=await db.from("automation_rules").select("*").eq("org_id",orgId).eq("trigger_key",trigger).eq("enabled",true);
 for(const rule of rules||[]){
  if(!conditionMet(rule.condition,input)){await db.from("automation_runs").insert({org_id:orgId,rule_id:rule.id,status:"skipped",input,output:{reason:"condition not met"}});continue}
  try{let output:any={};
  if(rule.action_key==="draft_po"){const {data:vendor}=await db.from("entities").select("id").eq("org_id",orgId).eq("is_vendor",true).limit(1).maybeSingle();if(vendor){const {data}=await db.from("purchase_orders").insert({org_id:orgId,vendor_id:vendor.id,po_number:`PO-AUTO-${Date.now().toString().slice(-6)}`,status:"draft",items:[{item_id:input.id,name:input.name,quantity:Math.max(Number(input.reorder_point)*2-Number(input.quantity),1)}]}).select().single();output=data;await notify(`Low stock: ${input.name}`,`<h2>ERICA drafted a purchase order</h2><p>${input.name} is below its reorder point.</p>`)}}
  if(rule.action_key==="customer_invoice"){await db.from("entities").update({is_customer:true,is_lead:false}).eq("id",input.entity_id).eq("org_id",orgId);const {data}=await db.from("invoices").insert({org_id:orgId,customer_id:input.entity_id,invoice_number:`INV-${Date.now().toString().slice(-6)}`,amount:input.value,status:"draft",items:[{description:input.title,amount:input.value}]}).select().single();output=data}
  if(rule.action_key==="leave_calendar"){const {data}=await db.from("calendar_blocks").insert({org_id:orgId,employee_id:input.employee_id,title:"Approved leave",starts_on:input.starts_on,ends_on:input.ends_on,source_id:input.id}).select().single();output=data;await notify("Leave approved",`<h2>Leave approved</h2><p>The shared calendar has been blocked from ${input.starts_on} to ${input.ends_on}.</p>`)}
  if(rule.action_key==="expense_ledger"){const {data}=await db.from("ledger_entries").insert({org_id:orgId,type:"expense",category:input.category||"Expenses",description:`Reimbursed expense · ${input.description||""}`,amount:input.amount}).select().single();output=data;await notify(`Expense approved: ${money(input.amount)}`,`<h2>Expense approved</h2><p>${input.category||"Expense"} for ${money(input.amount)} was posted to the ledger.</p>`)}
  if(rule.action_key==="case_notify"){output={notified:true};await notify(`Urgent case: ${input.subject}`,`<h2>Urgent support case opened</h2><p>${input.subject}</p><p>${input.description||""}</p>`)}
  await db.from("automation_runs").insert({org_id:orgId,rule_id:rule.id,status:"success",input,output});await db.from("automation_rules").update({runs:rule.runs+1}).eq("id",rule.id);
 }catch(e:any){await db.from("automation_runs").insert({org_id:orgId,rule_id:rule.id,status:"failed",input,error:e.message})}}
}
