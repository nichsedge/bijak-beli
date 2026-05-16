"use client";

import Link from "next/link";
import { PRESET_PROFILES } from "@/lib/types";
import { useApp } from "./AppProvider";
import styles from "../app/home.module.css";

export default function PresetSelector() {
  const { lang, setPreset, prefs } = useApp();

  return (
    <div className={styles.presets}>
      {Object.entries(PRESET_PROFILES).map(([key, profile]) => (
        <button
          key={key}
          className={`${styles.presetChip} ${prefs.preset === key ? styles.presetActive : ""}`}
          onClick={() => setPreset(key)}
        >
          {lang === "id" ? profile.labelId : profile.label}
        </button>
      ))}
      <Link href="/values" className={`${styles.presetChip} ${styles.presetCustom}`}>
        ⚙ {lang === "id" ? "Kustomisasi" : "Customize"}
      </Link>
    </div>
  );
}
