"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Landmark, 
  Users, 
  Building2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  Sparkles, 
  Calendar,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { MacroPowerExplorer, type PowerInsider } from "@/components/OwnershipGraph";
import styles from "./PowerPage.module.css";

type Politician = {
  name: string;
  jabatan: string;
  lembaga: string;
  branch?: string;
  wealth: number;
  wealth_raw?: string;
  tanggal_lapor?: string;
  source_url: string;
  verified: boolean;
  confidence: string;
};

type Ormas = {
  name: string;
  chairman: string;
  city: string;
  classification: string;
  legal_status?: string;
  source_url: string;
  conflict_events: number;
  social_events: number;
  news_context: string;
  toxicity: number;
  benefit: number;
  net_score: number;
  confidence: string;
  news_sample_titles?: string[];
};

type PowerMapData = {
  power200: PowerInsider[];
  ormas: Ormas[];
  politicians: { politicians: Politician[] };
  graph: { nodes: unknown[]; edges: unknown[] };
};

function formatRupiahShort(amount: number): string {
  if (!amount) return "Rp 0";
  if (amount >= 1e12) {
    return `Rp ${(amount / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Triliun`;
  }
  if (amount >= 1e9) {
    return `Rp ${(amount / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`;
  }
  if (amount >= 1e6) {
    return `Rp ${(amount / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Juta`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getInitials(name: string): string {
  const clean = name.replace(/^(IR\.|DR\.|H\.|HJ\.|PROF\.|KH\.)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (clean.slice(0, 2) || "PB").toUpperCase();
}

function formatNameTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PowerPage() {
  const [data, setData] = useState<PowerMapData | null>(null);
  const [activeTab, setActiveTab] = useState<"politicians" | "ormas" | "power200">("politicians");

  // Politicians controls
  const [polSearch, setPolSearch] = useState("");
  const [polBranch, setPolBranch] = useState<"all" | "Eksekutif" | "Legislatif">("all");
  const [polSort, setPolSort] = useState<"wealth-desc" | "wealth-asc" | "name-asc">("wealth-desc");

  // Ormas controls
  const [ormasSearch, setOrmasSearch] = useState("");
  const [ormasCategory, setOrmasCategory] = useState<"all" | "religious" | "adat" | "kepemudaan" | "motor" | "lsm">("all");

  // Power200 controls
  const [powerSearch, setPowerSearch] = useState("");

  useEffect(() => {
    fetch("/power_map_export.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  // Filtered politicians
  const filteredPoliticians = useMemo(() => {
    if (!data?.politicians?.politicians) return [];
    const query = polSearch.toLowerCase().trim();

    return data.politicians.politicians
      .filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(query) ||
          p.jabatan.toLowerCase().includes(query) ||
          p.lembaga.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        if (polBranch !== "all") {
          return (p.branch || "Eksekutif") === polBranch;
        }
        return true;
      })
      .sort((a, b) => {
        if (polSort === "wealth-desc") return b.wealth - a.wealth;
        if (polSort === "wealth-asc") return a.wealth - b.wealth;
        return a.name.localeCompare(b.name);
      });
  }, [data, polSearch, polBranch, polSort]);

  // Filtered ormas
  const filteredOrmas = useMemo(() => {
    if (!data?.ormas) return [];
    const query = ormasSearch.toLowerCase().trim();

    return data.ormas.filter((o) => {
      const matchesQuery =
        o.name.toLowerCase().includes(query) ||
        o.chairman.toLowerCase().includes(query) ||
        o.city.toLowerCase().includes(query) ||
        o.classification.toLowerCase().includes(query);

      if (!matchesQuery) return false;

      const cls = o.classification.toLowerCase();
      if (ormasCategory === "religious") return cls.includes("keagamaan");
      if (ormasCategory === "adat") return cls.includes("adat") || cls.includes("kebudayaan") || cls.includes("kesenian");
      if (ormasCategory === "kepemudaan") return cls.includes("pemuda") || cls.includes("okp") || cls.includes("karang taruna");
      if (ormasCategory === "motor") return cls.includes("motor");
      if (ormasCategory === "lsm") return cls.includes("lsm");

      return true;
    });
  }, [data, ormasSearch, ormasCategory]);

  // Filtered power200
  const filteredPower200 = useMemo(() => {
    if (!data?.power200) return [];
    const query = powerSearch.toLowerCase().trim();
    if (!query) return data.power200;
    return data.power200.filter(
      (p) =>
        p.insider.toLowerCase().includes(query) ||
        p.companies.some((c) => c.toLowerCase().includes(query))
    );
  }, [data, powerSearch]);

  // Aggregated metrics
  const stats = useMemo(() => {
    if (!data) return null;
    const totalWealth = (data.politicians?.politicians || []).reduce((sum, p) => sum + (p.wealth || 0), 0);
    const topPolitician = [...(data.politicians?.politicians || [])].sort((a, b) => b.wealth - a.wealth)[0];
    const topOrmasContribution = [...(data.ormas || [])].sort((a, b) => b.benefit - a.benefit)[0];

    return {
      totalPoliticians: data.politicians?.politicians?.length || 0,
      totalWealth,
      topPolitician,
      totalOrmas: data.ormas?.length || 0,
      topOrmasContribution,
      totalPower200: data.power200?.length || 0,
    };
  }, [data]);

  if (!data) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
          <Sparkles style={{ margin: "0 auto 12px auto", display: "block", color: "var(--primary)" }} size={32} />
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>Memuat Peta Kekuasaan & Data Transparansi…</h3>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>Mengintegrasikan e-LHKPN KPK, register ormas Bakesbangpol, dan jaringan konglomerasi IDX.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <ShieldCheck size={16} />
            Integritas & Akuntabilitas Publik Republik Indonesia
          </div>
          <h1 className={styles.heroTitle}>Pusat Transparansi Kekuasaan & Afiliasi Publik</h1>
          <p className={styles.heroSubtitle}>
            Pantau keterhubungan elit ekonomi dan pengambil kebijakan negara. Menghubungkan deklarasi resmi 
            <strong> LHKPN KPK</strong> para pejabat publik, <strong>akuntabilitas ormas</strong> kemasyarakatan, 
            serta jejaring dewan komisaris/direksi <strong>konglomerasi bursa efek (Power200)</strong>.
          </p>
        </div>
      </section>

      {/* KPI Stats Bar */}
      {stats && (
        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Pejabat Terverifikasi</span>
              <div className={styles.statIconBox}>
                <Landmark size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.totalPoliticians} Tokoh</div>
            <div className={styles.statDesc}>
              Total deklarasi: {formatRupiahShort(stats.totalWealth)}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Akuntabilitas Ormas</span>
              <div className={styles.statIconBox}>
                <Users size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.totalOrmas} Organisasi</div>
            <div className={styles.statDesc}>
              Jawa Barat • Terdaftar Kemenkumham/Kesbangpol
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Insiders Konglomerasi</span>
              <div className={styles.statIconBox}>
                <Building2 size={18} />
              </div>
            </div>
            <div className={styles.statValue}>{stats.totalPower200} Tokoh Elit</div>
            <div className={styles.statDesc}>
              Analisis sentralitas dewan direksi/komisaris IDX
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Status Registrasi</span>
              <div className={styles.statIconBox}>
                <Scale size={18} />
              </div>
            </div>
            <div className={styles.statValue}>100% Resmi</div>
            <div className={styles.statDesc}>
              Sesuai basis data e-LHKPN & lembar negara
            </div>
          </div>
        </section>
      )}

      {/* Tab Switcher */}
      <nav className={styles.tabNav} aria-label="Power Dimensions">
        <button
          onClick={() => setActiveTab("politicians")}
          className={`${styles.tabBtn} ${activeTab === "politicians" ? styles.tabBtnActive : ""}`}
        >
          <Landmark size={18} />
          <span>Pejabat Publik & LHKPN</span>
          <span className={styles.tabCount}>{data.politicians.politicians.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("ormas")}
          className={`${styles.tabBtn} ${activeTab === "ormas" ? styles.tabBtnActive : ""}`}
        >
          <Users size={18} />
          <span>Ormas & Akuntabilitas Sosial</span>
          <span className={styles.tabCount}>{data.ormas.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("power200")}
          className={`${styles.tabBtn} ${activeTab === "power200" ? styles.tabBtnActive : ""}`}
        >
          <Building2 size={18} />
          <span>Konglomerasi & Power200 (IDX)</span>
          <span className={styles.tabCount}>{data.power200.length}</span>
        </button>
      </nav>

      {/* TAB 1: PEJABAT PUBLIK & LHKPN */}
      {activeTab === "politicians" && (
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                value={polSearch}
                onChange={(e) => setPolSearch(e.target.value)}
                placeholder="Cari nama pejabat, jabatan, atau kementerian…"
                className={styles.searchInput}
              />
            </div>

            <div className={styles.pillGroup}>
              <button
                onClick={() => setPolBranch("all")}
                className={`${styles.filterPill} ${polBranch === "all" ? styles.filterPillActive : ""}`}
              >
                Semua Lembaga
              </button>
              <button
                onClick={() => setPolBranch("Eksekutif")}
                className={`${styles.filterPill} ${polBranch === "Eksekutif" ? styles.filterPillActive : ""}`}
              >
                Eksekutif
              </button>
              <button
                onClick={() => setPolBranch("Legislatif")}
                className={`${styles.filterPill} ${polBranch === "Legislatif" ? styles.filterPillActive : ""}`}
              >
                Legislatif
              </button>
            </div>

            <select
              value={polSort}
              onChange={(e) => setPolSort(e.target.value as "wealth-desc" | "wealth-asc" | "name-asc")}
              className={styles.sortSelect}
            >
              <option value="wealth-desc">Kekayaan Tertinggi</option>
              <option value="wealth-asc">Kekayaan Terendah</option>
              <option value="name-asc">Nama A–Z</option>
            </select>
          </div>

          {/* Politician Cards Grid */}
          {filteredPoliticians.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
              <p>Tidak ada pejabat yang cocok dengan pencarian &quot;{polSearch}&quot;</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredPoliticians.map((p) => {
                const branch = p.branch || "Eksekutif";
                return (
                  <article key={p.name} className={styles.politicianCard}>
                    <div>
                      <div className={styles.politicianHeader}>
                        <div className={styles.avatarBox}>
                          {getInitials(p.name)}
                        </div>
                        <div className={styles.politicianInfo}>
                          <span
                            className={`${styles.branchPill} ${
                              branch === "Legislatif" ? styles.branchLegislatif : styles.branchEksekutif
                            }`}
                          >
                            {branch}
                          </span>
                          <h3 className={styles.politicianName}>{formatNameTitleCase(p.name)}</h3>
                          <div className={styles.politicianJabatan}>
                            <Briefcase size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                            {p.jabatan}
                          </div>
                          <div className={styles.politicianLembaga}>{p.lembaga}</div>
                        </div>
                      </div>

                      {/* Wealth Section */}
                      <div className={styles.wealthBox} style={{ marginTop: "16px" }}>
                        <span className={styles.wealthLabel}>Deklarasi Harta Kekayaan (LHKPN)</span>
                        <div className={styles.wealthFormatted}>{formatRupiahShort(p.wealth)}</div>
                        <div className={styles.wealthExact}>Rp {p.wealth.toLocaleString("id-ID")}</div>
                      </div>
                    </div>

                    <div className={styles.politicianFooter}>
                      <span className={styles.filingDate}>
                        <Calendar size={13} />
                        {p.tanggal_lapor || "Filing Resmi KPK"}
                      </span>
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        elhkpn.kpk.go.id
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ORMAS & AKUNTABILITAS SOSIAL */}
      {activeTab === "ormas" && (
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                value={ormasSearch}
                onChange={(e) => setOrmasSearch(e.target.value)}
                placeholder="Cari ormas, pimpinan, kota, atau fokus kegiatan…"
                className={styles.searchInput}
              />
            </div>

            <div className={styles.pillGroup}>
              <button
                onClick={() => setOrmasCategory("all")}
                className={`${styles.filterPill} ${ormasCategory === "all" ? styles.filterPillActive : ""}`}
              >
                Semua ({data.ormas.length})
              </button>
              <button
                onClick={() => setOrmasCategory("religious")}
                className={`${styles.filterPill} ${ormasCategory === "religious" ? styles.filterPillActive : ""}`}
              >
                Sosial Keagamaan
              </button>
              <button
                onClick={() => setOrmasCategory("adat")}
                className={`${styles.filterPill} ${ormasCategory === "adat" ? styles.filterPillActive : ""}`}
              >
                Adat & Seni Budaya
              </button>
              <button
                onClick={() => setOrmasCategory("kepemudaan")}
                className={`${styles.filterPill} ${ormasCategory === "kepemudaan" ? styles.filterPillActive : ""}`}
              >
                Kepemudaan (OKP)
              </button>
              <button
                onClick={() => setOrmasCategory("motor")}
                className={`${styles.filterPill} ${ormasCategory === "motor" ? styles.filterPillActive : ""}`}
              >
                Komunitas & Klub Motor
              </button>
              <button
                onClick={() => setOrmasCategory("lsm")}
                className={`${styles.filterPill} ${ormasCategory === "lsm" ? styles.filterPillActive : ""}`}
              >
                LSM & Advokasi
              </button>
            </div>
          </div>

          {/* Ormas Cards Grid */}
          {filteredOrmas.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
              <p>Tidak ada organisasi yang cocok dengan kriteria pencarian.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredOrmas.map((o) => {
                const scoreColor =
                  o.benefit >= 75
                    ? styles.meterScoreGreen
                    : o.benefit >= 45
                    ? styles.meterScoreAmber
                    : styles.meterScoreRed;

                const fillColor =
                  o.benefit >= 75 ? "var(--score-excellent)" : o.benefit >= 45 ? "var(--score-fair)" : "var(--score-poor)";

                return (
                  <article key={o.name} className={styles.ormasCard}>
                    <div>
                      <div className={styles.ormasHeader}>
                        <div className={styles.ormasTagRow}>
                          <span className={styles.categoryBadge}>{o.classification}</span>
                          <span className={styles.cityBadge}>{o.city}</span>
                        </div>
                        <h3 className={styles.ormasName}>{o.name}</h3>
                        <div className={styles.ormasLeaderRow}>
                          <Users size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          <span>
                            Pimpinan: <strong className={styles.leaderName}>{o.chairman}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Legal Status */}
                      <div style={{ marginTop: "12px" }}>
                        <span className={styles.legalStatus}>
                          <CheckCircle2 size={13} />
                          {o.legal_status || "Terdaftar Resmi Bakesbangpol Jabar"}
                        </span>
                      </div>

                      {/* Accountability & Social Contribution Meter */}
                      <div className={styles.meterBox} style={{ marginTop: "14px" }}>
                        <div className={styles.meterRow}>
                          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                            Indeks Kontribusi Sosial:
                          </span>
                          <span className={scoreColor}>{o.benefit} / 100</span>
                        </div>
                        <div className={styles.meterTrack}>
                          <div
                            className={styles.meterFill}
                            style={{
                              width: `${Math.max(10, Math.min(100, o.benefit))}%`,
                              backgroundColor: fillColor,
                            }}
                          />
                        </div>
                        <div className={styles.meterRow} style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          <span>Aksi Kemanusiaan: {o.social_events} kegiatan</span>
                          <span>Riwayat Gesekan/Friksi: {o.conflict_events} insiden</span>
                        </div>
                      </div>

                      {/* Verified Sample Activities */}
                      {o.news_sample_titles && o.news_sample_titles.length > 0 && (
                        <div className={styles.contextBox} style={{ marginTop: "14px" }}>
                          <span className={styles.contextTitle}>Fakta Rekam Jejak & Kegiatan:</span>
                          <ul className={styles.contextList}>
                            {o.news_sample_titles.map((title, idx) => (
                              <li key={idx}>{title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className={styles.politicianFooter}>
                      <span className={styles.filingDate}>
                        <ShieldCheck size={13} />
                        Bakesbangpol / Kemenkumham
                      </span>
                      <a
                        href={o.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        Portal Resmi <ExternalLink size={13} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: POWER200 INSIDERS (IDX) */}
      {activeTab === "power200" && (
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Interactive Network Graph */}
          <MacroPowerExplorer initialPower200={data.power200} />

          {/* Pareto Centrality Table */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeaderWrap}>
              <div>
                <h3 className={styles.tableTitle}>Direksi & Komisaris Terkoneksi Antar-Emiten (Power200)</h3>
                <p className={styles.tableSubtitle}>
                  Diolah dari laporan tahunan emiten Bursa Efek Indonesia (IDX) menggunakan analisis sentralitas jejaring.
                </p>
              </div>
              <div className={styles.searchWrap} style={{ maxWidth: 300, minWidth: 200 }}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  value={powerSearch}
                  onChange={(e) => setPowerSearch(e.target.value)}
                  placeholder="Cari insider atau emiten…"
                  className={styles.searchInput}
                  style={{ padding: "8px 12px 8px 38px", fontSize: "13px" }}
                />
              </div>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.powerTable}>
                <thead>
                  <tr>
                    <th style={{ width: 60, textAlign: "center" }}>Rank</th>
                    <th>Nama Insider</th>
                    <th style={{ textAlign: "center", width: 120 }}>Kursi Dewan</th>
                    <th>Emiten Terkait</th>
                    <th style={{ textAlign: "right" }}>Sumber Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPower200.slice(0, 40).map((r) => (
                    <tr key={r.insider}>
                      <td style={{ textAlign: "center" }}>
                        <span className={`${styles.rankBadge} ${r.rank <= 10 ? styles.topRank : ""}`}>
                          {r.rank}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.insider}</td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "var(--primary-dark)" }}>
                        {r.board_seats} kursi
                      </td>
                      <td>
                        <div className={styles.companyTags}>
                          {r.companies.map((ticker) => (
                            <span key={ticker} className={styles.companyTag}>
                              {ticker}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontSize: 12 }}>
                        <a
                          href="https://idx.co.id"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourceLink}
                        >
                          idx.co.id <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Methodology & Legal Integrity Card */}
      <section className={styles.methodologyCard}>
        <div className={styles.methodologyHeader}>
          <Scale size={20} style={{ color: "var(--primary)" }} />
          <span>Prinsip Transparansi & Integritas Sumber Data Bijak Beli</span>
        </div>
        <p className={styles.methodologyText}>
          Platform <strong>Bijak Beli</strong> menyajikan data kepemilikan korporasi dan informasi penyelenggara negara 
          semata-mata untuk kepentingan edukasi publik, keterbukaan informasi, dan riset independen. Seluruh data 
          dikompilasi secara objektif dari dokumen keterbukaan informasi yang dapat diakses oleh publik:
        </p>
        <ul className={styles.methodologyList}>
          <li>
            <strong>Pejabat Publik & LHKPN:</strong> Berasal dari pengumuman resmi Laporan Harta Kekayaan Penyelenggara Negara (e-LHKPN) 
            yang dikelola dan dipublikasikan oleh Komisi Pemberantasan Korupsi (KPK) Republik Indonesia (elhkpn.kpk.go.id).
          </li>
          <li>
            <strong>Ormas & Akuntabilitas Kemasyarakatan:</strong> Berasal dari pendaftaran badan hukum resmi Kemenkumham RI, 
            inventarisasi Badan Kesatuan Bangsa dan Politik (Bakesbangpol) Jawa Barat, serta dokumentasi berita berimbang.
          </li>
          <li>
            <strong>Power200 Konglomerasi IDX:</strong> Dihitung secara matematis menggunakan algoritma sentralitas derajat (degree centrality) 
            pada jaringan kepemilikan dan perangkapan jabatan direksi/komisaris emiten yang terdaftar di Bursa Efek Indonesia (IDX).
          </li>
        </ul>
      </section>
    </div>
  );
}
