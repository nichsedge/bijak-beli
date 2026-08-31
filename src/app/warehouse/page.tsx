"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Scale, Database, ExternalLink } from "lucide-react";

export default function WarehousePage(){
  const [d,setD]=useState<any>(null);
  useEffect(()=>{fetch("/warehouse.json").then(r=>r.json()).then(setD)},[]);
  if(!d) return <div style={{padding:40, textAlign:"center", color:"var(--text-muted)"}}>Loading warehouse…</div>;
  const ormasSorted=[...d.dim_ormas].sort((a:any,b:any)=>b.punish_score - a.punish_score);
  const support=ormasSorted.filter((o:any)=>o.tier==="support");
  const punish=ormasSorted.filter((o:any)=>o.tier==="punish");
  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"var(--space-6)", display:"flex", flexDirection:"column", gap:"var(--space-8)"}}>
      {/* HERO */}
      <div style={{background:"linear-gradient(160deg, var(--primary-subtle) 0%, var(--surface) 100%)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"var(--space-8)"}}>
        <div style={{display:"inline-flex", alignItems:"center", gap:8, background:"var(--primary-light)", color:"var(--primary)", border:"1px solid color-mix(in srgb, var(--primary) 30%, transparent)", borderRadius:999, padding:"4px 12px", fontSize:"var(--text-xs)", fontWeight:700}}><Database size={14}/> PUBLIC GOOD WAREHOUSE • PARQUET READY</div>
        <h1 style={{fontSize:"clamp(24px, 4vw, 36px)", fontWeight:900, lineHeight:1.1, marginTop:12}}>Siapa didukung, siapa diwaspadai — <span style={{color:"var(--primary)"}}>by numbers</span></h1>
        <p style={{color:"var(--text-secondary)", marginTop:8, maxWidth:700}}>Star schema <code style={{background:"var(--surface-2)", padding:"2px 6px", borderRadius:4}}>dim_person</code> <code style={{background:"var(--surface-2)", padding:"2px 6px", borderRadius:4}}>dim_ormas</code> <code style={{background:"var(--surface-2)", padding:"2px 6px", borderRadius:4}}>fact_edges</code> • Parquet easy ingest (DuckDB/Spark). Tiap baris punya <b>source_url + confidence</b>. Skor = rumus transparan, bukan vonis.</p>
        <div style={{display:"flex", gap:12, marginTop:16, flexWrap:"wrap"}}>
          <span style={{display:"inline-flex", alignItems:"center", gap:6, background:"#ECFDF5", color:"#065F46", border:"1px solid #A7F3D0", borderRadius:999, padding:"6px 12px", fontSize:12, fontWeight:700}}><Shield size={14}/> SUPPORT GREEN {support.length}</span>
          <span style={{display:"inline-flex", alignItems:"center", gap:6, background:"#FEF2F2", color:"#991B1B", border:"1px solid #FECACA", borderRadius:999, padding:"6px 12px", fontSize:12, fontWeight:700}}><AlertTriangle size={14}/> PUNISH RED {punish.length}</span>
          <span style={{display:"inline-flex", alignItems:"center", gap:6, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:999, padding:"6px 12px", fontSize:12}}><Scale size={14}/> NEUTRAL {ormasSorted.length - support.length - punish.length}</span>
        </div>
      </div>

      {/* ORMAS GRID */}
      <section>
        <h2 style={{fontSize:"var(--text-xl)", fontWeight:800, display:"flex", alignItems:"center", gap:8}}><AlertTriangle size={18} style={{color:"var(--error)"}}/> Ormas — by toxicity vs benefit</h2>
        <p style={{color:"var(--text-muted)", fontSize:"var(--text-sm)", marginBottom:12}}>Rumus: <code>toxicity = conflict*10 + preman20 + risk15</code> • <code>benefit = social*5 + min(15, hits/2)</code> • Live verified via detik.com/search</p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16}}>
          {ormasSorted.map((o:any)=>(
            <div key={o.id} style={{background:"var(--surface)", border:`1px solid ${o.tier==="punish"?"#FECACA":o.tier==="support"?"#A7F3D0":"var(--border)"}`, borderLeft:`4px solid ${o.tier==="punish"?"var(--error)":o.tier==="support"?"var(--success)":"var(--warning)"}`, borderRadius:"var(--radius-lg)", padding:16, display:"flex", flexDirection:"column", gap:10}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <div><div style={{fontWeight:800, fontSize:"var(--text-sm)"}}>{o.id}</div><div style={{fontSize:"var(--text-xs)", color:"var(--text-muted)"}}>{o.classification} • {o.news_verified_hits} hits</div></div>
                <span style={{fontSize:10, fontWeight:800, letterSpacing:0.5, padding:"4px 8px", borderRadius:999, background: o.tier==="punish"?"#FEF2F2":o.tier==="support"?"#ECFDF5":"#FFFBEB", color: o.tier==="punish"?"#991B1B":o.tier==="support"?"#065F46":"#92400E", border:`1px solid ${o.tier==="punish"?"#FECACA":o.tier==="support"?"#A7F3D0":"#FDE68A"}`}}>{o.tier.toUpperCase()}</span>
              </div>
              <div style={{display:"flex", gap:8}}>
                <div style={{flex:1, background:"var(--surface-2)", borderRadius:999, height:8, overflow:"hidden"}}><div style={{width:`${o.punish_score}%`, background:o.punish_score>70?"var(--error)":"var(--border)", height:"100%"}} /></div>
                <span style={{fontSize:11, fontWeight:700, color:o.punish_score>70?"var(--error)":"var(--text-muted)"}}>punish {o.punish_score}</span>
              </div>
              <div style={{display:"flex", gap:8}}>
                <div style={{flex:1, background:"var(--surface-2)", borderRadius:999, height:8, overflow:"hidden"}}><div style={{width:`${o.support_score}%`, background:o.support_score>60?"var(--success)":"var(--border)", height:"100%"}} /></div>
                <span style={{fontSize:11, fontWeight:700, color:o.support_score>60?"var(--success)":"var(--text-muted)"}}>support {o.support_score}</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, color:"var(--text-muted)"}}>
                <span>net {o.net_score>0?`+${o.net_score}`:o.net_score} • conf {o.confidence}</span>
                <a href={o.source_url} target="_blank" style={{display:"inline-flex", alignItems:"center", gap:4, color:"var(--primary)", fontWeight:600}}>src <ExternalLink size={12}/></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POLITICIANS */}
      <section>
        <h2 style={{fontSize:"var(--text-xl)", fontWeight:800, display:"flex", alignItems:"center", gap:8}}><Shield size={18} style={{color:"var(--primary)"}}/> Politicians — wealth verified (watch vs support)</h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16, marginTop:12}}>
          {(d.dim_politician||[]).map((p:any)=>(
            <div key={p.id} style={{background:"var(--surface)", border:"1px solid var(--border)", borderLeft:`4px solid ${p.tier==="watch"?"var(--error)":"var(--success)"}`, borderRadius:"var(--radius-lg)", padding:16}}>
              <div style={{fontWeight:800, fontSize:"var(--text-sm)"}}>{p.id}</div>
              <div style={{fontSize:"var(--text-xs)", color:"var(--text-muted)"}}>{p.jabatan}</div>
              <div style={{fontSize:"var(--text-lg)", fontWeight:800, marginTop:8}}>Rp {(p.wealth/1e9).toFixed(1)}B</div>
              <div style={{fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.wealth_trend ? p.wealth_trend.split(";")[0] : "no trend"} {p.wealth_trend?.includes("552")?"↗↘ anomaly":""}</div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:10, fontSize:11}}>
                <span style={{padding:"4px 8px", borderRadius:999, background:p.tier==="watch"?"#FEF2F2":"#ECFDF5", color:p.tier==="watch"?"#991B1B":"#065F46", border:`1px solid ${p.tier==="watch"?"#FECACA":"#A7F3D0"}`, fontWeight:700}}>{p.tier.toUpperCase()}</span>
                <a href={p.source_url} target="_blank" style={{color:"var(--primary)", display:"inline-flex", alignItems:"center", gap:4, fontWeight:600}}>elhkpn <ExternalLink size={12}/></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{padding:12, border:"1px solid #FDE68A", borderRadius:"var(--radius-lg)", background:"#FFFBEB", fontSize:"var(--text-xs)", color:"var(--text-secondary)"}}>
        <b>Legal safety (UU ITE):</b> Semua baris punya <code>source_url</code> + <code>confidence</code>. Skor rumus transparan, bukan vonis hukum. Lihat <a href="https://github.com/nichsedge/idx-bei/blob/main/docs/LEGAL.md" target="_blank" style={{color:"var(--primary)", fontWeight:700}}>LEGAL.md</a> + <a href="https://github.com/nichsedge/idx-bei/blob/main/docs/METHODOLOGY.md" target="_blank" style={{color:"var(--primary)", fontWeight:700}}>METHODOLOGY</a>. Publish via org, pseudonym, offshore, ProtonMail.
      </div>
      <div style={{padding:16, border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", background:"var(--surface-2)", fontSize:"var(--text-sm)"}}>
        <b>Ingest:</b> <code>warehouse/dim_*.parquet</code> + <code>warehouse.json</code> — <code>duckdb: COPY INTO ... FROM 'warehouse.json'</code> • Public JSON: <Link href="/warehouse.json" style={{color:"var(--primary)"}}>/warehouse.json</Link> • Parquet: {d.parquet.join(", ")}
      </div>
    </div>
  )
}
