import Header from "@/components/Header";
import CompareClient from "@/components/CompareClient";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
export const revalidate=300;
export default async function ComparePage(){const snapshot=await getLatestScan();const coins=snapshot?.coins?.length?snapshot.coins:mockCoins;return <div className="csl2-page"><Header/><main className="csl2-page-main"><section className="csl2-page-hero"><p className="csl-kicker">Behaviour comparison</p><h1 className="csl2-page-title mt-3">Put signals side by side.<br/><span className="csl-gradient-text">See the difference.</span></h1><p className="csl2-page-copy">Compare price movement, signal state, confidence, SparkScore and regime behaviour without reducing everything to a simplistic buy ranking.</p></section><section className="csl2-product-panel"><CompareClient coins={coins}/></section></main></div>}
