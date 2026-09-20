import type { MetadataRoute } from "next";

const SITE = "https://www.bubbleboxatl.com";

// Only public, indexable pages belong here. /login, /account and /pro are
// gated or useless in search results, so they stay out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/book`,    lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/join`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];
}
