import {redirect} from "next/navigation";
export default async function PortfolioPage({searchParams}:{searchParams:Promise<{coin?:string}>}){const params=await searchParams;const coin=(params.coin||"").trim();redirect(`/signals?tab=portfolio${coin?`&coin=${encodeURIComponent(coin)}`:""}`)}
