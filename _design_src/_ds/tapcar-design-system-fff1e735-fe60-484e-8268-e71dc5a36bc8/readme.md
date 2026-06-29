# TapCar — Design System

> Branded design system for **TapCar**, a Chilean web app that stores and manages a vehicle's documentation to streamline roadside inspections (*fiscalización vehicular en ruta*). It's built for companies to manage their vehicle fleets simply: each vehicle links to an NFC chip that opens a **public, read-only ficha** (`/v/<token>`) of its documents, so a carabinero can validate paperwork with a tap. Owners manage vehicles and documents after signing in, and get email reminders before each expiry.

This folder is the brand's source of truth for type, color, spacing, components and full-screen recreations. The compiler bundles the components into a runtime library; the **Design System** tab renders every specimen card.

## Sources

Everything here was reverse-engineered from the product codebase. If you have access, explore it to build more faithfully:

- **GitHub:** [`lukas-code-master-ctp/nfc`](https://github.com/lukas-code-master-ctp/nfc) (branch `master`) — the Next.js 16 + Tailwind v4 + Firebase app. Design tokens live in `app/globals.css` (`@theme`); components in `components/`; screens in `app/`.

No Figma, slide decks, or standalone logo assets were provided. The TapCar wordmark and mark in `assets/` were reconstructed from the product's own brand mark (the Lucide *car* glyph in a soft-azul chip) used throughout the app — see **Caveats**.

---

## Content fundamentals

How TapCar writes. All copy is **Spanish (neutral Chilean)**.

- **Voice — "tú", never "vos".** Direct and second-person: *"Registra tu primer vehículo"*, *"Ingresa para gestionar la documentación de tus vehículos"*, *"Graba esta URL en el chip NFC"*. Instructions are imperative.
- **Tone — plain, reassuring, operational.** No marketing flourish, no exclamation except a small confirmation (*"¡Copiado!"*, *"Guardado ✓"*). It reads like a competent tool, not a brand shouting.
- **Casing — sentence case everywhere** for UI text and headings (*"Mis vehículos"*, *"Datos de la empresa"*, *"Nuevo vehículo"*). The ONE exception is small eyebrow labels, set UPPERCASE with wide tracking (*"DOCUMENTACIÓN"*). Document type names are Title Case proper nouns (*"Permiso de Circulación"*, *"Revisión Técnica"*, *"SOAP"*).
- **Domain vocabulary (use verbatim):** *ficha* (the document sheet), *patente* (license plate), *fiscalización* (roadside inspection), *vencimiento* / *vence el…* (expiry), *Permiso de Circulación, Revisión Técnica, SOAP, Certificado de Gases, Padrón* (the Chilean document types), *RUT*, *razón social*, *giro* (company fields).
- **Status language is fixed.** Documents: *Vigente · Por vencer · Vencido · Sin vencimiento*. Vehicles (summary of worst doc): *Al día · Documentos por vencer · Documentos vencidos · Sin vencimientos*.
- **Counts are pluralized in full:** *"1 vehículo registrado"* / *"3 vehículos registrados"*; *"1 archivo"* / *"4 archivos"*.
- **Microcopy is short and concrete.** Empty states explain the next action: *"Registra tu primer vehículo para empezar a guardar su documentación."* Errors are one calm line: *"Credenciales inválidas."*, *"No se pudo crear el vehículo."*
- **No emoji.** A single check glyph (`✓`) appears in a save confirmation; otherwise meaning is carried by icons and color, never emoji.

---

## Visual foundations

The look is a **calm, trustworthy utility** — a light, document-grade interface where status color does the talking.

- **Color.** Cool neutrals on an off-white **lienzo** (`#f6f7f9`) background; **white superficie** cards. One brand accent: **azul** `#2952e6` (CTAs, links, the icon chips), darkening to **azul-press** `#1e3dae` on hover/active. **Ámbar** `#f59e0b` is a sparingly-used warm accent. The entire app is **light only — no dark mode.** A traffic-light status system underpins everything: **vigente** green, **por-vencer** amber, **vencido** red, each as a soft-bg / saturated-text pair for badges.
- **Type.** **Geist Sans** for all UI; **Geist Mono** for tokens, RUT, patentes and NFC URLs. Headings are **bold (700) with tight tracking (-0.02em)**; body is regular on **acero** `#5b6573` for secondary text. Sizes track Tailwind's scale (12 → 30px in app screens).
- **Backgrounds.** Flat. No photography, no illustration, no gradients, no texture or pattern. Depth comes only from the lienzo/superficie value step plus a hairline border and a soft shadow.
- **Cards.** The defining element: **white, `rounded-2xl` (16px), 1px `linea` border, soft low shadow** (`shadow-sm`). Clickable cards lift to `shadow-md` on hover. Empty states reuse the card shape with a **dashed** border and translucent fill.
- **The icon-chip motif.** Icons sit inside a **soft-tinted rounded square** — `azul/10` fill with an azul icon (`rounded-xl`, 12px). It's the brand mark, the header logo, and the lead element on vehicle/section cards. Status-tinted variants exist for emphasis.
- **Radii.** 8px buttons & inputs · 12px chips & menus · 16px cards & panels · full pill for badges & avatars.
- **Borders & dividers.** Always 1px `linea` `#e3e6ea`. In-card sections are separated by a top hairline border + padding, not heavy rules.
- **Shadows.** Soft, low, neutral (tinted with the near-black `#16191f`). **No colored glows, no neon.** Three steps: `sm` at rest, `md` on hover, `lg` for menus/overlays.
- **Hover / press.** Primary button darkens (azul → azul-press). Secondary/ghost fills with a faint lienzo or azul-soft wash. Cards raise their shadow. **No scale/translate transforms, no bounce.**
- **Motion.** Restrained. Color/shadow transitions ~200ms on a standard ease (`cubic-bezier(0.4,0,0.2,1)`). Menus appear instantly. There are **no decorative or looping animations.**
- **Transparency & blur.** Used in exactly one place: the **sticky header** is `superficie/80` with a `backdrop-blur`. Focus rings are a soft `azul/20` (3px). Otherwise surfaces are opaque.
- **Layout.** Single-column, centered, generous. App screens cap at **`max-w-2xl` (672px)**, the public ficha at `max-w-xl` (576px), login at `max-w-sm` (384px). Vertical rhythm is 24–32px between sections; cards are padded 16–24px.
- **Inputs.** White field, 1px `linea` border, 8px radius; on focus the border turns azul with a soft azul/20 ring. Labels are `acero`, 14px medium, above the field. Placeholders are `acero` at ~45% opacity.

---

## Iconography

- **System: [Lucide](https://lucide.dev)** (stroke `1.8`, occasionally `2` for small/standalone glyphs; round caps and joins; `24×24` viewBox). The product hand-inlines Lucide paths as SVG — confirmed across the car, NFC-wave, user, credit-card, log-out, eye / eye-off, alert-triangle, file-text, refresh, chevron and plus glyphs.
- **Format: inline SVG**, colored with `currentColor` so a glyph inherits its chip/text color. No icon font, no sprite sheet, no PNG icons.
- **Brand glyphs.** The **car** marks vehicles and the brand; the **NFC wave** marks the public-ficha link. Both are saved in `assets/` (`logo-mark.svg`, `logo-lockup.svg`, `icon-nfc.svg`).
- **The Google "G"** on the login button is its own multicolor brand SVG (not Lucide) — keep its official four-color fills.
- **No emoji as icons.** Status is communicated by the badge color + word, never an emoji. The only non-Lucide glyph in copy is a `✓` in the "Guardado ✓" confirmation.
- **Usage:** when building new TapCar screens, pull glyphs from Lucide (CDN or inline) at matching stroke weight. Don't hand-draw replacements or mix in a second icon family.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this); `@import`s the token + font closure only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skills front-matter for use in Claude Code.

**Tokens** (`tokens/`, each `@import`ed by `styles.css`)
- `colors.css` — neutrals, brand accents, status colors, badge pairs, semantic aliases.
- `typography.css` — Geist families, size scale, weights, line-height, tracking, type roles.
- `spacing.css` — spacing scale, radii, shadows, container widths, motion.
- `fonts.css` — Geist + Geist Mono webfonts (Google Fonts).

**Foundation cards** (`foundations/`) — Design System tab specimens for Colors, Type, Spacing, Brand.

**Components** (`components/`) — reusable primitives, exported under `window.TapCarDesignSystem_fff1e7`:
- `core/` — **Button**, **StatusBadge**, **IconChip**, **Card**, **Avatar**
- `forms/` — **TextField**, **PasswordInput**
- `product/` — **VehicleCard**, **DocumentRow**, **NfcLinkPanel**

**UI kit** (`ui_kits/app/`) — interactive click-through of the TapCar app: login → dashboard → vehicle detail → public NFC ficha. See its `README.md`.

**Assets** (`assets/`) — `logo-mark.svg`, `logo-lockup.svg`, `logo-lockup-white.svg`, `icon-nfc.svg`.

---

## Caveats

- **Fonts substituted from Google Fonts.** The app uses Vercel's **Geist** via `next/font`; I load Geist + Geist Mono from Google Fonts so consumers render the exact families. If you have the licensed font binaries, drop them in and swap `tokens/fonts.css` to `@font-face`.
- **Logo reconstructed.** No standalone logo file ships in the repo (only Next.js default SVGs). The TapCar mark/lockup in `assets/` was rebuilt from the product's actual brand element (Lucide car in an azul chip) and the "TapCar" name from `CLAUDE.md`. If there's an official logo, replace these three files.
- **`tapcar.cl` is the intended domain** (per the repo's `CLAUDE.md`, unregistered as of 2026-06-28). Sample NFC URLs use it.
