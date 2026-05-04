export type ServiceId =
  | "standard-cleaning"
  | "airbnb-turnover"
  | "office-cleaning"
  | "deep-cleaning"
  | "move-in-out"
  | "post-construction";

export interface Service {
  id: ServiceId;
  name: string;
  icon: string;
  shortDescription: string;
  longDescription: string;
  basePriceCents: number;
  durationHint: string;
  imageUrl: string;
  imageAlt: string;
  popular?: boolean;
}

const UNSPLASH = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const SERVICES: Service[] = [
  {
    id: "standard-cleaning",
    name: "Standard Cleaning",
    icon: "🧹",
    shortDescription: "Regular maintenance clean",
    longDescription: "Kitchen, bathrooms, dusting, vacuum, mop. Perfect for keeping a tidy home tidy.",
    basePriceCents: 9900,
    durationHint: "~3 hrs",
    imageUrl: UNSPLASH("photo-1556909114-f6e7ad7d3136", 600, 400),
    imageAlt: "Clean modern living room with natural light",
    popular: true,
  },
  {
    id: "airbnb-turnover",
    name: "Airbnb Turnover",
    icon: "🏠",
    shortDescription: "Fast turnover between guests",
    longDescription: "Linens, restock, photo-ready in under two hours. Built for short-term rental hosts.",
    basePriceCents: 10900,
    durationHint: "~2 hrs",
    imageUrl: UNSPLASH("photo-1540518614846-7eded433c457", 600, 400),
    imageAlt: "Freshly made bed in a bright bedroom",
  },
  {
    id: "deep-cleaning",
    name: "Deep Cleaning",
    icon: "✨",
    shortDescription: "Top-to-bottom detailed clean",
    longDescription: "Baseboards, inside appliances, detailed bathrooms. The works. Recommended quarterly.",
    basePriceCents: 16900,
    durationHint: "~5 hrs",
    imageUrl: UNSPLASH("photo-1584622650111-993a426fbf0a", 600, 400),
    imageAlt: "Sparkling clean bathroom",
  },
  {
    id: "move-in-out",
    name: "Move In / Out",
    icon: "📦",
    shortDescription: "Empty home deep clean",
    longDescription: "Inside cabinets, drawers, appliances. Move-ready or deposit-ready when we leave.",
    basePriceCents: 21900,
    durationHint: "~6 hrs",
    imageUrl: UNSPLASH("photo-1502672260266-1c1ef2d93688", 600, 400),
    imageAlt: "Empty apartment with morning light",
  },
  {
    id: "post-construction",
    name: "Post-Construction",
    icon: "🏗️",
    shortDescription: "Cleanup after renovation",
    longDescription: "Heavy-duty dust, debris, fine particles, finishes. Bring your home back from the construction zone.",
    basePriceCents: 27900,
    durationHint: "~7 hrs",
    imageUrl: UNSPLASH("photo-1600585154340-be6161a56a0c", 600, 400),
    imageAlt: "Newly finished modern home interior",
  },
  {
    id: "office-cleaning",
    name: "Office / Commercial",
    icon: "🏢",
    shortDescription: "Small office spaces",
    longDescription: "Desks, restrooms, common areas, trash. After-hours scheduling available.",
    basePriceCents: 12900,
    durationHint: "~3 hrs",
    imageUrl: UNSPLASH("photo-1497366216548-37526070297c", 600, 400),
    imageAlt: "Clean modern office workspace",
  },
];

export function getService(id: ServiceId): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
