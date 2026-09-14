"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./AppProvider";
import { fetchBrandById } from "@/lib/api";
import type { Brand } from "@/lib/types";
import styles from "./ComparisonBar.module.css";

export default function ComparisonBar() {
  const { prefs, clearComparison, toggleCompare, lang, t } = useApp();
  const [brands, setBrands] = useState<Brand[]>([]);
  const ids = useMemo(() => prefs.compareIds || [], [prefs.compareIds]);

  useEffect(() => {
    async function load() {
      if (ids.length === 0) {
        setBrands([]);
        return;
      }
      const loaded = await Promise.all(ids.map(id => fetchBrandById(id)));
      setBrands(loaded.filter(Boolean) as Brand[]);
    }
    load();
  }, [ids]);

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div 
          className={styles.bar}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={`container ${styles.inner}`}>
            <div className={styles.left}>
              <div className={styles.countBadge}>
                <Scale size={16} />
                <span>{ids.length}</span>
              </div>
              <div className={styles.label}>
                {t("common", "compare")}
              </div>
            </div>

            <div className={styles.brands}>
              <AnimatePresence>
                {brands.map((brand) => (
                  <motion.div 
                    key={brand.id} 
                    className={styles.brandChip}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <div className={styles.brandLogo}>{brand.name[0]}</div>
                    <span className={styles.brandName}>{brand.name}</span>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => toggleCompare(brand.id)}
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {ids.length < 2 && (
                <div className={styles.hint}>
                  {lang === "id" ? "Pilih minimal 2 brand..." : "Select at least 2 brands..."}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <button className={styles.clearBtn} onClick={clearComparison}>
                <Trash2 size={16} />
              </button>
              <Link 
                href="/compare" 
                className={`btn btn-primary btn-sm ${ids.length < 2 ? styles.disabled : ""}`}
                onClick={(e) => ids.length < 2 && e.preventDefault()}
              >
                {t("common", "compare")}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
