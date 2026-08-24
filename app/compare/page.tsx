import Header from "@/components/Header";
import CompareClient from "@/components/CompareClient";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
export const revalidate=300;
export default async function ComparePage(){const snapshot=await getLatestScan();const coins=snapshot?.coins?.length?snapshot.coins:mockCoins;return <div className="csl2-page"><Header/><main className="csl2-page-main"><section className="csl2-page-hero"><p className="csl-kicker">Compare 2.0</p><h1 className="csl2-page-title mt-3">Current signal.<br/><span className="csl-gradient-text">Historical context.</span></h1><p className="csl2-page-copy">Compare up to three assets across SparkScore, regime, confidence, 30/90/365-day performance, volatility, distance from all-time high and reconstructed SparkScore trend.</p></section><section className="csl2-product-panel"><CompareClient coins={coins}/></section></main></div>}
