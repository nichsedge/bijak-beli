"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import styles from "../app/home.module.css";

interface HeroSearchProps {
  lang: string;
}

export default function HeroSearch({ lang }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className={styles.heroSearch}>
      <div className={styles.heroSearchWrap}>
        <Search size={20} className={styles.heroSearchIcon} />
        <input
          id="hero-search"
          type="search"
          className={styles.heroSearchInput}
          placeholder={lang === "id" ? "Cari brand atau produk... contoh: Indomie, Starbucks" : "Search brand or product... e.g. Indomie, Starbucks"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className={`btn btn-primary ${styles.heroSearchBtn}`}>
          {lang === "id" ? "Cek" : "Check"}
        </button>
      </div>
    </form>
  );
}
