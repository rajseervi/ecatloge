import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vishnuagency.co.in/";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/scan`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
  ];

  // Fetch all product IDs for dynamic product pages
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${siteUrl}/api/products?limit=1000`);
    const data = await res.json();
    if (data?.products?.length) {
      productUrls = data.products.map(
        (p: { id: string }): MetadataRoute.Sitemap[number] => ({
          url: `${siteUrl}/product/${p.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      );
    }
  } catch {
    // Fallback: just include static pages
  }

  return [...staticPages, ...productUrls];
}
