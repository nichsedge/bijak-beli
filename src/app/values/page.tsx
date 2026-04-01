"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Info, RotateCcw } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import ScoreBadge from "@/components/ScoreBadge";
import { brands } from "@/data/brands";
import { calculateAlignment } from "@/lib/scoring";
import { PRESET_PROFILES, DEFAULT_WEIGHTS, type ScoreWeights } from "@/lib/types";
import styles from "./values.module.css";

const DIMENSIONS: { key: keyof ScoreWeights; icon: string; en: string; id: string; descEn: string; descId: string }[] = [
  { key: "halal", icon: "☪️", en: "Halal Compliance", id: "Kepatuhan Halal", descEn: "How much you weight halal certification & supply chain", descId: "Seberapa penting sertifikasi halal & rantai pasokan" },
  { key: "ethical", icon: "🤝", en: "Ethical Sourcing", id: "Sumber Etis", descEn: "Fair labor, supply chain transparency, local sourcing", descId: "Keadilan tenaga kerja, transparansi rantai pasokan" },
  { key: "esg", icon: "🌱", en: "ESG Performance", id: "Kinerja ESG", descEn: "Environmental impact, social programs, governance", descId: "Dampak lingkungan, program sosial, tata kelola" },
  { key: "political", icon: "⚖️", en: "Political Neutrality", id: "Netralitas Politik", descEn: "No controversial political affiliations or conflict stances", descId: "Tidak ada afiliasi politik kontroversial" },
  { key: "community", icon: "👥", en: "Community Trust", id: "Kepercayaan Komunitas", descEn: "User ratings, boycott history, controversy severity", descId: "Rating pengguna, riwayat boikot, tingkat kontroversi" },
];

const PREVIEW_BRAND_ID = "wardah";
const PREVIEW_BAD_BRAND_ID = "starbucks";

export default function ValuesPage() {
  const { prefs, setWeights, setPreset, lang } = useApp();
  const [localWeights, setLocalWeights] = useState<ScoreWeights>(prefs.weights);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocalWeights(prefs.weights);
  }, [prefs.weights]);

  if (!mounted) return null;

  const previewBrand = brands.find((b) => b.id === PREVIEW_BRAND_ID)!;
  const previewBadBrand = brands.find((b) => b.id === PREVIEW_BAD_BRAND_ID)!;
  const previewResult = calculateAlignment(previewBrand, localWeights);
  const previewBadResult = calculateAlignment(previewBadBrand, localWeights);

  const totalWeight = Object.values(localWeights).reduce((a, b) => a + b, 0);

  function updateWeight(key: keyof ScoreWeights, val: number) {
    setLocalWeights((w) => ({ ...w, [key]: val }));
  }

  function handleSave() {
    setWeights(localWeights);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setLocalWeights(DEFAULT_WEIGHTS);
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {lang === "id" ? "Nilai Saya" : "My Values"}
          </h1>
          <p className={styles.subtitle}>
            {lang === "id"
              ? "Atur bobot setiap dimensi sesuai dengan apa yang paling penting bagi Anda. Skor brand akan disesuaikan secara otomatis."
              : "Set the weight for each dimension based on what matters most to you. Brand scores will adjust automatically."}
          </p>
        </div>

        <div className={styles.layout}>
          {/* Left: sliders */}
          <div className={styles.main}>
            {/* Preset profiles */}
            <div className={`card card-body ${styles.presetsCard}`}>
              <h2 className={styles.sectionTitle}>
                {lang === "id" ? "Profil Preset" : "Preset Profiles"}
              </h2>
              <div className={styles.presetsGrid}>
                {Object.entries(PRESET_PROFILES).map(([key, profile]) => (
                  <button
                    key={key}
                    className={`${styles.presetBtn} ${prefs.preset === key ? styles.presetActive : ""}`}
                    onClick={() => {
                      setPreset(key);
                      setLocalWeights(profile.weights);
                    }}
                  >
                    <span className={styles.presetName}>{lang === "id" ? profile.labelId : profile.label}</span>
                    <div className={styles.presetWeights}>
                      {Object.entries(profile.weights).map(([k, v]) => (
                        <div key={k} className={styles.presetWeightBar}>
                          <div style={{ width: `${v}%`, maxWidth: "100%", height: "3px", background: "var(--primary)", borderRadius: "2px" }} />
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom sliders */}
            <div className={`card card-body ${styles.slidersCard}`}>
              <div className={styles.sliderHeader}>
                <h2 className={styles.sectionTitle}>
                  {lang === "id" ? "Kustomisasi" : "Customize"}
                </h2>
                <span className={`${styles.totalBadge} ${Math.abs(totalWeight - 100) > 5 ? styles.totalWarning : styles.totalOk}`}>
                  Total: {totalWeight}%
                </span>
              </div>

              {Math.abs(totalWeight - 100) > 5 && (
                <div className={styles.weightWarning}>
                  <Info size={14} />
                  {lang === "id"
                    ? "Disarankan total bobot mendekati 100% untuk skor yang akurat."
                    : "Recommended total weight near 100% for accurate scores."}
                </div>
              )}

              <div className={styles.sliders}>
                {DIMENSIONS.map((dim) => (
                  <div key={dim.key} className={styles.sliderRow}>
                    <div className={styles.sliderLabel}>
                      <span className={styles.dimIcon}>{dim.icon}</span>
                      <div>
                        <div className={styles.dimName}>{lang === "id" ? dim.id : dim.en}</div>
                        <div className={styles.dimDesc}>{lang === "id" ? dim.descId : dim.descEn}</div>
                      </div>
                      <span className={styles.sliderVal}>{localWeights[dim.key]}%</span>
                    </div>
                    <input
                      id={`slider-${dim.key}`}
                      type="range"
                      min={0}
                      max={60}
                      step={5}
                      value={localWeights[dim.key]}
                      onChange={(e) => updateWeight(dim.key, Number(e.target.value))}
                      className="slider"
                    />
                  </div>
                ))}
              </div>

              <div className={styles.actions}>
                <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                  <RotateCcw size={14} />
                  {lang === "id" ? "Atur Ulang" : "Reset"}
                </button>
                <button
                  className={`btn btn-primary ${saved ? styles.savedBtn : ""}`}
                  onClick={handleSave}
                >
                  {saved ? (
                    <>
                      <CheckCircle size={16} />
                      {lang === "id" ? "Tersimpan!" : "Saved!"}
                    </>
                  ) : (
                    lang === "id" ? "Simpan Preferensi" : "Save Preferences"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className={styles.preview}>
            <div className={`card card-body ${styles.previewCard}`}>
              <h2 className={styles.sectionTitle}>
                {lang === "id" ? "Pratinjau Skor" : "Score Preview"}
              </h2>
              <p className={styles.previewDesc}>
                {lang === "id"
                  ? "Lihat bagaimana bobot Anda mempengaruhi skor brand ini:"
                  : "See how your weights affect these brand scores:"}
              </p>

              <div className={styles.previewBrands}>
                {/* High score brand */}
                <div className={styles.previewBrand}>
                  <div className={styles.previewBrandInfo}>
                    <div className={styles.previewLogoWrap}>
                      <span className={styles.previewLogo}>{previewBrand.name[0]}</span>
                    </div>
                    <div>
                      <div className={styles.previewBrandName}>{previewBrand.name}</div>
                      <div className={styles.previewBrandCat}>{previewBrand.category}</div>
                    </div>
                  </div>
                  <ScoreBadge result={previewResult} size="sm" animate={false} />
                </div>

                <div className={styles.previewDivider} />

                {/* Low score brand */}
                <div className={styles.previewBrand}>
                  <div className={styles.previewBrandInfo}>
                    <div className={styles.previewLogoWrap}>
                      <span className={styles.previewLogo}>{previewBadBrand.name[0]}</span>
                    </div>
                    <div>
                      <div className={styles.previewBrandName}>{previewBadBrand.name}</div>
                      <div className={styles.previewBrandCat}>{previewBadBrand.category}</div>
                    </div>
                  </div>
                  <ScoreBadge result={previewBadResult} size="sm" animate={false} />
                </div>
              </div>

              <p className={styles.previewHint}>
                {lang === "id"
                  ? "Skor berubah secara real-time saat Anda menggeser slider."
                  : "Scores update in real-time as you move the sliders."}
              </p>
            </div>

            {/* Info */}
            <div className={`card card-body ${styles.infoCard}`}>
              <h3 className={styles.infoTitle}>
                {lang === "id" ? "Bagaimana cara kerjanya?" : "How does it work?"}
              </h3>
              <div className={styles.infoSteps}>
                {(lang === "id"
                  ? ["Atur bobot (%) untuk setiap dimensi", "Skor tiap brand dihitung berdasarkan bobot Anda", "Skor keseluruhan = rata-rata tertimbang", "Skor disimpan di perangkat Anda"]
                  : ["Set weights (%) for each dimension", "Each brand's score is weighted by your preferences", "Overall score = weighted average", "Your preferences are saved on this device"]
                ).map((step, i) => (
                  <div key={i} className={styles.infoStep}>
                    <span className={styles.infoNum}>{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Link href="/about#methodology" className={styles.infoLink}>
                {lang === "id" ? "Pelajari metodologi →" : "Learn about methodology →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
