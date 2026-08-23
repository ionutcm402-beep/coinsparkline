import Header from"@/components/Header";import Footer from"@/components/Footer";import RadarClient from"@/components/RadarClient";import{getLatestScan}from"@/lib/blobStorage";import{mockCoins}from"@/lib/mockData";import{isStablecoin}from"@/lib/categories";
export const revalidate=300;
export const metadata={title:"Spark Radar — CoinSparkLine",description:"Discover crypto assets whose volatility behaviour and market regimes are changing now."};
export default async function RadarPage(){const snapshot=await getLatestScan();const coins=(snapshot?.coins?.length?snapshot.coins:mockCoins).filter(c=>!isStablecoin(c.id,c.symbol));return <><Header/><RadarClient coins={coins}/><Footer/></>}
