# BubbleBox App

The BubbleBox cleaning marketplace web app. Next.js 16 + Tailwind CSS v4, deployed as a PWA on Vercel.

**Live:** https://homeproatl.xyz

## Stack

- **Next.js 16** with App Router (TypeScript)
- **Tailwind CSS v4** with custom Bubble Pale design tokens
- **PWA** via manifest + service worker (installable to home screen)
- **Vercel** hosting (free tier, auto-deploy on git push)
- **Backend API:** https://api.homeproatl.xyz (separate Bubblebox2.0 repo)

## Routes

| Path | Purpose |
|---|---|
| `/` | Marketing home page with services + CTAs |
| `/book` | 5-step booking wizard |
| `/book/confirm/:id` | Post-submit confirmation |
| `/sms-terms` | SMS Terms (required for Twilio A2P 10DLC) |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |

## Local development

```bash
npm install
npm run dev
```

App runs at http://localhost:3000.

By default it talks to the production backend at `https://api.homeproatl.xyz`. To point at a different backend, create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Build for production

```bash
npm run build
npm start
```

## Design tokens

Defined in `app/globals.css` via Tailwind v4's `@theme`. Palette is "Bubble Pale":

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#F0FBFF` | Page background (pale cyan) |
| `--color-surface` | `#D6F3FC` | Cards, buttons |
| `--color-accent` | `#0EA5E9` | CTAs, primary actions |
| `--color-accent-deep` | `#0369A1` | Text on light surfaces |
| `--color-ink` | `#0F1729` | Body text |
| `--color-muted` | `#64748B` | Secondary text |

Fonts:
- **Display:** Fraunces (serif, used for headings)
- **Sans:** Inter (used for body and UI)

## Deploy

Auto-deployed via Vercel on `git push origin main`.

For initial deploy:
```bash
npx vercel
```

Then connect the repo to the Vercel project at https://vercel.com/dashboard.
