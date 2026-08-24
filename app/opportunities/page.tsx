import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OpportunityRadar from "@/components/OpportunityRadar";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
import {formatRelativeTime} from "@/lib/relativeTime";
export const revalidate=300;
export default async function OpportunitiesPage(){const snapshot=await getLatestScan();const coins=snapshot&&snapshot.coins.length?snapshot.coins:mockCoins;const updatedLabel=snapshot?.scannedAt?`Updated ${formatRelativeTime(snapshot.scannedAt)}`:"Latest available snapshot";return <div className="csl2-page"><Header coins={coins}/><OpportunityRadar coins={coins} updatedLabel={updatedLabel}/><Footer/></div>}
