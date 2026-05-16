"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Maximize, X, Zap, Camera, RefreshCw } from "lucide-react";
import { fetchAllBrands } from "@/lib/api";
import type { Brand } from "@/lib/types";
import styles from "./ScannerModal.module.css";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScannerModal({ isOpen, onClose }: ScannerModalProps) {
  const [scanning, setScanning] = useState(false);
  const [foundBrand, setFoundBrand] = useState<Brand | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScan();
    } else {
      resetScan();
    }
    return () => resetScan();
  }, [isOpen]);

  async function startScan() {
    setScanning(true);
    setProgress(0);
    setFoundBrand(null);

    // Mock scanning progress
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        completeScan();
      }
    }, 100);
  }

  async function completeScan() {
    const brands = await fetchAllBrands();
    // Pick a random brand to "find"
    const random = brands[Math.floor(Math.random() * brands.length)];
    setFoundBrand(random);
    setScanning(false);
  }

  function resetScan() {
    setScanning(false);
    setProgress(0);
    setFoundBrand(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleGoToBrand() {
    if (foundBrand) {
      router.push(`/brand/${foundBrand.id}`);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Camera size={18} />
            <span>Product Scanner</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.viewfinderContainer}>
          {/* Viewfinder area */}
          <div className={styles.viewfinder}>
            <div className={`${styles.corner} ${styles.tl}`} />
            <div className={`${styles.corner} ${styles.tr}`} />
            <div className={`${styles.corner} ${styles.bl}`} />
            <div className={`${styles.corner} ${styles.br}`} />
            
            <div className={styles.scanLine} />

            {/* Scanning overlay */}
            {scanning && (
              <div className={styles.scanningText}>
                Scanning product... {progress}%
              </div>
            )}

            {/* Found overlay */}
            {foundBrand && (
              <div className={styles.foundOverlay}>
                <div className={styles.foundCard}>
                  <Zap size={24} className={styles.foundIcon} />
                  <div className={styles.foundInfo}>
                    <div className={styles.foundName}>{foundBrand.name}</div>
                    <div className={styles.foundCat}>{foundBrand.category}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleGoToBrand}>
                    View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.hint}>
            Align the barcode or product logo within the frame
          </p>
          <div className={styles.actions}>
            <button className="btn btn-ghost" onClick={startScan} disabled={scanning}>
              <RefreshCw size={16} className={scanning ? styles.spin : ""} />
              Rescan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
