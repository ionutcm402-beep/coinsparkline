import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/ExploreClient";
import { fetchTopCoins } from "@/lib/coingecko";
import { getLatestScan } from "@/lib/blobStorage";

export const revalidate = 300;

export default async function ExplorePage(){
 const [snapshot,marketCoins]=await Promise.all([
   getLatestScan(),
   fetchTopCoins(250,process.env.COINGECKO_API_KEY).catch(()=>[]),
 ]);
 return <div className="min-h-screen"><Header/><ExploreClient marketCoins={marketCoins} trackedCoins={snapshot?.coins??[]}/><Footer/></div>;
}
