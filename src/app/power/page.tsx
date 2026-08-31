"use client";
import { useEffect, useState } from "react";

type PowerMap = {
  power200: { insider: string; board_seats: number; companies: string[]; rank: number; source_url: string }[];
  ormas: { name: string; chairman: string; classification: string; toxicity: number; benefit: number; net_score: number; confidence: string; source_url: string }[];
  politicians: { politicians: { name: string; jabatan: string; wealth: number }[] };
  graph: { nodes: any[]; edges: any[] };
};

export default function PowerPage() {
  const [data, setData] = useState<PowerMap | null>(null);

  useEffect(() => {
    fetch("/power_map_export.json").then(r=>r.json()).then(setData).catch(()=>{});
  }, []);

  if (!data) return <div style={{padding:40}}>Loading power map…</div>;

  return (
    <div style={{padding:"24px", maxWidth:1100, margin:"0 auto"}}>
      <h1 style={{fontSize:28, fontWeight:800}}>Indonesia Power Map — LittleSis</h1>
      <p style={{opacity:0.7, marginBottom:16}}>Pareto-filtered top 200 insiders from IDX + ormas Jabar pilot + LHKPN politicians. Every fact has source_url + confidence. No editorial drama, just numbers.</p>

      <section style={{marginBottom:24}}>
        <h2 style={{fontSize:20, fontWeight:700}}>Power200 — by Board Seats (Pareto)</h2>
        <p style={{fontSize:13, opacity:0.6}}>Source: companyDetailsByKodeEmiten.json + Neo4j centrality — {data.power200.length} entries</p>
        <div style={{overflowX:"auto", marginTop:12}}>
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:14}}>
            <thead><tr style={{borderBottom:"2px solid #ddd"}}><th style={{textAlign:"left", padding:8}}>#</th><th style={{textAlign:"left", padding:8}}>Insider</th><th>Seats</th><th>Companies</th><th>Source</th></tr></thead>
            <tbody>
              {data.power200.slice(0,30).map(r=>(
                <tr key={r.insider} style={{borderBottom:"1px solid #eee"}}>
                  <td style={{padding:8}}>{r.rank}</td>
                  <td style={{padding:8, fontWeight:600}}>{r.insider}</td>
                  <td style={{textAlign:"center"}}>{r.board_seats}</td>
                  <td style={{padding:8, fontSize:12, opacity:0.8}}>{r.companies.join(", ")}</td>
                  <td style={{fontSize:11}}><a href="https://idx.co.id" target="_blank">idx.co.id</a> • high</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{marginBottom:24}}>
        <h2 style={{fontSize:20, fontWeight:700}}>Ormas Jabar — Toxicity/Benefit Score</h2>
        <p style={{fontSize:13, opacity:0.6}}>20 seed ormas, rule-based scoring (conflict*10 + preman + benefit). Not ML. Confidence = has source.</p>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:14, marginTop:12}}>
          <thead><tr style={{borderBottom:"2px solid #ddd"}}><th style={{textAlign:"left", padding:8}}>Ormas</th><th>Class</th><th>Toxicity</th><th>Benefit</th><th>Net</th><th>Confidence</th></tr></thead>
          <tbody>
            {data.ormas.map(o=>(
              <tr key={o.name} style={{borderBottom:"1px solid #eee", background: o.toxicity>70?"#fff0f0": o.toxicity>30?"#fff8e1":"#f0fff0"}}>
                <td style={{padding:8}}><b>{o.name}</b><br/><span style={{fontSize:11, opacity:0.6}}>{o.chairman}</span></td>
                <td style={{padding:8, fontSize:12}}>{o.classification}</td>
                <td style={{textAlign:"center", color:"#b00", fontWeight:700}}>{o.toxicity}</td>
                <td style={{textAlign:"center", color:"#070"}}>{o.benefit}</td>
                <td style={{textAlign:"center", fontWeight:700}}>{o.net_score}</td>
                <td style={{fontSize:11}}>{o.confidence}<br/><a href={o.source_url} target="_blank">src</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{marginBottom:24}}>
        <h2 style={{fontSize:20, fontWeight:700}}>Politicians — LHKPN Sample</h2>
        <p style={{fontSize:13, opacity:0.6}}>From your lhkpn scraper (example.json). Link to boards via name match: 0 direct matches for Prabowo (expected — not on IDX boards). Pipeline ready for 50.</p>
        <ul style={{fontSize:14}}>
          {data.politicians.politicians.slice(0,3).map((p,i)=>(
            <li key={i} style={{marginBottom:8}}><b>{p.name}</b> — {p.jabatan} — Rp {p.wealth.toLocaleString("id-ID")} <span style={{fontSize:11, opacity:0.6}}>src: elhkpn.kpk.go.id</span></li>
          ))}
        </ul>
      </section>

      <section style={{padding:16, border:"1px solid #ddd", borderRadius:8, background:"#f9f9f9"}}>
        <h3 style={{fontWeight:700}}>Graph Export</h3>
        <p style={{fontSize:13}}>Nodes: {data.graph.nodes.length} | Edges: {data.graph.edges.length} — available at <code>/power_map_export.json</code> + Neo4j <code>bolt://localhost:7687</code> (Politician:{data.politicians.politicians.length} Ormas:{data.ormas.length})</p>
        <p style={{fontSize:12, opacity:0.7}}>Method: Pareto 80/20, board centrality + toxicity rule score. Every edge carries source_url + confidence. See /METHODOLOGY.md + /LEGAL.md</p>
      </section>
    </div>
  );
}
