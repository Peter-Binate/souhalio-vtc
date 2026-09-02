import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AIRPORT_FARES, BUSINESS } from "@/lib/constants";
import { Providers } from "@/lib/query-client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyCallButton } from "@/components/layout/sticky-call-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BUSINESS.name,
  telephone: BUSINESS.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: BUSINESS.city,
    postalCode: BUSINESS.postalCode,
    addressCountry: "FR",
  },
  areaServed: ["Île-de-France", "France"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  makesOffer: [
    {
      "@type": "Offer",
      name: "Transfert aéroport Paris-Orly (prix fixe)",
      price: AIRPORT_FARES.ORLY,
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Transfert aéroport Paris-Charles de Gaulle / Roissy (prix fixe)",
      price: AIRPORT_FARES.CDG,
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Transfert aéroport Paris-Beauvais (prix fixe)",
      price: AIRPORT_FARES.BEAUVAIS,
      priceCurrency: "EUR",
    },
  ],
} as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
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
