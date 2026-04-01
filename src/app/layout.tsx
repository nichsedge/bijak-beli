import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Bijak Beli — Belanja Lebih Bijak Sesuai Nilaimu",
  description:
    "Platform transparansi brand untuk konsumen bijak. Cek skor halal, etika, ESG, dan netralitas politik brand favorit Anda sebelum membeli.",
  keywords: ["halal", "ethical consumer", "ESG", "boycott", "brand transparency", "Muslim consumer", "Indonesia"],
  openGraph: {
    title: "Bijak Beli",
    description: "Kenali nilai di balik brand yang kamu beli.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AppProvider>
          <Header />
          <main className="page-content">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
