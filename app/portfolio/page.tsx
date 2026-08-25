import CleanPortfolio2030 from "@/components/CleanPortfolio2030";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
import {routeMetadata} from "@/lib/seo";
export const metadata=routeMetadata("Portfolio","Track crypto holdings, buy prices, current value and profit or loss.","/portfolio");
export const revalidate=60;
export default async function PortfolioPage(){const snapshot=await getLatestScan();const coins=snapshot&&snapshot.coins.length?snapshot.coins:mockCoins;return <CleanPortfolio2030 coins={coins}/>}
