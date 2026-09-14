"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle, ThumbsUp, ThumbsDown, ShoppingBag, 
  ChevronRight, Building2, Shield, AlertTriangle,
  ExternalLink, FileText, ShieldCheck, Scale, Crown
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import BrandCard from "@/components/BrandCard";
import AiInsight from "@/components/AiInsight";
import { formatDate, severityColor } from "@/lib/utils";
import { getBrandScoreAudit } from "@/lib/scoring";
import { BrandOwnershipGraph } from "@/components/OwnershipGraph";
import { conglomerates } from "@/data/conglomerates";
import { brands } from "@/data/brands";
import type { Controversy, Brand, AlignmentResult } from "@/lib/types";
import styles from "../app/brand/[id]/brand.module.css";

interface BrandDetailClientProps {
  brand: Brand;
  brandControversies: Controversy[];
  alternatives: Brand[];
  result: AlignmentResult;
}

export default function BrandDetailClient({ brand, brandControversies, alternatives, result }: BrandDetailClientProps) {
  const { prefs, lang, toggleCompare, recordPurchase, t } = useApp();
  const isComparing = prefs.compareIds?.includes(brand.id);
  const [activeTab, setActiveTab] = useState("overview");
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [votes, setVotes] = useState(brand.communityVotes);

  const conglomerate = brand.conglomerateId
    ? conglomerates.find((c) => c.id === brand.conglomerateId)
    : null;

  const sisterBrands = brand.conglomerateId
    ? brands.filter((b) => b.conglomerateId === brand.conglomerateId && b.id !== brand.id)
    : [];

  function handleVote(dir: "up" | "down") {
    if (voted === dir) {
      setVoted(null);
      setVotes((v) => ({ ...v, [dir]: v[dir] - 1 }));
    } else {
      if (voted) setVotes((v) => ({ ...v, [voted]: v[voted] - 1 }));
      setVoted(dir);
      setVotes((v) => ({ ...v, [dir]: v[dir] + 1 }));
    }
  }

  const total = votes.up + votes.down;
  const upPct = total > 0 ? Math.round((votes.up / total) * 100) : 50;

  const tabs = [
    { id: "overview", label: t("brand", "overview") },
    { id: "transparency", label: t("brand", "transparency") },
    { id: "community", label: t("brand", "community") },
    { id: "alternatives", label: t("brand", "alternatives") },
  ];

  return (
    <>
      {/* Brand header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandIdentity}>
          <div className={styles.logoBox}>
            <span className={styles.logoLetter}>{brand.name[0]}</span>
          </div>
          <div className={styles.brandMeta}>
            <h1 className={styles.brandName}>{brand.name}</h1>
            {brand.parentCompany && (
              <div className={styles.parentLine}>
                <Building2 size={13} />
                <span>{brand.parentCompany}</span>
                {brand.ultimateOwner && brand.ultimateOwner !== brand.parentCompany && (
                  <span className={styles.ultimateOwner}>→ {brand.ultimateOwner}</span>
                )}
              </div>
            )}
            <div className={styles.headerBadges}>
              {brand.halalCertified ? (
                brand.halalCertId ? (
                  <a
                    href="https://bpjph.halal.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.regBadgeLink}
                    title="Terdaftar Resmi di BPJPH Kementerian Agama"
                  >
                    <CheckCircle size={11} color="var(--score-excellent)" />
                    <span>BPJPH #{brand.halalCertId}</span>
                    <ExternalLink size={9} />
                  </a>
                ) : (
                  <span className="badge badge-halal">
                    <CheckCircle size={11} />
                    {brand.halalCertifier || "Halal"}
                  </span>
                )
              ) : (
                <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                  {t("brand", "notCertified")}
                </span>
              )}
              {brand.bpomId && (
                <a
                  href={
                    brand.bpomId.includes("PKD") || brand.bpomId.includes("Kemenkes")
                      ? "https://infoalkes.kemkes.go.id"
                      : "https://cekbpom.pom.go.id"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.regBadgeLink}
                  title={
                    brand.bpomId.includes("PKD") || brand.bpomId.includes("Kemenkes")
                      ? "Izin Edar PKRT Kemenkes RI (Perbekalan Kesehatan Rumah Tangga)"
                      : "Nomor Izin Edar BPOM RI"
                  }
                >
                  <Shield size={11} color="var(--primary)" />
                  <span>{brand.bpomId}</span>
                  <ExternalLink size={9} />
                </a>
              )}
              {brand.idxTicker && (
                <a
                  href={brand.idxUrl || `https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/${brand.idxTicker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.regBadgeLink}
                  title="Keterbukaan Informasi Bursa Efek Indonesia"
                >
                  <Building2 size={11} color="#0284c7" />
                  <span>BEI: {brand.idxTicker}</span>
                  <ExternalLink size={9} />
                </a>
              )}
              {brand.powerMapRank && (
                <Link
                  href="/power"
                  className={styles.regBadgeLink}
                  title="Konglomerasi Power200 LittleSis"
                >
                  <Scale size={11} color="#e11d48" />
                  <span>Power200 #{brand.powerMapRank}</span>
                  <ChevronRight size={10} />
                </Link>
              )}
              {conglomerate && (
                <Link
                  href={`/conglomerates?id=${conglomerate.id}`}
                  className={styles.regBadgeLink}
                  style={{ borderColor: "var(--primary)", background: "var(--primary-subtle)" }}
                  title={`Grup Konglomerasi: ${conglomerate.name} (${conglomerate.tycoon})`}
                >
                  <Crown size={11} color="var(--primary-dark)" />
                  <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>Grup: {conglomerate.name}</span>
                  <ChevronRight size={10} color="var(--primary-dark)" />
                </Link>
              )}
              {brand.boycottActive && (
                <span className="badge badge-boycott" title={brand.boycottReason}>
                  <AlertTriangle size={11} />
                  {t("common", "boycott")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.scoreSide}>
          <ScoreBadge result={result} size="lg" animate />
          <p className={styles.scoreLabel}>{t("scores", "overall")}</p>
          <button 
            className={`btn ${purchased ? 'btn-primary' : 'btn-outline'} btn-sm`}
            style={{ marginTop: 'var(--space-3)', width: '100%' }}
            onClick={() => {
              recordPurchase(brand.id);
              setPurchased(true);
              setTimeout(() => setPurchased(false), 2000);
            }}
          >
            {purchased ? <CheckCircle size={14} /> : <ShoppingBag size={14} />}
            {purchased ? t("values", "saved") : (lang === "id" ? "Saya Beli Ini" : "I Bought This")}
          </button>
          <button 
            className={`btn ${isComparing ? 'btn-secondary' : 'btn-outline'} btn-sm`}
            style={{ marginTop: 'var(--space-2)', width: '100%' }}
            onClick={() => toggleCompare(brand.id)}
          >
            <Scale size={14} />
            {isComparing ? t("common", "comparing") : t("common", "compare")}
          </button>
        </div>
      </div>

      <p className={styles.description}>
        {lang === "id" ? brand.descriptionId : brand.description}
      </p>

      <div className={`tabs ${styles.tabsWrap}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <>
            <div className={styles.overviewGrid}>
              <div className={`card card-body ${styles.panel}`}>
                <h2 className="section-title" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                  {t("scores", "breakdown")}
                </h2>
                <ScoreBreakdown brand={brand} weights={prefs.weights} />
              </div>

              <AiInsight brand={brand} result={result} lang={lang} />

              <div className={styles.sidePanel}>
                <div className={`card card-body ${styles.panel}`}>
                  <h2 className={styles.panelTitle}><Building2 size={16} />{t("brand", "parentCompany")}</h2>
                  <div className="ownership-tree">
                    <div className="ownership-node">
                      <div className={styles.ownerBadge}>Brand</div>
                      <span className={styles.ownerName}>{brand.name}</span>
                    </div>
                    {brand.parentCompany && (
                      <>
                        <div className="ownership-connector" />
                        <div className="ownership-node">
                          <div className={styles.ownerBadge} style={{ background: "var(--surface-2)" }}>Parent</div>
                          <span className={styles.ownerName}>{brand.parentCompany}</span>
                        </div>
                      </>
                    )}
                    {brand.ultimateOwner && (
                      <>
                        <div className="ownership-connector" />
                        <div className="ownership-node">
                          <div className={styles.ownerBadge} style={{ background: "#fef3c7", color: "#b45309" }}>UBO</div>
                          <span className={styles.ownerName}>
                            {brand.ultimateOwner.split("/")[0].trim()}
                            {brand.powerMapRank ? ` (Rank #${brand.powerMapRank})` : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {brandControversies.length > 0 && (
                  <div className={`card card-body ${styles.panel}`}>
                    <h2 className={styles.panelTitle}><AlertTriangle size={16} />{t("brand", "controversies")}</h2>
                    <div className={styles.controversyList}>
                      {brandControversies.map((c) => (
                        <div key={c.id} className={styles.controversyItem}>
                          <div className={styles.severityDot} style={{ background: severityColor(c.severity) }} />
                          <div>
                            <div className={styles.controversyTitle}>{lang === "id" ? c.titleId : c.title}</div>
                            <div className={styles.controversyDate}>
                              {formatDate(c.date, lang === "id" ? "id-ID" : "en-US")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {conglomerate && (
              <div className={styles.conglomerateCard}>
                <div className={styles.conglomerateCardHeader}>
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", background: "var(--primary-light)", padding: "3px 10px", borderRadius: 999, marginBottom: 6 }}>
                      <Crown size={12} /> {lang === "id" ? "Grup Konglomerasi & Induk Bisnis" : "Conglomerate Group & Parent"}
                    </div>
                    <h3 className={styles.conglomerateName}>{conglomerate.name}</h3>
                    <div className={styles.conglomerateTycoon}>
                      <span>Taipan / Pemilik Utama:</span>
                      <strong>{conglomerate.tycoon}</strong>
                      {conglomerate.powerMapRank && (
                        <span style={{ marginLeft: 8, color: "#e11d48", fontWeight: 700 }}>
                          • Power200 #{conglomerate.powerMapRank}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/conglomerates?id=${conglomerate.id}`}
                    className="btn btn-outline btn-xs"
                    style={{ fontSize: "11px", gap: 4 }}
                  >
                    <span>{lang === "id" ? "Buka Berkas Lengkap" : "Open Full Dossier"}</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                  {lang === "id" ? conglomerate.descriptionId : conglomerate.description}
                </p>

                {sisterBrands.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      {lang === "id" ? "Merek Lain dalam Konglomerasi Ini:" : "Sister Brands in this Conglomerate:"}
                    </div>
                    <div className={styles.sisterBrandsWrap}>
                      {sisterBrands.map((sb) => (
                        <Link
                          key={sb.id}
                          href={`/brand/${sb.id}`}
                          className={styles.sisterBrandPill}
                          title={sb.name}
                        >
                          <span>{sb.name}</span>
                          <span style={{ fontSize: "10px", opacity: 0.6 }}>({sb.category})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <BrandOwnershipGraph brand={brand} lang={lang} />
          </>
        )}

        {activeTab === "transparency" && (
          <div className={styles.transparencyContent}>
            {/* Visual Corporate Ownership Chain */}
            <BrandOwnershipGraph brand={brand} lang={lang} />

            {/* 1. Verifiable Audit Trail & Public Filings */}
            <div className={`card card-body ${styles.panel}`}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.panelTitle}><ShieldCheck size={18} color="var(--score-excellent)" />{t("brand", "auditTrail")}</h2>
                <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: "11px" }}>
                  {brand.sources?.length || 0} {lang === "id" ? "Dokumen Terverifikasi" : "Verified Documents"}
                </span>
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)", marginBottom: "var(--space-3)" }}>
                {lang === "id" 
                  ? "Seluruh klaim dan penilaian dirujuk langsung dari keterbukaan informasi emiten BEI, pendaftaran izin edar BPOM, sertifikasi BPJPH Kemenag, dan laporan investigasi primer." 
                  : "All claims are grounded in official public regulatory registries, BPOM licensing, BPJPH certificates, and primary disclosures."}
              </p>

              {(!brand.sources || brand.sources.length === 0) ? (
                <div className={styles.emptyState}>
                  <FileText size={28} color="var(--text-muted)" />
                  <p>{lang === "id" ? "Belum ada dokumen publik terarsip." : "No archived public filings recorded."}</p>
                </div>
              ) : (
                <div className={styles.sourceGrid}>
                  {brand.sources.map((src, i) => (
                    <div key={i} className={styles.sourceCard}>
                      <div className={styles.sourceTop}>
                        <div className={styles.sourceTitle}>{src.title}</div>
                        <div className={styles.sourceBadges}>
                          <span className={`${styles.confBadge} ${src.confidence === "high" ? styles.confHigh : src.confidence === "medium" ? styles.confMedium : styles.confLow}`}>
                            <ShieldCheck size={10} />
                            {src.confidence === "high" ? (lang === "id" ? "Dokumen Resmi" : "Official Proof") : (lang === "id" ? "Media Terpercaya" : "Verified Press")}
                          </span>
                          {src.docType && (
                            <span className={styles.docBadge}>
                              {src.docType === "regulatory_filing" ? (lang === "id" ? "Regulasi / BEI" : "Regulatory") :
                               src.docType === "government_registry" ? (lang === "id" ? "Pemerintah" : "Gov Registry") :
                               src.docType === "court_or_antitrust" ? (lang === "id" ? "Pengadilan / KPPU" : "Court/Antitrust") :
                               src.docType === "official_campaign" ? (lang === "id" ? "Resolusi Kampanye" : "Campaign Resolution") :
                               src.docType === "investigative_report" ? (lang === "id" ? "Investigasi Pers" : "Investigative") :
                               (lang === "id" ? "Laporan Korporasi" : "Disclosure")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.sourceFooter}>
                        <span>
                          {src.publisher ? `${src.publisher} • ` : ""}
                          {src.documentId ? `${src.documentId} • ` : ""}
                          {formatDate(src.date, lang === "id" ? "id-ID" : "en-US")}
                        </span>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className={styles.verifyLink}>
                          <span>{t("brand", "verifyDoc")}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Transparent Scoring Rubric Breakdown */}
            <div className={`card card-body ${styles.panel}`} style={{ marginTop: "var(--space-5)" }}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.panelTitle}><Scale size={18} color="var(--primary)" />{t("brand", "scoreRubric")}</h2>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>UU ITE Safe Harbor Compliant</span>
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                {t("brand", "editorialNote")}
              </p>
              
              <div className={styles.auditTableWrap}>
                <table className={styles.auditTable}>
                  <thead>
                    <tr>
                      <th>{lang === "id" ? "Dimensi" : "Dimension"}</th>
                      <th>{lang === "id" ? "Skor" : "Score"}</th>
                      <th>{lang === "id" ? "Kriteria & Dasar Hitung" : "Criteria & Formula"}</th>
                      <th>{lang === "id" ? "Rujukan Bukti" : "Evidence"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBrandScoreAudit(brand, lang).map((audit, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{audit.dimension}</td>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>{audit.score} / 100</td>
                        <td style={{ color: "var(--text-secondary)" }}>{lang === "id" ? audit.rubricId : audit.rubric}</td>
                        <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>{lang === "id" ? audit.evidenceId : audit.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Recorded Controversies Timeline */}
            <div className={`card card-body ${styles.panel}`} style={{ marginTop: "var(--space-5)" }}>
              <h2 className={styles.panelTitle}><AlertTriangle size={16} />{t("brand", "controversies")}</h2>
              {brandControversies.length === 0 ? (
                <div className={styles.emptyState}><CheckCircle size={32} color="var(--score-excellent)" /><p>{t("brand", "noControversies")}</p></div>
              ) : (
                <div className={styles.timeline}>
                  {brandControversies.map((c) => (
                    <div key={c.id} className={styles.timelineItem}>
                      <div className={styles.timelineDate}>{formatDate(c.date, lang === "id" ? "id-ID" : "en-US")}</div>
                      <div className={styles.timelineDot} style={{ background: severityColor(c.severity) }} />
                      <div className={styles.timelineContent}>
                        <h3 className={styles.timelineTitle}>{lang === "id" ? c.titleId : c.title}</h3>
                        <p className={styles.timelineDesc}>{lang === "id" ? c.descriptionId : c.description}</p>
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}><ExternalLink size={12} />{c.source} ↗</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Safe Harbor Dispute & Correction CTA */}
            <div className={styles.disputeBox}>
              <div className={styles.disputeText}>
                <h4>{t("brand", "disputeTitle")}</h4>
                <p>{t("brand", "disputeDesc")}</p>
              </div>
              <a
                href={`https://github.com/nichsedge/bijak-beli/issues/new?title=${encodeURIComponent(`[Koreksi Data] Brand: ${brand.name}`)}&body=${encodeURIComponent(`### Laporan Koreksi Data\n- **Brand**: ${brand.name}\n- **ID**: ${brand.id}\n- **Dokumen Bukti**: [Lampirkan tautan atau nomor registrasi resmi]\n- **Catatan**: `)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <FileText size={13} />
                <span>{t("brand", "disputeBtn")}</span>
              </a>
            </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className={styles.communityContent}>
            <div className={`card card-body ${styles.panel}`}>
              <h2 className={styles.panelTitle}>{t("community", "sentiment")}</h2>
              <div className={styles.voteDisplay}>
                <div className={styles.voteBar}><div className={styles.voteBarUp} style={{ width: `${upPct}%` }} /><div className={styles.voteBarDown} style={{ width: `${100 - upPct}%` }} /></div>
                <div className={styles.voteNumbers}>
                  <span style={{ color: "var(--score-excellent)" }}>👍 {votes.up.toLocaleString()} ({upPct}%)</span>
                  <span style={{ color: "var(--score-poor)" }}>👎 {votes.down.toLocaleString()} ({100 - upPct}%)</span>
                </div>
              </div>
              <div className={styles.voteActions}>
                <p className={styles.votePrompt}>{t("community", "vote")}</p>
                <div className={styles.voteButtons}>
                  <button className={`${styles.voteBtn} ${voted === "up" ? styles.voteBtnActiveUp : ""}`} onClick={() => handleVote("up")}><ThumbsUp size={18} />{t("community", "upvote")}</button>
                  <button className={`${styles.voteBtn} ${voted === "down" ? styles.voteBtnActiveDown : ""}`} onClick={() => handleVote("down")}><ThumbsDown size={18} />{t("community", "downvote")}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "alternatives" && (
          <div className={styles.alternativesContent}>
            <p className={styles.altIntro}>{t("common", "alternatives")}</p>
            <div className={styles.altGrid}>
              {alternatives.map((alt) => alt && <BrandCard key={alt.id} brand={alt} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
