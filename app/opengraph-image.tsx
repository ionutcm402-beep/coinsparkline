import {ImageResponse} from "next/og";

export const size={width:1200,height:630};
export const contentType="image/png";

export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",background:"#f8fafc",padding:"72px",fontFamily:"Arial, sans-serif",color:"#0f172a"}}><div style={{display:"flex",alignItems:"center",fontSize:34,fontWeight:800,letterSpacing:"-1.5px"}}>Coin<span style={{color:"#2457d6"}}>SparkLine</span></div><div style={{maxWidth:940,display:"flex",flexDirection:"column"}}><div style={{fontSize:72,fontWeight:800,lineHeight:1.02,letterSpacing:"-3px"}}>Crypto market behaviour, interpreted.</div><div style={{marginTop:26,fontSize:29,lineHeight:1.35,color:"#475569"}}>SparkScore + regime intelligence + context, without dashboard noise.</div></div><div style={{display:"flex",gap:18,fontSize:22,color:"#64748b"}}><span>SparkScore</span><span>·</span><span>Regime intelligence</span><span>·</span><span>Research tools</span></div></div>,size)}
