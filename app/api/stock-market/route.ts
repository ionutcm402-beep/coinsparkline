import {apiError,apiSuccess} from "@/lib/apiResponse";
import {getStockSignals,stockFeedConfigured} from "@/lib/stockData";
export const revalidate=60;
export async function GET(){if(!stockFeedConfigured())return apiError("Stock feed is disabled until a licensed external-display provider is configured.",503,"STOCK_FEED_LICENSE_REQUIRED");try{const assets=await getStockSignals();if(!assets.length)return apiError("Stock market data unavailable",503,"STOCK_DATA_UNAVAILABLE");return apiSuccess({assets,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=180"}});}catch{return apiError("Stock market data unavailable",503,"STOCK_DATA_UNAVAILABLE");}}
