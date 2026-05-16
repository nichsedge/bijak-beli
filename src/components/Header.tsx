"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Moon, Sun, Globe, Menu, X, Scale, Camera } from "lucide-react";
import { useApp } from "./AppProvider";
import ScannerModal from "./ScannerModal";
import styles from "./Header.module.css";

export default function Header() {
  const { lang, setLanguage, setDarkMode, prefs, t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  const navLinks = [
    { href: "/", label: t("nav", "home") },
    { href: "/search", label: t("nav", "search") },
    { href: "/values", label: t("nav", "values") },
    { href: "/compare", label: `${t("common", "compare")} (${prefs.compareIds?.length || 0})` },
    { href: "/impact", label: lang === "id" ? "Dampak" : "Impact" },
    { href: "/community", label: t("nav", "community") },
    { href: "/about", label: t("nav", "about") },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Scale size={20} />
          </div>
          <span className={styles.logoText}>Bijak Beli</span>
          <span className={styles.logoTagline}>ID</span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              id="header-search"
              type="search"
              className={`input ${styles.searchInput}`}
              placeholder={t("nav", "searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button 
              type="button" 
              className={styles.scanTrigger} 
              onClick={() => setScannerOpen(true)}
              title="Scan product"
            >
              <Camera size={16} />
            </button>
          </div>
        </form>

        <ScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />

        {/* Desktop Nav */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Language toggle */}
          <button
            id="lang-toggle"
            className={styles.iconBtn}
            onClick={() => setLanguage(lang === "id" ? "en" : "id")}
            aria-label="Toggle language"
            title={lang === "id" ? "Switch to English" : "Ganti ke Indonesia"}
          >
            <Globe size={18} />
            <span className={styles.langLabel}>{lang.toUpperCase()}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            id="dark-mode-toggle"
            className={styles.iconBtn}
            onClick={() => setDarkMode(!prefs.darkMode)}
            aria-label="Toggle dark mode"
          >
            {prefs.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle"
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {/* Mobile search */}
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="search"
                className={`input ${styles.searchInput}`}
                placeholder={t("nav", "searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
