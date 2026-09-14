"use client";

import { useState, useSyncExternalStore } from "react";
import { Scale, Database, Shield, AlertCircle, Mail, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import styles from "./about.module.css";

const DIMENSIONS = [
  { key: "halal", icon: "☪️", weight: "25%", en: "Halal Compliance", id: "Kepatuhan Halal", srcEn: "Official BPJPH/MUI halal certificate database, product labels, ingredient lists", srcId: "Database sertifikat halal BPJPH/MUI resmi, label produk, daftar bahan" },
  { key: "ethical", icon: "🤝", weight: "20%", en: "Ethical Sourcing", id: "Sumber Etis", srcEn: "Supply chain audits, labor rights reports, certification bodies (B Corp, SA8000)", srcId: "Audit rantai pasokan, laporan hak tenaga kerja, badan sertifikasi (B Corp, SA8000)" },
  { key: "esg", icon: "🌱", weight: "20%", en: "ESG Performance", id: "Kinerja ESG", srcEn: "Annual sustainability reports, GRI/SASB disclosures, Sustainalytics, EcoVadis", srcId: "Laporan keberlanjutan tahunan, pengungkapan GRI/SASB, Sustainalytics, EcoVadis" },
  { key: "political", icon: "⚖️", weight: "15%", en: "Political Neutrality", id: "Netralitas Politik", srcEn: "Corporate statements, news coverage, geopolitical stance analysis from credible media", srcId: "Pernyataan perusahaan, liputan berita, analisis sikap geopolitik dari media terpercaya" },
  { key: "community", icon: "👥", weight: "20%", en: "Community Trust", id: "Kepercayaan Komunitas", srcEn: "Platform user votes, boycott databases (BDS, NoThanks), consumer sentiment tracking", srcId: "Suara pengguna platform, database boikot (BDS, NoThanks), pelacakan sentimen konsumen" },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQ} onClick={() => setOpen((o) => !o)}>
        {q}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <p className={styles.faqA}>{a}</p>}
    </div>
  );
}

export default function AboutPage() {
  const { lang } = useApp();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return null;

  const content = {
    id: {
      title: "Tentang Bijak Beli",
      mission: {
        title: "Misi Kami",
        text: "Bijak Beli hadir untuk memberdayakan konsumen Indonesia—khususnya Muslim—dengan informasi yang transparan, berbasis data, dan dapat diverifikasi tentang brand yang mereka konsumsi setiap hari. Kami percaya bahwa keputusan pembelian adalah ekspresi dari nilai-nilai pribadi.",
      },
      howWorks: {
        title: "Bagaimana Cara Kerjanya",
        text: "Platform kami mengumpulkan data dari sumber publik yang dapat diverifikasi—laporan keberlanjutan perusahaan, database sertifikasi halal resmi, media terpercaya, dan sentimen komunitas—kemudian mentranslasikan data kompleks tersebut menjadi skor yang mudah dipahami.",
      },
      methodology: "Metodologi Scoring",
      scoring: "Setiap brand dinilai berdasarkan 5 dimensi. Pengguna dapat menyesuaikan bobot setiap dimensi sesuai prioritas. Skor keseluruhan = rata-rata tertimbang dari kelima dimensi (0-100), yang kemudian dikonversi ke grade A+ hingga F.",
      disclaimer: {
        title: "Disclaimer Penting",
        text: "Skor Bijak Beli adalah penilaian editorial berdasarkan data publik yang tersedia. Skor ini bukan keputusan hukum, bukan fatwa keagamaan, dan bukan pernyataan resmi dari lembaga manapun. Kami berupaya untuk akurat dan netral, namun kami mengakui keterbatasan data kami. Jika Anda menemukan kesalahan, silakan hubungi kami.",
      },
      faqs: [
        { q: "Apakah skor Bijak Beli bisa dijadikan fatwa halal?", a: "Tidak. Skor halal kami hanya mencerminkan ada/tidaknya sertifikasi resmi dari BPJPH atau MUI. Untuk keputusan halal yang sah, selalu rujuk ke sumber otoritatif seperti halal.go.id atau halalmui.org." },
        { q: "Bagaimana jika data brand tidak lengkap?", a: "Kami mencatat keterbatasan data. Brand dengan lebih sedikit data publik akan cenderung mendapatkan skor lebih rendah karena kurangnya transparansi—bukan karena terbukti bermasalah." },
        { q: "Siapa yang mengelola Bijak Beli?", a: "Bijak Beli adalah proyek komunitas yang diprakarsai oleh individu yang peduli dengan transparansi konsumen. Kami tidak terafiliasi dengan brand manapun dan tidak menerima pembayaran dari brand untuk skor yang diberikan." },
        { q: "Bagaimana cara melaporkan kesalahan data?", a: "Gunakan tombol 'Usul Koreksi' di halaman brand terkait, atau hubungi kami melalui email." },
      ],
    },
    en: {
      title: "About Bijak Beli",
      mission: {
        title: "Our Mission",
        text: "Bijak Beli empowers Indonesian consumers—especially Muslims—with transparent, data-driven, and verifiable information about the brands they consume every day. We believe purchasing decisions are an expression of personal values.",
      },
      howWorks: {
        title: "How It Works",
        text: "Our platform aggregates data from verifiable public sources—company sustainability reports, official halal certification databases, credible media, and community sentiment—then translates complex data into easy-to-understand scores.",
      },
      methodology: "Scoring Methodology",
      scoring: "Each brand is evaluated across 5 dimensions. Users can adjust the weight of each dimension based on their priorities. Overall score = weighted average of all five dimensions (0-100), converted to a grade from A+ to F.",
      disclaimer: {
        title: "Important Disclaimer",
        text: "Bijak Beli scores are editorial assessments based on available public data. They are not legal determinations, religious rulings, or official statements from any organization. We strive for accuracy and neutrality, but acknowledge the limitations of our data. If you find an error, please contact us.",
      },
      faqs: [
        { q: "Can Bijak Beli scores substitute for halal certification?", a: "No. Our halal score only reflects whether official certification from BPJPH or MUI exists. For authoritative halal determination, always refer to halal.go.id or halalmui.org." },
        { q: "What happens when brand data is incomplete?", a: "We note data limitations. Brands with less available public data tend to score lower because of lack of transparency—not because they are proven problematic." },
        { q: "Who runs Bijak Beli?", a: "Bijak Beli is a community project initiated by individuals committed to consumer transparency. We are not affiliated with any brand and do not accept payment from brands for scores." },
        { q: "How do I report incorrect data?", a: "Use the 'Suggest a Correction' button on the relevant brand page, or contact us via email." },
      ],
    },
  }[lang];

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <Scale size={28} />
          </div>
          <h1 className={styles.title}>{content.title}</h1>
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            {/* Mission */}
            <section className={styles.section} id="mission">
              <h2 className="section-title">{content.mission.title}</h2>
              <p className={styles.bodyText}>{content.mission.text}</p>
            </section>

            {/* How it works */}
            <section className={styles.section} id="how-it-works">
              <h2 className="section-title">{content.howWorks.title}</h2>
              <p className={styles.bodyText}>{content.howWorks.text}</p>
            </section>

            {/* Methodology */}
            <section className={styles.section} id="methodology">
              <h2 className="section-title">
                <BookOpen size={18} />
                {content.methodology}
              </h2>
              <p className={styles.bodyText}>{content.scoring}</p>

              <div className={styles.dimensionTable}>
                {DIMENSIONS.map((dim) => (
                  <div key={dim.key} className={`card card-body ${styles.dimensionRow}`}>
                    <div className={styles.dimTop}>
                      <span className={styles.dimIcon}>{dim.icon}</span>
                      <div className={styles.dimMeta}>
                        <div className={styles.dimName}>{lang === "id" ? dim.id : dim.en}</div>
                        <div className={styles.dimSrc}>{lang === "id" ? dim.srcId : dim.srcEn}</div>
                      </div>
                      <span className={styles.dimWeight}>{dim.weight}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.scoreTable}>
                <h3 className={styles.subTitle}>{lang === "id" ? "Tabel Grade" : "Grade Table"}</h3>
                <div className={styles.grades}>
                  {[
                    { grade: "A+", range: "90-100", color: "var(--score-excellent)" },
                    { grade: "A",  range: "80-89",  color: "var(--score-good-high)" },
                    { grade: "B",  range: "70-79",  color: "var(--score-good)" },
                    { grade: "C",  range: "60-69",  color: "var(--score-fair)" },
                    { grade: "D",  range: "40-59",  color: "var(--score-concerning)" },
                    { grade: "F",  range: "0-39",   color: "var(--score-poor)" },
                  ].map((g) => (
                    <div key={g.grade} className={styles.gradeRow}>
                      <span className={styles.gradeLetter} style={{ color: g.color }}>{g.grade}</span>
                      <span className={styles.gradeRange}>{g.range}</span>
                      <div className="score-bar-track" style={{ flex: 1 }}>
                        <div className="score-bar-fill" style={{ width: `${parseInt(g.range.split("-")[1])}%`, background: g.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className={`card card-body ${styles.disclaimerCard}`} id="disclaimer">
              <div className={styles.disclaimerIcon}>
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className={styles.disclaimerTitle}>{content.disclaimer.title}</h2>
                <p className={styles.bodyText}>{content.disclaimer.text}</p>
              </div>
            </section>

            {/* FAQ */}
            <section className={styles.section} id="faq">
              <h2 className="section-title">FAQ</h2>
              <div className={styles.faqList}>
                {content.faqs.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>
          </div>

          {/* Side TOC */}
          <div className={styles.toc}>
            <div className={`card card-body ${styles.tocCard}`}>
              <h3 className={styles.tocTitle}>{lang === "id" ? "Daftar Isi" : "Contents"}</h3>
              <nav>
                {[
                  { href: "#mission", label: lang === "id" ? "Misi" : "Mission" },
                  { href: "#how-it-works", label: lang === "id" ? "Cara Kerja" : "How It Works" },
                  { href: "#methodology", label: lang === "id" ? "Metodologi" : "Methodology" },
                  { href: "#disclaimer", label: "Disclaimer" },
                  { href: "#faq", label: "FAQ" },
                ].map((item) => (
                  <a key={item.href} href={item.href} className={styles.tocLink}>
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Data sources */}
              <div className={styles.dataSources}>
                <div className={styles.dataSourcesTitle}>
                  <Database size={14} />
                  {lang === "id" ? "Sumber Data Utama" : "Key Data Sources"}
                </div>
                {["BPJPH (halal.go.id)", "MUI (halalmui.org)", "GRI / SASB", "Sustainalytics", "Kompas, Reuters, BBC", "BDS / NoThanks"].map((src) => (
                  <div key={src} className={styles.dataSource}>{src}</div>
                ))}
              </div>

              {/* Contact */}
              <div className={styles.contact}>
                <Shield size={14} />
                <a href="mailto:contact@bijakbeli.id" className={styles.contactLink}>
                  <Mail size={12} />
                  contact@bijakbeli.id
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
