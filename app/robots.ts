import type { MetadataRoute } from "next";

const SITE = "https://www.bubbleboxatl.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin console, cleaner dashboard, customer account and the
        // per-booking confirmation pages have no business in search results.
        disallow: ["/admin", "/pro", "/account", "/book/confirm", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
