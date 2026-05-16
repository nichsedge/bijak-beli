"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Zap, Loader2, ScanLine } from "lucide-react";
import Link from "next/link";
import styles from "./scan.module.css";
import { useApp } from "@/components/AppProvider";

export default function ScanPage() {
  const [status, setStatus] = useState<"idle" | "scanning" | "found">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const router = useRouter();
  const { lang, t } = useApp();

  useEffect(() => {
    if (status === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setStatus("found");
            return 100;
          }
          return p + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === "found") {
      const timer = setTimeout(() => {
        // Simulate finding "indomie"
        router.push("/brand/indomie");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className={styles.scanPage}>
      <div className={styles.scanHeader}>
        <Link href="/" className={styles.closeBtn}>
          <X size={24} />
        </Link>
        <h1 className={styles.title}>
          {lang === "id" ? "Scan Produk" : "Product Scanner"}
        </h1>
      </div>

      <div className={styles.viewportContainer}>
        <div className={styles.viewport}>
          {status === "idle" && (
            <div className={styles.idleOverlay} onClick={() => setStatus("scanning")}>
              <div className={styles.cameraIcon}>
                <Camera size={48} />
              </div>
              <p>{lang === "id" ? "Ketuk untuk Memindai" : "Tap to Scan"}</p>
            </div>
          )}

          {status === "scanning" && (
            <>
              <div className={styles.scanLine} />
              <div className={styles.scanningOverlay}>
                <div className={styles.focusFrame} />
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{ width: `${scanProgress}%` }} />
                </div>
                <p>{lang === "id" ? "Mencari Brand..." : "Identifying Brand..."}</p>
              </div>
            </>
          )}

          {status === "found" && (
            <div className={styles.foundOverlay}>
              <div className={styles.foundBadge}>
                <Zap size={24} />
              </div>
              <h2>Indomie</h2>
              <p>{lang === "id" ? "Brand Berhasil Dikenali" : "Brand Recognized"}</p>
              <div className={styles.redirecting}>
                <Loader2 size={16} className="animate-spin" />
                <span>{lang === "id" ? "Mengarahkan..." : "Redirecting..."}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.instructions}>
        <p>
          {lang === "id" 
            ? "Arahkan kamera ke barcode atau logo brand untuk mengetahui profil etisnya secara instan."
            : "Point your camera at a barcode or brand logo to instantly see its ethical profile."}
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.tip}>
          <Zap size={14} />
          <span>{lang === "id" ? "Tips: Pastikan pencahayaan cukup" : "Tip: Ensure good lighting"}</span>
        </div>
      </div>
    </div>
  );
}
