import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import type {Database} from "@/types/supabase";

let browserClient:SupabaseClient<Database>|null=null;

export function getSupabaseBrowserClient(){
 if(browserClient)return browserClient;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error("Supabase public environment variables are missing");
 browserClient=createClient<Database>(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return browserClient;
}
