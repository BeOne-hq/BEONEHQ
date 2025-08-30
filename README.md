# Be One — Microsite (Next.js + Tailwind)

Generated: 2025-08-30 15:30

## Quick start
```bash
npm install
npm run dev
```
Visit http://localhost:3000

## Deploy (Vercel)
1) Push this folder to a new GitHub repo (beone-hqapp).
2) In Vercel, **New Project → Import** the repo → accept defaults → Deploy.
3) Add domain **beone.com**:
   - Apex A → 76.76.21.21
   - www CNAME → cname.vercel-dns.com
4) Email (info@beone.com) — Google Workspace DNS:
   - MX: ASPMX.L.GOOGLE.COM (1), ALT1/ALT2 (5), ALT3/ALT4 (10)
   - TXT SPF: v=spf1 include:_spf.google.com ~all
   - Enable DKIM.

## Customize
- Brand constants in `components/brand.ts`.
- Service copy in `components/services.ts`.
- Logos in `/public` (`beone_mark.svg`, `beone_wordmark.svg`).

## Stack
- Next.js 14 • React 18 • Tailwind 3.4
