import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScreenerClient from "@/components/ScreenerClient";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
export const revalidate=300;
export default async function ScreenerPage(){const snapshot=await getLatestScan();const coins=snapshot&&snapshot.coins.length?snapshot.coins:mockCoins;return <div className="flex-1"><Header coins={coins}/><ScreenerClient coins={coins}/><Footer/></div>}
