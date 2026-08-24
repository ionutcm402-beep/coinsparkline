import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareClient from "@/components/CompareClient";
import {PageHero} from "@/components/ui";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
export const revalidate=300;
export default async function ComparePage(){const snapshot=await getLatestScan();const coins=snapshot?.coins?.length?snapshot.coins:mockCoins;return <div className="csl2-page"><Header coins={coins}/><main className="cs-discovery-page"><div className="cs-discovery-shell"><PageHero eyebrow="Compare" title={<>See how market behaviour <span className="csl-gradient-text">differs.</span></>} description="Compare up to three assets across SparkScore, regime, confidence and historical behaviour. Start with the signal difference, then use price history as context."/><CompareClient coins={coins}/></div></main><Footer/></div>}
