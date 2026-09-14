"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  X, Zap, Camera, RefreshCw, Flashlight, Upload, 
  Search, AlertCircle, ArrowRight 
} from "lucide-react";
import { resolveBarcode } from "@/lib/barcode-resolver";
import { useApp } from "./AppProvider";
import styles from "./ScannerModal.module.css";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TEST_CODES = [
  { id: "indomie", name: "Indomie", code: "8998866200224" },
  { id: "le-minerale", name: "Le Minerale", code: "8992761011118" },
  { id: "aqua", name: "Aqua", code: "8992696404412" },
  { id: "mie-sedaap", name: "Mie Sedaap", code: "8992388114120" },
  { id: "bimoli", name: "Bimoli", code: "8992745100018" },
  { id: "sunlight", name: "Sunlight", code: "8999999456789" },
];

export default function ScannerModal({ isOpen, onClose }: ScannerModalProps) {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedResult, setResolvedResult] = useState<{
    brandId: string;
    name: string;
    parentCompany?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { lang } = useApp();

  const stopStream = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    queueMicrotask(() => {
      setScanning(false);
      setTorchOn(false);
    });
  }, []);

  const handleBarcodeFound = useCallback((brandId: string, name: string, parentCompany?: string) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([80]);
      } catch {
        // Haptics unavailable
      }
    }
    setResolvedResult({ brandId, name, parentCompany });
    stopStream();

    setTimeout(() => {
      router.push(`/brand/${brandId}`);
      onClose();
    }, 1200);
  }, [router, onClose, stopStream]);

  const startCamera = useCallback(async () => {
    queueMicrotask(() => {
      setCameraError(null);
      setScanning(true);
      setResolvedResult(null);
    });

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

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track as { getCapabilities?: () => { torch?: boolean } }).getCapabilities?.();
      if (capabilities?.torch) {
        setHasTorch(true);
      }

      // BarcodeDetector native loop
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const detector = new (window as unknown as {
            BarcodeDetector: new (opts: { formats: string[] }) => {
              detect: (src: HTMLVideoElement | HTMLImageElement) => Promise<Array<{ rawValue: string }>>;
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
                handleBarcodeFound(res.brandId, res.name, res.parentCompany);
              }
            } catch {
              // Frame dropped, keep listening
            } finally {
              setIsResolving(false);
            }
          }, 300);
        } catch {
          // Native detector not ready
        }
      }
    } catch {
      setCameraError(
        lang === "id"
          ? "Kamera tidak dapat diakses. Gunakan input manual atau unggah foto barcode."
          : "Camera unavailable. Use manual input or upload a barcode image."
      );
      setScanning(false);
    }
  }, [handleBarcodeFound, isResolving, lang]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        startCamera();
      }, 0);
    } else {
      timer = setTimeout(() => {
        stopStream();
      }, 0);
    }
    return () => {
      clearTimeout(timer);
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0] as MediaStreamTrack & {
      applyConstraints?: (c: { advanced: Array<{ torch: boolean }> }) => Promise<void>;
    };
    if (track && track.applyConstraints) {
      try {
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
        setTorchOn(!torchOn);
      } catch {
        // Torch constraint rejected
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;

    setIsResolving(true);
    try {
      const res = await resolveBarcode(code);
      handleBarcodeFound(res.brandId, res.name, res.parentCompany);
    } finally {
      setIsResolving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const detector = new (window as unknown as {
            BarcodeDetector: new (opts: { formats: string[] }) => {
              detect: (src: HTMLImageElement) => Promise<Array<{ rawValue: string }>>;
            };
          }).BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128"],
          });
          const barcodes = await detector.detect(img);
          if (barcodes && barcodes.length > 0) {
            const res = await resolveBarcode(barcodes[0].rawValue);
            handleBarcodeFound(res.brandId, res.name, res.parentCompany);
            return;
          }
        } catch {
          // Fallback
        }
      }
      setCameraError(
        lang === "id"
          ? "Barcode tidak terbaca pada foto ini. Silakan masukkan nomor barcode secara manual."
          : "Barcode not recognized in photo. Please enter code manually."
      );
    };
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Camera size={18} />
            <span>{lang === "id" ? "Pemindai Barcode Produk" : "Product Barcode Scanner"}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {hasTorch && (
              <button
                type="button"
                className={styles.closeBtn}
                onClick={toggleTorch}
                title={torchOn ? "Matikan Flash" : "Nyalakan Flash"}
                style={{ color: torchOn ? "#eab308" : undefined }}
              >
                <Flashlight size={18} />
              </button>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => fileInputRef.current?.click()}
              title={lang === "id" ? "Unggah Foto Barcode" : "Upload Barcode Photo"}
            >
              <Upload size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.viewfinderContainer}>
          <div className={styles.viewfinder}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: scanning ? "block" : "none",
              }}
            />

            {/* Viewfinder Bounding Corners */}
            <div className={`${styles.corner} ${styles.tl}`} />
            <div className={`${styles.corner} ${styles.tr}`} />
            <div className={`${styles.corner} ${styles.bl}`} />
            <div className={`${styles.corner} ${styles.br}`} />
            
            {scanning && <div className={styles.scanLine} />}

            {/* Error or Fallback state */}
            {cameraError && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center",
                background: "rgba(15,23,42,0.9)",
                color: "#fff",
                gap: 12
              }}>
                <AlertCircle size={32} color="#f87171" />
                <p style={{ fontSize: 13, opacity: 0.9 }}>{cameraError}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={startCamera}
                  style={{ marginTop: 4 }}
                >
                  <RefreshCw size={14} /> {lang === "id" ? "Coba Lagi" : "Retry Camera"}
                </button>
              </div>
            )}

            {/* Resolved Brand Overlay */}
            {resolvedResult && (
              <div className={styles.foundOverlay}>
                <div className={styles.foundCard}>
                  <Zap size={24} className={styles.foundIcon} />
                  <div className={styles.foundInfo}>
                    <div className={styles.foundName}>{resolvedResult.name}</div>
                    <div className={styles.foundCat}>{resolvedResult.parentCompany || "Verified Brand"}</div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      router.push(`/brand/${resolvedResult.brandId}`);
                      onClose();
                    }}
                  >
                    View <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Barcode Input & Quick Pills */}
        <div className={styles.footer}>
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                className="input"
                placeholder={lang === "id" ? "Ketik 13-digit EAN barcode (contoh: 8998866200224)..." : "Enter 13-digit EAN barcode..."}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{ width: "100%", paddingLeft: 36, fontSize: 13 }}
              />
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isResolving || !manualCode.trim()}>
              {isResolving ? "..." : (lang === "id" ? "Cari" : "Search")}
            </button>
          </form>

          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            {lang === "id" ? "Uji Coba Cepat Barcode FMCG:" : "Quick FMCG Barcode Tests:"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {QUICK_TEST_CODES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="btn btn-outline btn-xs"
                style={{ fontSize: 11, padding: "4px 8px" }}
                onClick={async () => {
                  setManualCode(t.code);
                  setIsResolving(true);
                  const res = await resolveBarcode(t.code);
                  handleBarcodeFound(res.brandId, res.name, res.parentCompany);
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

