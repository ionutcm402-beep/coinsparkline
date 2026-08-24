import TerminalRadar from "@/components/TerminalRadar";
import {getLatestScan} from "@/lib/blobStorage";
import {mockCoins} from "@/lib/mockData";
import {formatRelativeTime} from "@/lib/relativeTime";
export const revalidate=60;
export default async function OpportunitiesPage(){const snapshot=await getLatestScan();const coins=snapshot&&snapshot.coins.length?snapshot.coins:mockCoins;const updatedLabel=snapshot?.scannedAt?`Updated ${formatRelativeTime(snapshot.scannedAt)}`:"Latest available snapshot";return <TerminalRadar coins={coins} updatedLabel={updatedLabel}/>}
