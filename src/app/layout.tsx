import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import CatalogFooter from "@/components/CatalogFooter";
import JsonLd from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vishnuagency.co.in/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vishnu Agency, Patancheru , Plumbing & Sanitaryware Dealer in Hyderabad | Ashirvad, Hindware, Watertec Distributor ",
    template: "%s | Vishnu Agency, Patancheru Hyderabad",
  },
  description:
    "Vishnu Agency, Patancheru is your trusted dealer for plumbing solutions, sanitaryware, water storage tanks, and bath fittings in Hyderabad. Authorized distributor of Ashirvad, Hindware, and Watertec. Call now!",
  keywords: [
    "plumbing dealer Hyderabad",
    "sanitaryware showroom Hyderabad",
    "Ashirvad pipes Hyderabad",
    "water storage tank dealer",
    "Hindware sanitaryware Hyderabad",
    "bath fittings Hyderabad",
    "plumbing solutions Hyderabad",
    "Vishnu Agency, Patancheru",
    "plumbing items Hyderabad",
    "PTMT taps Hyderabad",
  ],
  authors: [{ name: "Vishnu Agency, Patancheru" }],
  creator: "Vishnu Agency, Patancheru",
  publisher: "Vishnu Agency, Patancheru",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Vishnu Agency, Patancheru",
    title: "Vishnu Agency, Patancheru – Plumbing & Sanitaryware Dealer in Hyderabad",
    description:
      "Authorized dealer of Ashirvad, Hindware & Watertec. Premium plumbing solutions, sanitaryware, and water storage tanks in Hyderabad.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vishnu Agency, Patancheru – Plumbing & Sanitaryware Hyderabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishnu Agency, Patancheru – Plumbing & Sanitaryware Hyderabad",
    description:
      "Trusted dealer for Ashirvad pipes, Hindware sanitaryware & Watertec bath fittings in Hyderabad.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
  category: "Plumbing & Sanitaryware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-P8F4CTYNES"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P8F4CTYNES');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <SessionProvider>
          {/* JSON-LD Structured Data */}
          <JsonLd
            schema={{
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Vishnu Agency, Patancheru",
              image: `${siteUrl}/og-image.png`,
              url: siteUrl,
              telephone: "+91-9828953495",
              email: "hello@vishnuagency.co.in",
              description:
                "Authorized distributor of Ashirvad pipes, Hindware sanitaryware, and Watertec bath fittings in Hyderabad. We provide premium plumbing solutions, water storage tanks, and sanitaryware.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Market Street, Suite 400",
                addressLocality: "Hyderabad",
                addressRegion: "Telangana",
                postalCode: "500001",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 17.385,
                longitude: 78.4867,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "09:30",
                  closes: "19:30",
                },
              ],
              areaServed: [
                {
                  "@type": "City",
                  name: "Hyderabad",
                },
                {
                  "@type": "City",
                  name: "Secunderabad",
                },
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Plumbing & Sanitaryware Products",
                itemListElement: [
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Ashirvad Pipes" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Ashirvad Water Tanks" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Hindware Sanitaryware" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Watertec Bath Fittings" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "PTMT Taps & Mixers" } },
                ],
              },
              sameAs: [
                siteUrl,
              ],
            }}
          />
          <main className="flex-1">{children}</main>
          <CatalogFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
