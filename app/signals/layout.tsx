import type {Metadata} from "next";
export const metadata:Metadata={title:"My Signals",description:"Your private CoinSparkLine watching, portfolio and alert workspace.",robots:{index:false,follow:false}};
export default function SignalsLayout({children}:{children:React.ReactNode}){return children;}
