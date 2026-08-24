import {apiError,apiSuccess} from "@/lib/apiResponse";
import {getNftCollections} from "@/lib/nftData";
import {nftSignal} from "@/lib/marketSignals";

export const revalidate=300;
export async function GET(){try{const collections=await getNftCollections();if(!collections.length)return apiError("NFT market data unavailable",503,"NFT_DATA_UNAVAILABLE");const assets=collections.map(nftSignal);return apiSuccess({assets,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}});}catch{return apiError("NFT market data unavailable",503,"NFT_DATA_UNAVAILABLE");}}
