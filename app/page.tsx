import Header from "@/components/Header";
import HomeV2 from "@/components/HomeV2";
import Footer from "@/components/Footer";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
import {formatRelativeTime} from "@/lib/relativeTime";
import {getDataFreshness} from "@/lib/dataFreshness";

export const revalidate=300;

export default async function Home(){
 const snapshot=await getLatestScan();
 const coins=snapshot&&snapshot.coins.length>0?snapshot.coins:mockCoins;
 const freshness=getDataFreshness(snapshot?.scannedAt);
 const relative=snapshot?formatRelativeTime(snapshot.scannedAt):undefined;
 const statusLabel=relative?`${freshness.label} · ${relative}`:freshness.label;
 return <div className="flex-1"><Header/><HomeV2 coins={coins} updatedLabel={statusLabel}/><Footer/></div>;
}
