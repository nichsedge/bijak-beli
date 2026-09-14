"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Scale, Database, ExternalLink, FileCode, CheckCircle2 } from "lucide-react";

type WarehouseOrmas = {
  id: string;
  classification: string;
  chairman?: string;
  toxicity: number;
  benefit: number;
  punish_score: number;
  support_score: number;
  net_score: number;
  tier: "punish" | "support" | "neutral";
  confidence: string;
  source_url: string;
};

type WarehousePolitician = {
  id: string;
  name?: string;
  jabatan: string;
  lembaga?: string;
  branch?: string;
  wealth: number;
  wealth_formatted?: string;
  wealth_trend?: string;
  tier: "watch" | "support";
  confidence: string;
  source_url: string;
};

type WarehouseData = {
  generated_at?: string;
  warehouse?: string;
  dim_ormas: WarehouseOrmas[];
  dim_politician: WarehousePolitician[];
  parquet: string[];
};

function formatCurrencyShort(amount: number): string {
  if (!amount) return "Rp 0";
  if (amount >= 1e12) {
    return `Rp ${(amount / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Triliun`;
  }
  if (amount >= 1e9) {
    return `Rp ${(amount / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function WarehousePage() {
  const [d, setD] = useState<WarehouseData | null>(null);

  useEffect(() => {
    fetch("/warehouse.json")
      .then((r) => r.json())
      .then((data: WarehouseData) => setD(data))
      .catch(() => {});
  }, []);

  if (!d) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
        <Database size={32} style={{ margin: "0 auto 12px auto", display: "block", color: "var(--primary)" }} />
        Memuat Star Schema Public Good Warehouse…
      </div>
    );
  }

  const ormasSorted = [...(d.dim_ormas || [])].sort((a, b) => b.support_score - a.support_score);
  const support = ormasSorted.filter((o) => o.tier === "support");
  const punish = ormasSorted.filter((o) => o.tier === "punish");
  const politicians = [...(d.dim_politician || [])].sort((a, b) => b.wealth - a.wealth);

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* HERO */}
      <div
        style={{
          background: "linear-gradient(160deg, var(--primary-subtle) 0%, var(--surface) 100%)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-8)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--primary-light)",
            color: "var(--primary-dark)",
            border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
            borderRadius: 999,
            padding: "4px 14px",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
          }}
        >
          <Database size={14} /> PUBLIC GOOD DATA WAREHOUSE • STAR SCHEMA READY
        </div>

        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, lineHeight: 1.2, marginTop: 14 }}>
          Pangkalan Data Integritas Publik — <span style={{ color: "var(--primary-dark)" }}>Berbasis Angka & Bukti</span>
        </h1>

        <p style={{ color: "var(--text-secondary)", marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
          Model data dimensional (star schema) untuk analitika keterbukaan:{" "}
          <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4 }}>dim_person</code>,{" "}
          <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4 }}>dim_politician</code>,{" "}
          <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4 }}>dim_ormas</code>, dan{" "}
          <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4 }}>fact_edges</code>.
          Dapat langsung dieksekusi dengan DuckDB, Apache Spark, atau pandas. Setiap entitas mengusung{" "}
          <b>source_url + confidence</b>.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Shield size={14} /> KONTRIBUSI POSITIF ({support.length})
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={14} /> EVALUASI/FRIKSI ({punish.length})
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Scale size={14} /> PEJABAT TERDATA ({politicians.length})
          </span>
        </div>
      </div>

      {/* POLITICIANS SECTION */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={20} style={{ color: "var(--primary)" }} /> Pejabat Publik — e-LHKPN KPK (dim_politician)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "4px 0 0 0" }}>
            Laporan Harta Kekayaan Penyelenggara Negara terverifikasi dari KPK RI dengan klasifikasi nilai kekayaan dan lembaga negara.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {politicians.map((p) => {
            const isHighWealth = p.wealth >= 500_000_000_000;
            return (
              <div
                key={p.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${isHighWealth ? "var(--warning)" : "var(--primary)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "var(--text-sm)", color: "var(--text)" }}>{p.id}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>{p.jabatan}</div>
                      {p.lembaga && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.lembaga}</div>}
                    </div>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: p.branch === "Legislatif" ? "#EEF2FF" : "#ECFDF5",
                        color: p.branch === "Legislatif" ? "#3730A3" : "#065F46",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {p.branch || "Eksekutif"}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, background: "var(--surface-2)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                      Deklarasi LHKPN KPK
                    </div>
                    <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--primary-dark)", marginTop: 2 }}>
                      {formatCurrencyShort(p.wealth)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{p.wealth_trend || "Filing Resmi KPK"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--score-excellent)", fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> Terverifikasi KPK
                  </span>
                  <a
                    href={p.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}
                  >
                    elhkpn.kpk.go.id <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ORMAS SECTION */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={20} style={{ color: "var(--primary)" }} /> Akuntabilitas Ormas Jabar (dim_ormas)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "4px 0 0 0" }}>
            Metrik kontribusi sosial vs rekam jejak gesekan diolah dari register Bakesbangpol Jabar dan dokumentasi berimbang.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {ormasSorted.map((o) => (
            <div
              key={o.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: `4px solid ${
                  o.tier === "punish" ? "var(--error)" : o.tier === "support" ? "var(--success)" : "var(--warning)"
                }`,
                borderRadius: "var(--radius-lg)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "var(--text-sm)", color: "var(--text)" }}>{o.id}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                    {o.classification}
                    {o.chairman ? ` • ${o.chairman}` : ""}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: o.tier === "punish" ? "#FEF2F2" : o.tier === "support" ? "#ECFDF5" : "#FFFBEB",
                    color: o.tier === "punish" ? "#991B1B" : o.tier === "support" ? "#065F46" : "#92400E",
                    border: `1px solid ${
                      o.tier === "punish" ? "#FECACA" : o.tier === "support" ? "#A7F3D0" : "#FDE68A"
                    }`,
                  }}
                >
                  {o.tier === "support" ? "POSITIF" : o.tier === "punish" ? "PERLU MONITORING" : "NETRAL"}
                </span>
              </div>

              {/* Progress bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 999, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${o.support_score}%`, background: "var(--success)", height: "100%" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", width: 75, textAlign: "right" }}>
                    sosial {o.support_score}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 999, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${o.punish_score}%`,
                        background: o.punish_score > 30 ? "var(--error)" : "var(--border)",
                        height: "100%",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: o.punish_score > 30 ? "var(--error)" : "var(--text-muted)",
                      width: 75,
                      textAlign: "right",
                    }}
                  >
                    friksi {o.punish_score}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  borderTop: "1px solid var(--border-light)",
                  paddingTop: 8,
                  marginTop: 2,
                }}
              >
                <span>Net skor: {o.net_score > 0 ? `+${o.net_score}` : o.net_score}</span>
                <a
                  href={o.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--primary)", fontWeight: 600 }}
                >
                  Registrasi Resmi <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEGAL SAFETY & CITIZEN PRIVACY */}
      <div
        style={{
          padding: 16,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--surface)",
          fontSize: "var(--text-xs)",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
          <Scale size={16} style={{ color: "var(--primary)" }} />
          Landasan Keterbukaan Informasi & Kepatuhan Hukum:
        </div>
        Seluruh data disajikan secara objektif bersumber dari pangkalan data publik resmi (elhkpn.kpk.go.id, Bakesbangpol Jabar,
        Kemenkumham RI, dan idx.co.id) sesuai ketentuan Undang-Undang Keterbukaan Informasi Publik (UU KIP No. 14 Tahun 2008)
        dan asas transparansi data publik. Skor yang disajikan merupakan hasil formulasi komparatif terbuka dan bukan merupakan
        vonis hukum.
      </div>

      {/* INGEST & DUCKDB / PARQUET INTEGRATION */}
      <div
        style={{
          padding: 20,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-2)",
          fontSize: "var(--text-sm)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--text)" }}>
          <FileCode size={18} style={{ color: "var(--primary)" }} />
          <span>Cara Ingest Data ke DuckDB / Python:</span>
        </div>
        <pre
          style={{
            background: "var(--text)",
            color: "#A7F3D0",
            padding: 12,
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            overflowX: "auto",
            margin: 0,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {`# Query star schema langsung via DuckDB:
duckdb -c "SELECT * FROM read_json_auto('public/warehouse.json');"

# Ingest ke pandas:
import pandas as pd
df_politicians = pd.read_json('public/warehouse.json')['dim_politician']`}
        </pre>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span>
            Pangkalan JSON:{" "}
            <Link href="/warehouse.json" target="_blank" style={{ color: "var(--primary)", fontWeight: 700 }}>
              /warehouse.json ↗
            </Link>
          </span>
          <span>Skema Parquet: {d.parquet.join(", ")}</span>
          <span>Pembaruan: {d.generated_at || "2026-09-14"}</span>
        </div>
      </div>
    </div>
  );
}
