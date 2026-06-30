import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://infinityplanners.nyc";
const SITE_NAME = "Infinity Planners";
const SITE_DESCRIPTION =
  "Bespoke New York Events, Masterfully Orchestrated. Luxury weddings, corporate galas, and private celebrations across NYC's premier venues.";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "New York event planner",
    "luxury wedding planner NYC",
    "corporate event planning Manhattan",
    "private gala coordination",
    "Infinity Planners",
    "NYC event design",
    "bespoke events New York",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Infinity Planners — Bespoke New York Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "event planning",
};

const jsonLdStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: "+1 (516) 344-7239",
  email: "hello@infinityplanners.nyc",
  address: {
    "@type": "PostalAddress",
    streetAddress: "545 Madison Avenue, 12th Floor",
    addressLocality: "New York",
    addressRegion: "NY",
    postalCode: "10022",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.7589,
    longitude: -73.9855,
  },
  openingHours: "Mo-Fr 09:00-18:00",
  priceRange: "$$$$",
  image: "/og-image.jpg",
  sameAs: ["https://instagram.com/infinityplanners"],
  knowsAbout: [
    "Luxury Wedding Planning",
    "Corporate Event Management",
    "Private Gala Coordination",
    "NYC Event Design",
    "Bespoke Celebration Staging",
  ],
  areaServed: {
    "@type": "City",
    name: "New York",
    sameAs: "https://en.wikipedia.org/wiki/New_York_City",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-body-md bg-[#FAFAFA] text-on-surface">
        {children}
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
      </body>
    </html>
  );
}
