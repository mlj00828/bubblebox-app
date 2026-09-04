"use client";

import { LANGS, type Lang } from "@/lib/i18n-join";

// Real SVG flags. Emoji flags (🇺🇸) do not render on Windows — it shows the
// letter pair instead — so the flags are drawn inline to work everywhere.
function Flag({ id }: { id: Lang }) {
  const common = { width: 20, height: 14, viewBox: "0 0 22 15" } as const;
  if (id === "en") {
    return (
      <svg {...common} aria-hidden>
        <rect width="22" height="15" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((y) => (
          <rect key={y} y={y * 1.153} width="22" height="1.153" fill="#B22234" />
        ))}
        <rect width="9" height="8.07" fill="#3C3B6E" />
      </svg>
    );
  }
  if (id === "es") {
    return (
      <svg {...common} aria-hidden>
        <rect width="22" height="15" fill="#AA151B" />
        <rect y="3.75" width="22" height="7.5" fill="#F1BF00" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <rect width="22" height="15" fill="#009B3A" />
      <path d="M11 1.6 20.4 7.5 11 13.4 1.6 7.5Z" fill="#FEDF00" />
      <circle cx="11" cy="7.5" r="3.2" fill="#002776" />
    </svg>
  );
}

export function FlagSwitcher({
  lang,
  onChange,
  compact = false,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
      {LANGS.map((l) => {
        const active = lang === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            title={l.label}
            aria-label={l.label}
            aria-pressed={active}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
              borderRadius: 6,
              cursor: "pointer",
              background: active ? "var(--color-surface)" : "transparent",
              border: `1.5px solid ${active ? "var(--color-accent)" : "transparent"}`,
              opacity: active ? 1 : 0.5,
              transition: "all 0.15s",
              lineHeight: 0,
            }}
          >
            <Flag id={l.id} />
          </button>
        );
      })}
    </div>
  );
}
