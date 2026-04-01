"use client";

import Link from "next/link";
import { Scale, Heart } from "lucide-react";
import { useApp } from "./AppProvider";
import styles from "./Footer.module.css";

export default function Footer() {
  const { lang } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <Scale size={18} />
          </div>
          <div>
            <div className={styles.name}>Bijak Beli</div>
            <div className={styles.tagline}>
              {lang === "id"
                ? "Transparansi brand untuk konsumen bijak"
                : "Brand transparency for wise consumers"}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>
              {lang === "id" ? "Telusuri" : "Explore"}
            </h3>
            <Link href="/search?category=food-beverage" className={styles.link}>
              {lang === "id" ? "Makanan & Minuman" : "Food & Beverage"}
            </Link>
            <Link href="/search?category=personal-care" className={styles.link}>
              {lang === "id" ? "Perawatan Diri" : "Personal Care"}
            </Link>
            <Link href="/search?category=technology" className={styles.link}>
              {lang === "id" ? "Teknologi" : "Technology"}
            </Link>
            <Link href="/search?category=fashion" className={styles.link}>
              {lang === "id" ? "Mode" : "Fashion"}
            </Link>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Platform</h3>
            <Link href="/values" className={styles.link}>
              {lang === "id" ? "Nilai Saya" : "My Values"}
            </Link>
            <Link href="/community" className={styles.link}>
              {lang === "id" ? "Komunitas" : "Community"}
            </Link>
            <Link href="/about" className={styles.link}>
              {lang === "id" ? "Metodologi" : "Methodology"}
            </Link>
            <Link href="/about#disclaimer" className={styles.link}>
              Disclaimer
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <span>© {year} Bijak Beli</span>
            <span>
              {lang === "id" ? "Dibuat dengan" : "Made with"}{" "}
              <Heart size={12} className={styles.heart} />{" "}
              {lang === "id" ? "untuk konsumen bijak" : "for conscious consumers"}
            </span>
            <span className={styles.disclaimer}>
              {lang === "id"
                ? "Skor bersifat editorial · Bukan keputusan hukum"
                : "Scores are editorial · Not legal determinations"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
