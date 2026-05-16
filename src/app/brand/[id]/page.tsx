import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, Scale } from "lucide-react";
import { fetchBrandById, fetchAlternatives, fetchControversyById } from "@/lib/api";
import { calculateAlignment } from "@/lib/scoring";
import { cookies } from "next/headers";
import BrandDetailClient from "@/components/BrandDetailClient";
import styles from "./brand.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { id } = await params;
  const brand = await fetchBrandById(id);
  
  if (!brand) return notFound();

  const cookieStore = await cookies();
  const lang = cookieStore.get("locale")?.value === "en" ? "en" : "id";
  
  // Default weights if not in cookies (usually would be in a more robust place, but for demo...)
  const defaultWeights = { halal: 4, ethical: 3, esg: 2, political: 3, community: 1 };
  const result = calculateAlignment(brand, defaultWeights);

  const [alternatives, brandControversies] = await Promise.all([
    fetchAlternatives(brand.alternativeIds),
    Promise.all(brand.controversyIds.map(id => fetchControversyById(id)))
  ]);

  const controversies = brandControversies.filter(Boolean) as any[];

  const t = (ns: string, key: string) => {
    // Simple mock of the t function for the server side
    const strings: any = {
      en: { common: { back: "Back", compare: "Compare", comparing: "Comparing", boycott: "Boycotted" }, brand: { boycottActive: "Active Boycott" } },
      id: { common: { back: "Kembali", compare: "Bandingkan", comparing: "Membandingkan", boycott: "Diboikot" }, brand: { boycottActive: "Aktif Diboikot" } }
    };
    return strings[lang]?.[ns]?.[key] || key;
  };

  return (
    <div className={styles.page}>
      {brand.boycottActive && (
        <div className={styles.boycottBanner}>
          <div className="container">
            <div className={styles.boycottContent}>
              <AlertTriangle size={16} />
              <div>
                <strong>{t("brand", "boycottActive")}</strong>
                {brand.boycottReasonId && (
                  <p>{lang === "id" ? brand.boycottReasonId : brand.boycottReason}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className={styles.topNav}>
          <Link href="/search" className={styles.backLink}>
            <ArrowLeft size={16} />
            {t("common", "back")}
          </Link>
          {/* This button still needs to be interactive, so it might need its own small client component or be part of BrandDetailClient */}
        </div>

        <BrandDetailClient 
          brand={brand} 
          brandControversies={controversies} 
          alternatives={alternatives} 
          result={result} 
        />
      </div>
    </div>
  );
}
