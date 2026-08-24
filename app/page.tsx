import TerminalLive from "@/components/TerminalLive";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
import {formatRelativeTime} from "@/lib/relativeTime";
import {getDataFreshness} from "@/lib/dataFreshness";
import {routeMetadata} from "@/lib/seo";

export const metadata=routeMetadata("Live market intelligence terminal","See where crypto market behaviour is changing now with SparkScore, regime intelligence and live community context.","/");
export const revalidate=60;

export default async function Home(){
 const snapshot=await getLatestScan();
 const coins=snapshot&&snapshot.coins.length>0?snapshot.coins:mockCoins;
 const freshness=getDataFreshness(snapshot?.scannedAt);
 const relative=snapshot?formatRelativeTime(snapshot.scannedAt):undefined;
 const statusLabel=relative?`${freshness.label} · ${relative}`:freshness.label;
 return <TerminalLive coins={coins} updatedLabel={statusLabel}/>;
}
