"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEFAULT_WEIGHTS, PRESET_PROFILES, type UserPreferences } from "@/lib/types";

interface AppContextType {
  prefs: UserPreferences;
  setLanguage: (lang: "id" | "en") => void;
  setDarkMode: (dark: boolean) => void;
  setWeights: (weights: UserPreferences["weights"]) => void;
  setPreset: (preset: string) => void;
  t: (namespace: string, key: string) => string;
  lang: "id" | "en";
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Simple client-side i18n
const messages: Record<string, Record<string, unknown>> = {};

async function loadMessages(lang: "id" | "en") {
  if (!messages[lang]) {
    const mod = await import(`../../messages/${lang}.json`);
    messages[lang] = mod.default;
  }
  return messages[lang];
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>({
    weights: DEFAULT_WEIGHTS,
    language: "id",
    darkMode: false,
  });
  const [msgs, setMsgs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    // Load saved prefs
    try {
      const saved = localStorage.getItem("bijak-beli-prefs");
      if (saved) {
        const parsed = JSON.parse(saved) as UserPreferences;
        setPrefs(parsed);
        applyDarkMode(parsed.darkMode);
        loadMessages(parsed.language).then(setMsgs);
        return;
      }
    } catch {}

    // Default
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setPrefs((p) => ({ ...p, darkMode: dark }));
    applyDarkMode(dark);
    loadMessages("id").then(setMsgs);
  }, []);

  function applyDarkMode(dark: boolean) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }

  function savePrefs(updated: UserPreferences) {
    setPrefs(updated);
    localStorage.setItem("bijak-beli-prefs", JSON.stringify(updated));
    // Update cookie for SSR
    document.cookie = `locale=${updated.language};path=/;max-age=31536000`;
  }

  function setLanguage(lang: "id" | "en") {
    const updated = { ...prefs, language: lang };
    savePrefs(updated);
    loadMessages(lang).then(setMsgs);
  }

  function setDarkMode(dark: boolean) {
    applyDarkMode(dark);
    savePrefs({ ...prefs, darkMode: dark });
  }

  function setWeights(weights: UserPreferences["weights"]) {
    savePrefs({ ...prefs, weights });
  }

  function setPreset(preset: string) {
    const profile = PRESET_PROFILES[preset];
    if (profile) {
      savePrefs({ ...prefs, weights: profile.weights, preset });
    }
  }

  function t(namespace: string, key: string): string {
    const ns = msgs[namespace] as Record<string, unknown> | undefined;
    if (!ns) return key;
    return getNestedValue(ns as Record<string, unknown>, key) || key;
  }

  return (
    <AppContext.Provider value={{
      prefs,
      setLanguage,
      setDarkMode,
      setWeights,
      setPreset,
      t: (ns, key) => t(ns, key),
      lang: prefs.language,
    }}>
      {children}
    </AppContext.Provider>
  );
}
