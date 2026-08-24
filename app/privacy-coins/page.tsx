import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacyCoinHub from "@/components/PrivacyCoinHub";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
export const revalidate=300;
export default async function PrivacyCoinsPage(){const snapshot=await getLatestScan();const coins=snapshot?.coins?.length?snapshot.coins:mockCoins;return <div><Header/><main className="cs-specialist-shell"><PrivacyCoinHub coins={coins}/></main><Footer/></div>}
