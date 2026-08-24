import {apiError,apiSuccess} from "@/lib/apiResponse";
import {getLatestIntelligenceEvents} from "@/lib/intelligenceEvents";

export const dynamic="force-dynamic";

export async function GET(){
 try{
  const events=await getLatestIntelligenceEvents(24);
  return apiSuccess({events,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, s-maxage=20, stale-while-revalidate=60"}});
 }catch{return apiError("Intelligence feed unavailable",503,"INTELLIGENCE_UNAVAILABLE");}
}
