import {getLatestScan} from "@/lib/blobStorage";
import {apiError,apiSuccess} from "@/lib/apiResponse";

export async function GET(){
  const snapshot=await getLatestScan();
  if(!snapshot?.coins?.length)return apiError("Coin search unavailable",503,"SCAN_UNAVAILABLE");
  const coins=snapshot.coins.map(({id,symbol,name,category,price,change24hPct,regimeState,confidencePct,streakDays,medianDaysToFlip,logoUrl,marketCapRank})=>({id,symbol,name,category,price,change24hPct,regimeState,confidencePct,streakDays,medianDaysToFlip,logoUrl,marketCapRank}));
  return apiSuccess({coins,updatedAt:snapshot.scannedAt},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});
}
