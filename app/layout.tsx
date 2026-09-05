import type { Metadata } from "next";
import { Geist_Mono, Inter, Montserrat } from "next/font/google";
import { BUSINESS } from "@/lib/constants";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { Providers } from "@/lib/query-client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyCallButton } from "@/components/layout/sticky-call-button";
import "./globals.css";
import "material-symbols/outlined.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Chauffeur VTC L'Haÿ-les-Roses & Île-de-France 24h/24 | Jhon Doe";
const DESCRIPTION =
  "Chauffeur privé VTC à L'Haÿ-les-Roses et en Île-de-France, 24h/24 et 7j/7. Transferts aéroport à prix fixe (Orly, CDG, Beauvais), gares, affaires, province. Réservez en direct.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: BUSINESS.name,
    locale: "fr_FR",
    type: "website",
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd()),
          }}
        />
        <Providers>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <StickyCallButton />
        </Providers>
      </body>
    </html>
  );
}
