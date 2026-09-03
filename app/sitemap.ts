import type { MetadataRoute } from "next";
import communesData from "@/data/communes.json";
import type { Commune } from "@/data/commune";

const communes = communesData as Commune[];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/vtc`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...communes.map(
      (c): MetadataRoute.Sitemap[number] => ({
        url: `${base}/vtc/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
  ];
}
