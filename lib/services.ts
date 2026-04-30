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
}

export const SERVICES: Service[] = [
  {
    id: "standard-cleaning",
    name: "Standard Cleaning",
    icon: "🧹",
    shortDescription: "Regular maintenance clean",
    longDescription:
      "Kitchen, bathrooms, dusting, vacuum, mop. Perfect for keeping a tidy home tidy.",
    basePriceCents: 9900,
    durationHint: "~3 hrs",
  },
  {
    id: "airbnb-turnover",
    name: "Airbnb Turnover",
    icon: "🏠",
    shortDescription: "Fast turnover between guests",
    longDescription:
      "Linens, restock, photo-ready in under two hours. Built for short-term rental hosts.",
    basePriceCents: 10900,
    durationHint: "~2 hrs",
  },
  {
    id: "office-cleaning",
    name: "Office Cleaning",
    icon: "🏢",
    shortDescription: "Small office spaces",
    longDescription:
      "Desks, restrooms, common areas, trash. After-hours scheduling available.",
    basePriceCents: 12900,
    durationHint: "~3 hrs",
  },
  {
    id: "deep-cleaning",
    name: "Deep Cleaning",
    icon: "✨",
    shortDescription: "Top-to-bottom detailed clean",
    longDescription:
      "Baseboards, inside appliances, detailed bathrooms. The works. Recommended quarterly.",
    basePriceCents: 16900,
    durationHint: "~5 hrs",
  },
  {
    id: "move-in-out",
    name: "Move In / Out",
    icon: "📦",
    shortDescription: "Empty home deep clean",
    longDescription:
      "Inside cabinets, drawers, appliances. Move-ready or deposit-ready when we leave.",
    basePriceCents: 21900,
    durationHint: "~6 hrs",
  },
  {
    id: "post-construction",
    name: "Post-Construction",
    icon: "🔨",
    shortDescription: "Cleanup after renovation",
    longDescription:
      "Heavy-duty dust, debris, fine particles, finishes. Bring your home back from the construction zone.",
    basePriceCents: 27900,
    durationHint: "~7 hrs",
  },
];

export function getService(id: ServiceId): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
