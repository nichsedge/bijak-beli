"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Zap, Loader2, VideoOff, Barcode } from "lucide-react";
import Link from "next/link";
import styles from "./scan.module.css";
import { useApp } from "@/components/AppProvider";

import { resolveBarcode } from "@/lib/barcode-resolver";

const QUICK_TEST_BRANDS = [
  { id: "indomie", name: "Indomie", code: "8998866200224" },
  { id: "le-minerale", name: "Le Minerale", code: "8992761011118" },
  { id: "aqua", name: "Aqua", code: "8992696404412" },
  { id: "mie-sedaap", name: "Mie Sedaap", code: "8992388114120" },
  { id: "ultra-milk", name: "Ultra Milk", code: "8992759110010" },
  { id: "tolak-angin", name: "Tolak Angin", code: "8993005120015" },
];

export default function ScanPage() {
  const [status, setStatus] = useState<"idle" | "scanning" | "found" | "camera_error">("idle");
  const [detectedBrand, setDetectedBrand] = useState<{ id: string; name: string; company?: string } | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { lang } = useApp();

  const handleBrandIdentified = useCallback((brandId: string, brandName: string, company?: string) => {
    setDetectedBrand({ id: brandId, name: brandName, company });
    setStatus("found");

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Redirect to brand profile
    setTimeout(() => {
      router.push(`/brand/${brandId}`);
    }, 1300);
  }, [router]);

  const startCamera = async () => {
    setStatus("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for native BarcodeDetector API
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const detector = new (window as unknown as {
            BarcodeDetector: new (opts: { formats: string[] }) => {
              detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
            };
          }).BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128"],
          });

          scanIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2 || isResolving) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                setIsResolving(true);
                const res = await resolveBarcode(rawValue);
                handleBrandIdentified(res.brandId, res.name, res.parentCompany);
              }
            } catch {
              // Ignore frame detection errors
            } finally {
              setIsResolving(false);
            }
          }, 300);
        } catch {
          // BarcodeDetector failed to initialize
        }
      }
    } catch {
      setStatus("camera_error");
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (!clean) return;

    setIsResolving(true);
    try {
      const res = await resolveBarcode(clean);
      handleBrandIdentified(res.brandId, res.name, res.parentCompany);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={styles.scanPage}>
      <div className={styles.scanHeader}>
        <Link href="/" className={styles.closeBtn}>
          <X size={24} />
        </Link>
        <h1 className={styles.title}>
          {lang === "id" ? "Scan Barcode Produk" : "Scan Product Barcode"}
        </h1>
      </div>

      <div className={styles.viewportContainer}>
        <div className={styles.viewport}>
          {status === "idle" && (
            <div className={styles.idleOverlay} onClick={startCamera}>
              <div className={styles.cameraIcon}>
                <Camera size={48} />
              </div>
              <p>{lang === "id" ? "Ketuk untuk Membuka Kamera" : "Tap to Open Camera"}</p>
            </div>
          )}

          {status === "camera_error" && (
            <div className={styles.idleOverlay} onClick={startCamera}>
              <div className={styles.cameraIcon}>
                <VideoOff size={48} />
              </div>
              <p style={{ textAlign: "center", padding: "0 20px" }}>
                {lang === "id"
                  ? "Kamera tidak aktif atau izin ditolak. Gunakan opsi uji cepat di bawah."
                  : "Camera unavailable or permission denied. Use quick test options below."}
              </p>
            </div>
          )}

          {status === "scanning" && (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={styles.videoElement}
              />
              <div className={styles.scanLine} />
              <div className={styles.scanningOverlay}>
                <div className={styles.focusFrame} />
                <p>{lang === "id" ? "Arahkan ke Barcode Produk..." : "Align Barcode in Frame..."}</p>
              </div>
            </>
          )}

          {status === "found" && (
            <div className={styles.foundOverlay}>
              <div className={styles.foundBadge}>
                <Zap size={28} />
              </div>
              <h2>{detectedBrand?.name || "Brand"}</h2>
              <p>
                {detectedBrand?.company ? (
                  <span style={{ opacity: 0.9 }}>{detectedBrand.company}</span>
                ) : (
                  lang === "id" ? "Brand Berhasil Dikenali" : "Brand Recognized"
                )}
              </p>
              <div className={styles.redirecting}>
                <Loader2 size={16} className="animate-spin" />
                <span>{lang === "id" ? "Mengarahkan ke profil..." : "Redirecting to profile..."}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Test / Manual Entry Section */}
      <div className={styles.quickTestContainer}>
        <span className={styles.quickTestTitle}>
          {lang === "id" ? "Uji Cepat Produk Populer" : "Quick Test Popular Products"}
        </span>
        <div className={styles.chipsWrapper}>
          {QUICK_TEST_BRANDS.map((item) => (
            <button
              key={item.id}
              className={styles.chipBtn}
              onClick={() => handleBrandIdentified(item.id, item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleManualSubmit} className={styles.manualInputForm}>
          <input
            type="text"
            placeholder={lang === "id" ? "Masukkan barcode (misal: 8998866200224)..." : "Enter barcode or brand name..."}
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className={styles.barcodeInput}
          />
          <button type="submit" className={styles.submitBarcodeBtn}>
            <Barcode size={16} />
          </button>
        </form>
      </div>

      <div className={styles.instructions}>
        <p>
          {lang === "id"
            ? "Pindai barcode kemasan makanan, minuman, atau sabun untuk melihat afiliasi konglomerat & profil etis."
            : "Scan food, beverage, or personal care product barcodes to view conglomerate affiliation & ethical ratings."}
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.tip}>
          <Zap size={14} />
          <span>{lang === "id" ? "Tips: Format EAN-13 Indonesia diawali angka 899" : "Tip: Indonesian EAN-13 barcodes start with 899"}</span>
        </div>
      </div>
    </div>
  );
}
