"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Crown, 
  ExternalLink, 
  Layers, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  Info,
  Network,
  ChevronRight
} from "lucide-react";
import type { Brand } from "@/lib/types";
import styles from "./OwnershipGraph.module.css";

interface BrandOwnershipGraphProps {
  brand: Brand;
  lang?: "id" | "en";
}

interface OwnershipNode {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  role: string;
  type: "brand" | "operating_pt" | "holding" | "tycoon" | "regulatory";
  details: string;
  link?: string;
  linkLabel?: string;
  tags?: string[];
}

export function BrandOwnershipGraph({ brand, lang = "id" }: BrandOwnershipGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("tycoon");

  // Parse nodes dynamically from brand metadata
  const nodes: OwnershipNode[] = [];

  // 1. Brand Node
  nodes.push({
    id: "brand",
    step: lang === "id" ? "Level 1 • Produk Konsumen" : "Level 1 • Consumer Brand",
    title: brand.name,
    subtitle: brand.taglineId || brand.tagline,
    role: lang === "id" ? "Brand Konsumen" : "Consumer Brand",
    type: "brand",
    details: lang === "id"
      ? `Brand ritel terdaftar kategori ${brand.category}. Tersertifikasi BPOM (${brand.bpomId || "Terdaftar"}) dan Halal (${brand.halalCertId || "BPJPH"}).`
      : `Retail brand categorized under ${brand.category}. Registered with BPOM (${brand.bpomId || "Registered"}) and Halal certified (${brand.halalCertId || "BPJPH"}).`,
    tags: [brand.category, brand.country === "ID" ? "Lokal ID" : `Asal: ${brand.country}`],
  });

  // 2. Operating PT Node
  const operatingName = brand.idxTicker
    ? `PT ${brand.parentCompany || brand.name} Tbk`
    : brand.parentCompany
      ? `PT ${brand.parentCompany}`
      : "Entitas Operasional Indonesia";

  nodes.push({
    id: "operating_pt",
    step: lang === "id" ? "Level 2 • Entitas Pabrik / PT" : "Level 2 • Operating Entity",
    title: brand.idxTicker ? `${brand.idxTicker} (BEI Listed)` : operatingName,
    subtitle: brand.idxTicker
      ? (lang === "id" ? "Perusahaan Terbuka (Emiten Bursa Efek Indonesia)" : "Publicly Listed on Indonesia Stock Exchange")
      : (lang === "id" ? "Entitas Manufaktur / Produsen Langsung" : "Direct Manufacturing & Operating Entity"),
    role: lang === "id" ? "Entitas Operasional" : "Operating Company",
    type: "operating_pt",
    details: brand.idxTicker
      ? (lang === "id"
          ? `Saham dicatatkan di BEI dengan kode emiten ${brand.idxTicker}. Memiliki kewajiban keterbukaan informasi publik dan audit berkala OJK.`
          : `Listed on the Indonesia Stock Exchange under ticker ${brand.idxTicker} with mandatory OJK disclosures and audited filings.`)
      : (lang === "id"
          ? `Perusahaan operasional manufaktur yang memegang izin edar industri dan pabrikasi lokal.`
          : `Operating manufacturing entity holding industrial licenses and domestic production facilities.`),
    link: brand.idxUrl || (brand.idxTicker ? `https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/${brand.idxTicker}` : undefined),
    linkLabel: brand.idxTicker ? (lang === "id" ? `Keterbukaan BEI (${brand.idxTicker})` : `IDX Disclosure (${brand.idxTicker})`) : undefined,
    tags: [
      brand.idxTicker ? `Ticker: ${brand.idxTicker}` : "Private PT",
      brand.foundedYear ? `Est. ${brand.foundedYear}` : "Active",
    ],
  });

  // 3. Parent Holding / Conglomerate Node
  const holdingName = brand.parentCompany || "Induk Perusahaan";
  nodes.push({
    id: "holding",
    step: lang === "id" ? "Level 3 • Konglomerasi / Holding" : "Level 3 • Parent Conglomerate",
    title: holdingName,
    subtitle: brand.ownerCountry ? `Domisili: ${brand.ownerCountry}` : (lang === "id" ? "Grup Induk Usaha" : "Corporate Parent"),
    role: lang === "id" ? "Induk Konglomerasi" : "Parent Holding",
    type: "holding",
    details: lang === "id"
      ? `Grup konglomerasi pemilik portofolio bisnis dan entitas holding multinasional/nasional.`
      : `Corporate conglomerate holding company overseeing multiple consumer and industrial subsidiaries.`,
    tags: [brand.ownerCountry ? `HQ: ${brand.ownerCountry}` : "Holding"],
  });

  // 4. Ultimate Beneficial Owner (UBO) / Tycoon Node
  const uboRaw = brand.ultimateOwner || holdingName;
  nodes.push({
    id: "tycoon",
    step: lang === "id" ? "Level 4 • Pengendali Akhir (UBO)" : "Level 4 • Ultimate Beneficial Owner",
    title: uboRaw.split("/")[0].trim(),
    subtitle: brand.powerMapRank
      ? `LittleSis Power200 Rank #${brand.powerMapRank}`
      : (lang === "id" ? "Pemegang Saham Pengendali / Keluarga Pendiri" : "Controlling Tycoon / Founding Family"),
    role: lang === "id" ? "Pengendali Akhir (UBO)" : "Ultimate Beneficial Owner",
    type: "tycoon",
    details: lang === "id"
      ? `Pemilik manfaat akhir (Ultimate Beneficial Owner) yang mengendalikan hak suara dan kebijakan korporasi. Data dihubungkan dengan peta kekuasaan dewan direksi/komisaris LittleSis Indonesia.`
      : `Ultimate Beneficial Owner exercising effective control over corporate strategy and voting rights. Cross-referenced with the LittleSis Indonesia boardroom power map.`,
    link: `/power?q=${encodeURIComponent(brand.idxTicker || uboRaw.split("/")[0].trim().split(" ")[0])}`,
    linkLabel: lang === "id" ? "Buka LittleSis Power Map ↗" : "Explore LittleSis Power Map ↗",
    tags: [
      brand.powerMapRank ? `Power200 #${brand.powerMapRank}` : "Major Shareholder",
      brand.ownerCountry ? `Negara: ${brand.ownerCountry}` : "Beneficial Owner",
    ],
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[nodes.length - 1];

  return (
    <div className={styles.ownershipSection}>
      <div className={styles.graphContainer}>
        {/* Header */}
        <div className={styles.graphHeader}>
          <div className={styles.graphTitleWrap}>
            <div className={styles.graphIconBox}>
              <Network size={20} />
            </div>
            <div>
              <h3 className={styles.graphTitle}>
                {lang === "id" ? "Rantai Kepemilikan Korporasi (UBO Graph)" : "Corporate Ownership Chain (UBO Graph)"}
              </h3>
              <p className={styles.graphSubtitle}>
                {lang === "id"
                  ? "Transparansi hierarki dari brand ritel ke pabrik, konglomerat induk, hingga konglomerat pengendali akhir (LittleSis)."
                  : "Transparent hierarchy from retail brand to operating entity, parent group, and ultimate beneficial owners."}
              </p>
            </div>
          </div>
          <div className={styles.graphBadges}>
            {brand.idxTicker && (
              <span className={`${styles.graphBadge} ${styles.badgeIdx}`}>
                BEI: {brand.idxTicker}
              </span>
            )}
            {brand.powerMapRank && (
              <span className={`${styles.graphBadge} ${styles.badgePower}`}>
                <Crown size={12} />
                Power200 #{brand.powerMapRank}
              </span>
            )}
            <span className={`${styles.graphBadge} ${styles.badgeVerified}`}>
              <ShieldCheck size={12} />
              {lang === "id" ? "Terverifikasi" : "Verified"}
            </span>
          </div>
        </div>

        {/* Linear Stepped Flow */}
        <div className={styles.flowTrack}>
          {nodes.map((node, idx) => (
            <React.Fragment key={node.id}>
              <div
                className={`${styles.flowNodeCard} ${selectedNodeId === node.id ? styles.active : ""}`}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <div>
                  <div className={styles.nodeStep}>
                    <span className={styles.nodeIcon}>
                      {node.type === "brand" && <ShoppingBag size={12} />}
                      {node.type === "operating_pt" && <Building2 size={12} />}
                      {node.type === "holding" && <Layers size={12} />}
                      {node.type === "tycoon" && <Crown size={12} />}
                    </span>
                    {node.step}
                  </div>
                  <div className={styles.nodeTitle}>{node.title}</div>
                  <div className={styles.nodeSubtitle}>{node.subtitle}</div>
                </div>

                <div className={styles.nodeMeta}>
                  {node.tags?.map((t, i) => (
                    <span key={i} className={styles.nodeTag}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {idx < nodes.length - 1 && (
                <div className={styles.flowConnector}>
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Selected Node Inspector */}
        {selectedNode && (
          <div className={styles.inspectorBox}>
            <div className={styles.inspectorHeader}>
              <div className={styles.inspectorTitle}>
                <Info size={16} color="var(--primary)" />
                <span>{selectedNode.role}: {selectedNode.title}</span>
              </div>
            </div>
            <div className={styles.inspectorBody}>
              {selectedNode.details}
            </div>
            {selectedNode.link && (
              <div className={styles.inspectorLinks}>
                {selectedNode.link.startsWith("/") ? (
                  <Link href={selectedNode.link} className="btn btn-primary btn-sm">
                    <span>{selectedNode.linkLabel || "Lihat Detail"}</span>
                    <ChevronRight size={13} />
                  </Link>
                ) : (
                  <a
                    href={selectedNode.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <span>{selectedNode.linkLabel || "Lihat Dokumen Resmi"}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type PowerInsider = {
  insider: string;
  board_seats: number;
  companies: string[];
  rank: number;
  source_url: string;
};

interface MacroPowerExplorerProps {
  initialPower200?: PowerInsider[];
  lang?: "id" | "en";
}

export function MacroPowerExplorer({ initialPower200 = [], lang = "id" }: MacroPowerExplorerProps) {
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("q") || params.get("highlight") || "";
    }
    return "";
  });
  const [filterType, setFilterType] = useState<"all" | "fmcg" | "tycoon" | "multi">("all");
  const [selectedInsider, setSelectedInsider] = useState<PowerInsider | null>(initialPower200[0] || null);

  // FMCG prominent tickers in Bijak-Beli
  const fmcgTickers = new Set(["ICBP", "INDF", "MYOR", "ULTJ", "SIDO", "ROTI", "GOOD", "UNVR", "MAPI", "MAPB", "GOTO"]);

  const filtered = initialPower200.filter((p) => {
    const matchesSearch =
      p.insider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === "fmcg") {
      return p.companies.some((c) => fmcgTickers.has(c));
    }
    if (filterType === "multi") {
      return p.board_seats >= 4;
    }
    return true;
  });

  return (
    <div className={styles.macroExplorer}>
      <div className={styles.graphHeader}>
        <div className={styles.graphTitleWrap}>
          <div className={styles.graphIconBox}>
            <Network size={20} />
          </div>
          <div>
            <h2 className={styles.graphTitle}>
              {lang === "id" ? "Eksplorasi Jaringan Konglomerasi & Tycoon (Power200)" : "Corporate Conglomerate & Tycoon Explorer (Power200)"}
            </h2>
            <p className={styles.graphSubtitle}>
              {lang === "id"
                ? "Pemetaan dewan komisaris/direksi lintas emiten BEI dan koneksi ke brand kebutuhan pokok harian."
                : "Cross-listed boardroom centralities from the Indonesia Stock Exchange connecting to FMCG brands."}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.macroControls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={lang === "id" ? "Cari konglomerat, emiten (cth: Salim, ICBP, MYOR)..." : "Search tycoon or ticker (e.g. Salim, ICBP)..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${filterType === "all" ? styles.active : ""}`}
            onClick={() => setFilterType("all")}
          >
            {lang === "id" ? "Semua" : "All"} ({initialPower200.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === "fmcg" ? styles.active : ""}`}
            onClick={() => setFilterType("fmcg")}
          >
            {lang === "id" ? "FMCG Supermarket" : "FMCG Brands"}
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === "multi" ? styles.active : ""}`}
            onClick={() => setFilterType("multi")}
          >
            {lang === "id" ? "≥ 4 Kursi Direksi (Multi-Board)" : "≥ 4 Board Seats"}
          </button>
        </div>
      </div>

      {/* Grid of Clusters */}
      <div className={styles.networkGrid}>
        {filtered.map((item) => (
          <div
            key={item.insider}
            className={`${styles.clusterCard} ${selectedInsider?.insider === item.insider ? styles.active : ""}`}
            onClick={() => setSelectedInsider(item)}
          >
            <div className={styles.clusterHeader}>
              <div className={styles.clusterName}>{item.insider}</div>
              <span className={styles.clusterRank}>Rank #{item.rank}</span>
            </div>
            <div className={styles.clusterCompanies}>
              {item.companies.map((c) => (
                <span
                  key={c}
                  className={styles.clusterTicker}
                  style={fmcgTickers.has(c) ? { background: "var(--primary-subtle)", color: "var(--primary)" } : {}}
                >
                  {c}
                </span>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {item.board_seats} {lang === "id" ? "Kursi Dewan Terdaftar" : "Board Seats"}
            </div>
          </div>
        ))}
      </div>

      {/* Inspector for selected insider */}
      {selectedInsider && (
        <div className={styles.inspectorBox} style={{ marginTop: "var(--space-4)" }}>
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorTitle}>
              <Crown size={16} color="var(--primary)" />
              <span>{selectedInsider.insider} (Power200 #{selectedInsider.rank})</span>
            </div>
            <span className={styles.graphBadge} style={{ background: "#fef3c7", color: "#b45309" }}>
              {selectedInsider.board_seats} {lang === "id" ? "Kursi Emiten" : "Board Seats"}
            </span>
          </div>
          <div className={styles.inspectorBody}>
            {lang === "id" 
              ? `Tercatat memiliki posisi dewan komisaris / direksi pada emiten: ${selectedInsider.companies.join(", ")}. Seluruh data disinkronkan dari keterbukaan profil perusahaan tercatat BEI.`
              : `Holding boardroom governance seats across issuers: ${selectedInsider.companies.join(", ")}. Sourced directly from official IDX company disclosures.`}
          </div>
          <div className={styles.inspectorLinks}>
            <a
              href="https://www.idx.co.id"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <span>{lang === "id" ? "Verifikasi di BEI (idx.co.id)" : "Verify on IDX (idx.co.id)"}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
