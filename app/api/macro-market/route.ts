import {apiError,apiSuccess} from "@/lib/apiResponse";
import {getMacroSignals} from "@/lib/macroData";
export const revalidate=300;
export async function GET(){try{const assets=await getMacroSignals();if(!assets.length)return apiError("Macro market data unavailable",503,"MACRO_DATA_UNAVAILABLE");return apiSuccess({assets,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}});}catch{return apiError("Macro market data unavailable",503,"MACRO_DATA_UNAVAILABLE");}}
