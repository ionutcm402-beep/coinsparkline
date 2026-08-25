import CleanCrypto2030 from "@/components/CleanCrypto2030";
import {getLatestScan} from "@/lib/blobStorage";
import {formatRelativeTime} from "@/lib/relativeTime";
import {getDataFreshness} from "@/lib/dataFreshness";
export const revalidate=60;
export const metadata={title:"Crypto movement | CoinSparkLine",description:"See crypto market movement through SparkScore, regime behaviour and confidence.",alternates:{canonical:"/crypto"}};
export default async function CryptoPage(){const snapshot=await getLatestScan();const coins=snapshot?.coins||[];const freshness=getDataFreshness(snapshot?.scannedAt);const relative=snapshot?formatRelativeTime(snapshot.scannedAt):undefined;const label=coins.length?(relative?`${freshness.label} · ${relative}`:freshness.label):"Live market data unavailable";return <CleanCrypto2030 coins={coins} updatedLabel={label}/>}
