import Header from "@/components/Header";
import CompareClient from "@/components/CompareClient";
import { getLatestScan } from "@/lib/blobStorage";
import { mockCoins } from "@/lib/mockData";

export const revalidate = 300;

export default async function ComparePage(){
  const snapshot=await getLatestScan();
  const coins=snapshot?.coins?.length?snapshot.coins:mockCoins;
  return <div className="min-h-screen bg-[#fbfcff] text-slate-950"><Header/><main className="mx-auto max-w-5xl px-5 py-10 sm:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Behaviour comparison</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Compare coins side by side.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Compare regime, signal strength, SparkScore, streak behaviour and market context without turning the result into a buy ranking.</p></div><section className="mt-8"><CompareClient coins={coins}/></section></main></div>;
}
