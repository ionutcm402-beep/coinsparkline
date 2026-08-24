import Header from "@/components/Header";
import HomeV2 from "@/components/HomeV2";
import DailyMarketBrief from "@/components/DailyMarketBrief";
import Footer from "@/components/Footer";
import {getLatestScan,getPreviousScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
import {formatRelativeTime} from "@/lib/relativeTime";
import {getDataFreshness} from "@/lib/dataFreshness";

export const revalidate=300;

export default async function Home(){
 const[snapshot,previous]=await Promise.all([getLatestScan(),getPreviousScan()]);
 const coins=snapshot&&snapshot.coins.length>0?snapshot.coins:mockCoins;
 const freshness=getDataFreshness(snapshot?.scannedAt);
 const relative=snapshot?formatRelativeTime(snapshot.scannedAt):undefined;
 const statusLabel=relative?`${freshness.label} · ${relative}`:freshness.label;
 return <div className="flex-1"><Header coins={coins}/><HomeV2 coins={coins} updatedLabel={statusLabel}/><DailyMarketBrief coins={coins} previousCoins={previous?.coins||[]} previousScannedAt={previous?.scannedAt} currentScannedAt={snapshot?.scannedAt}/><Footer/></div>;
}
