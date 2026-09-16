"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, Moon, Sun, Globe, Menu, X, Scale, 
  Camera, ChevronDown, Sparkles, Building2, Sliders, 
  Layers, HeartHandshake, Info, Shield
} from "lucide-react";
import { useApp } from "./AppProvider";
import ScannerModal from "./ScannerModal";
import styles from "./Header.module.css";

export default function Header() {
  const { lang, setLanguage, setDarkMode, prefs } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdown on page navigation
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setMoreOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  const primaryNav = [
    { href: "/search", label: lang === "id" ? "Jelajah Brand" : "Explore Brands", icon: Search },
    { href: "/conglomerates", label: lang === "id" ? "Konglomerasi" : "Conglomerates", icon: Building2 },
    { href: "/power", label: "Power Map", icon: Shield },
  ];

  const secondaryNav = [
    { 
      href: "/compare", 
      label: lang === "id" ? "Bandingkan Brand" : "Compare Brands", 
      icon: Scale,
      count: prefs.compareIds?.length || 0 
    },
    { href: "/values", label: lang === "id" ? "Preferensi Nilai" : "Value Preferences", icon: Sliders },
    { href: "/impact", label: lang === "id" ? "Dampak Pengeluaran" : "Spending Impact", icon: Sparkles },
    { href: "/warehouse", label: lang === "id" ? "Gudang Brand" : "Brand Warehouse", icon: Layers },
    { href: "/community", label: lang === "id" ? "Suara Komunitas" : "Community Votes", icon: HeartHandshake },
    { href: "/about", label: lang === "id" ? "Metodologi & Tentang" : "Methodology & About", icon: Info },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Scale size={19} />
          </div>
          <div className={styles.logoTextWrap}>
            <span className={styles.logoText}>Bijak Beli</span>
            <span className={styles.logoTagline}>ID</span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              id="header-search"
              type="search"
              className={styles.searchInput}
              placeholder={lang === "id" ? "Cari brand, emiten, atau taipan... (tekan enter)" : "Search brand, ticker, or tycoon..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button 
              type="button" 
              className={styles.scanTrigger} 
              onClick={() => setScannerOpen(true)}
              title={lang === "id" ? "Pindai Barcode Produk" : "Scan Product Barcode"}
            >
              <Camera size={15} />
            </button>
          </div>
        </form>

        <ScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {primaryNav.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                <Icon size={14} className={styles.navIcon} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* More Menu Dropdown */}
          <div className={styles.moreDropdownWrap} ref={moreRef}>
            <button
              type="button"
              className={`${styles.navLink} ${styles.moreTrigger} ${moreOpen ? styles.active : ""}`}
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
            >
              <span>{lang === "id" ? "Lainnya" : "More"}</span>
              {prefs.compareIds?.length > 0 && (
                <span className={styles.compareCountBadge}>{prefs.compareIds.length}</span>
              )}
              <ChevronDown size={14} className={`${styles.chevron} ${moreOpen ? styles.chevronRotated : ""}`} />
            </button>

            {moreOpen && (
              <div className={styles.moreDropdownMenu}>
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.moreMenuItem} ${isActive ? styles.moreMenuItemActive : ""}`}
                      onClick={() => setMoreOpen(false)}
                    >
                      <div className={styles.moreMenuIconWrap}>
                        <Icon size={15} />
                      </div>
                      <div className={styles.moreMenuText}>
                        <span>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span className={styles.compareCountBadge}>{item.count}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Quick Scan Button */}
          <button
            type="button"
            className={styles.scanBtn}
            onClick={() => setScannerOpen(true)}
            title={lang === "id" ? "Buka Scanner Barcode" : "Open Barcode Scanner"}
          >
            <Camera size={15} />
            <span className={styles.scanBtnLabel}>{lang === "id" ? "Pindai" : "Scan"}</span>
          </button>

          {/* Language toggle */}
          <button
            id="lang-toggle"
            className={styles.iconBtn}
            onClick={() => setLanguage(lang === "id" ? "en" : "id")}
            aria-label="Toggle language"
            title={lang === "id" ? "Ganti ke English" : "Switch to Indonesian"}
          >
            <Globe size={16} />
            <span className={styles.langLabel}>{lang.toUpperCase()}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            id="dark-mode-toggle"
            className={styles.iconBtn}
            onClick={() => setDarkMode(!prefs.darkMode)}
            aria-label="Toggle theme"
            title={prefs.darkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {prefs.darkMode ? <Sun size={17} /> : <Moon size={17} />}
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

      {/* Mobile drawer menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="search"
                className={styles.searchInput}
                placeholder={lang === "id" ? "Cari brand, emiten, atau produk..." : "Search brands, tickers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.scanTrigger} 
                onClick={() => {
                  setMenuOpen(false);
                  setScannerOpen(true);
                }}
              >
                <Camera size={16} />
              </button>
            </div>
          </form>

          <div className={styles.mobileNavSection}>
            <div className={styles.mobileSectionTitle}>
              {lang === "id" ? "Menu Utama" : "Main Navigation"}
            </div>
            <nav className={styles.mobileNav}>
              {primaryNav.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.mobileNavLink} ${isActive ? styles.active : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={17} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={styles.mobileNavSection}>
            <div className={styles.mobileSectionTitle}>
              {lang === "id" ? "Alat & Komunitas" : "Tools & Community"}
            </div>
            <nav className={styles.mobileNav}>
              {secondaryNav.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.mobileNavLink} ${isActive ? styles.active : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={17} />
                    <span>{link.label}</span>
                    {link.count !== undefined && link.count > 0 && (
                      <span className={styles.compareCountBadge}>{link.count}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

