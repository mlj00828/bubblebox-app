import type { Metadata, Viewport } from "next";
import "./globals.css";

// Every canonical/OG URL resolves against this. Without it, Next emits
// relative URLs and Google is free to pick its own canonical — which is
// how bubbleboxatl.com fell out of the index.
const SITE = "https://www.bubbleboxatl.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "BubbleBox ATL — Professional Cleaning Services in Atlanta",
    template: "%s · BubbleBox ATL",
  },
  description:
    "Book a standard, deep, move-in/out, Airbnb turnover, office, or post-construction clean in Atlanta. Vetted, background-checked cleaners. Flat pricing from $99, booked online in minutes.",
  applicationName: "BubbleBox ATL",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BubbleBox ATL",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "BubbleBox ATL — Professional Cleaning Services in Atlanta",
    description:
      "Standard, deep, move-in/out, Airbnb turnover, office and post-construction cleaning across Atlanta & Metro Atlanta. Book online in 60 seconds.",
    url: SITE,
    siteName: "BubbleBox ATL",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1D7FE8",
};

// Tells Google what to call the site in search results, instead of
// falling back to the bare domain "bubbleboxatl.com".
const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BubbleBox ATL",
  alternateName: "BubbleBox",
  url: SITE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});})}`,
          }}
        />
      </body>
    </html>
  );
}
